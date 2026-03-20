import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import * as db from '../clients/db';
import * as frostClient from '../clients/frost';
import type { TemperatureRecord, DailyClimateAverage } from '../types/weather';
import { calculateDailyGdd } from './gdd';

dayjs.extend(dayOfYear);

const DATA_YEARS = 5;

export type NearbyStation = {
  id: string;
  frostApiId: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
};

export async function findNearbyStations(lat: number, lon: number): Promise<NearbyStation[]> {
  const response = await frostClient.fetchNearbyStations(lat, lon);

  if (!response.data || response.data.length === 0) {
    throw new Error('No weather stations found near this location');
  }

  const stations: NearbyStation[] = [];
  for (const source of response.data) {
    const [stationLon, stationLat] = source.geometry.coordinates;

    const station = await db.upsertStation({
      frostApiId: source.id,
      name: source.name,
      latitude: stationLat,
      longitude: stationLon,
    });

    stations.push({
      ...station,
      distanceKm: Math.round(haversineKm(lat, lon, stationLat, stationLon) * 10) / 10,
    });
  }

  return stations.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Get pre-computed daily climate averages for a station.
 * If not cached, fetches 5 years of data from Frost and computes averages.
 */
export async function getStationClimate(
  stationFrostId: string,
  stationDbId: string,
): Promise<DailyClimateAverage[]> {
  // Check if we already have averages cached
  const cached = await db.findDailyAveragesByStation(stationDbId);
  if (cached.length === 366) return cached;

  // Fetch 5 years of raw data from Frost API
  const currentYear = dayjs().year();
  const fromYear = currentYear - DATA_YEARS;
  const fromDate = `${fromYear}-01-01`;
  const toDate = `${currentYear - 1}-12-31`;

  const response = await frostClient.fetchObservations(stationFrostId, fromDate, toDate);

  if (!response.data || response.data.length === 0) {
    return [];
  }

  // Parse raw observations into daily records
  const dailyData = new Map<string, { tempMin: number; tempMax: number; tempMean: number | null }>();

  for (const obs of response.data) {
    const date = dayjs(obs.referenceTime).format('YYYY-MM-DD');
    const existing = dailyData.get(date) || { tempMin: Infinity, tempMax: -Infinity, tempMean: null };

    for (const o of obs.observations) {
      if (o.elementId === 'min(air_temperature P1D)') {
        existing.tempMin = o.value;
      } else if (o.elementId === 'max(air_temperature P1D)') {
        existing.tempMax = o.value;
      } else if (o.elementId === 'mean(air_temperature P1D)') {
        existing.tempMean = o.value;
      }
    }

    dailyData.set(date, existing);
  }

  // Build complete TemperatureRecord array (for frost/GDD computation)
  const records: TemperatureRecord[] = [];
  for (const [date, temps] of dailyData) {
    if (temps.tempMin === Infinity || temps.tempMax === -Infinity) continue;
    records.push({
      date,
      tempMin: temps.tempMin,
      tempMax: temps.tempMax,
      tempMean: temps.tempMean ?? (temps.tempMin + temps.tempMax) / 2,
    });
  }

  // Compute day-of-year averages across all years
  const averages = computeDoyAverages(records);

  // Store the 366 averages in a single batch insert
  await db.deleteDailyAveragesByStation(stationDbId);
  await db.insertDailyAverages(stationDbId, averages);

  // Derive frost dates from smoothed averages (last spring day with avgMin < 0, first autumn day)
  const frost = deriveFrostDatesFromAverages(averages);

  // Compute GDD from averages (sum of avgMean - tBase during frost-free period)
  const tBase = 5;
  const tUpper = 30;
  let avgGdd = 0;
  for (const avg of averages) {
    if (frost.lastFrostDoy && avg.dayOfYear <= frost.lastFrostDoy) continue;
    if (frost.firstFrostDoy && avg.dayOfYear >= frost.firstFrostDoy) continue;
    avgGdd += calculateDailyGdd(avg.avgMean, tBase, tUpper);
  }
  avgGdd = Math.round(avgGdd);

  const years = [...new Set(records.map((r) => dayjs(r.date).year()))].sort();

  // Store station-level metrics
  await db.updateStationClimate(stationDbId, {
    dataYearsFrom: years[0],
    dataYearsTo: years[years.length - 1],
    avgGdd,
    avgFrostFreeDays: frost.frostFreeDays,
    lastFrostSpring: frost.lastFrostSpring,
    firstFrostAutumn: frost.firstFrostAutumn,
  });

  return averages;
}

/**
 * Derive frost dates from smoothed daily averages.
 * Last spring frost = last DOY in first half where avgMin < 0.
 * First autumn frost = first DOY in second half where avgMin < 0.
 */
function deriveFrostDatesFromAverages(averages: DailyClimateAverage[]) {
  let lastFrostDoy: number | null = null;
  let firstFrostDoy: number | null = null;

  for (const avg of averages) {
    if (avg.avgMin < 0) {
      if (avg.dayOfYear <= 182) {
        lastFrostDoy = avg.dayOfYear;
      } else if (firstFrostDoy === null) {
        firstFrostDoy = avg.dayOfYear;
      }
    }
  }

  const lastFrostSpring = lastFrostDoy !== null
    ? dayjs('2024-01-01').dayOfYear(lastFrostDoy).format('MM-DD')
    : null;
  const firstFrostAutumn = firstFrostDoy !== null
    ? dayjs('2024-01-01').dayOfYear(firstFrostDoy).format('MM-DD')
    : null;
  const frostFreeDays = lastFrostDoy !== null && firstFrostDoy !== null
    ? firstFrostDoy - lastFrostDoy
    : 0;

  return { lastFrostDoy, firstFrostDoy, lastFrostSpring, firstFrostAutumn, frostFreeDays };
}

/**
 * Compute day-of-year averages (min, max, mean) across all years.
 * Applies 7-day smoothing to reduce noise.
 */
function computeDoyAverages(records: TemperatureRecord[]): DailyClimateAverage[] {
  const minSums = new Array(366).fill(0);
  const maxSums = new Array(366).fill(0);
  const meanSums = new Array(366).fill(0);
  const counts = new Array(366).fill(0);

  for (const r of records) {
    const doy = dayjs(r.date).dayOfYear() - 1; // 0-indexed
    minSums[doy] += r.tempMin;
    maxSums[doy] += r.tempMax;
    meanSums[doy] += r.tempMean;
    counts[doy]++;
  }

  // Raw averages
  const rawMin = minSums.map((s, i) => (counts[i] > 0 ? s / counts[i] : 0));
  const rawMax = maxSums.map((s, i) => (counts[i] > 0 ? s / counts[i] : 0));
  const rawMean = meanSums.map((s, i) => (counts[i] > 0 ? s / counts[i] : 0));

  // 7-day centered smoothing
  const smooth = (raw: number[]) => {
    const result = new Array(366).fill(0);
    const halfWindow = 3;
    for (let i = 0; i < 366; i++) {
      let total = 0;
      let n = 0;
      for (let j = i - halfWindow; j <= i + halfWindow; j++) {
        const idx = ((j % 366) + 366) % 366;
        if (counts[idx] > 0) {
          total += raw[idx];
          n++;
        }
      }
      result[i] = n > 0 ? Math.round((total / n) * 10) / 10 : 0;
    }
    return result;
  };

  const smoothMin = smooth(rawMin);
  const smoothMax = smooth(rawMax);
  const smoothMean = smooth(rawMean);

  return Array.from({ length: 366 }, (_, i) => ({
    dayOfYear: i + 1,
    avgMin: smoothMin[i],
    avgMax: smoothMax[i],
    avgMean: smoothMean[i],
  }));
}

// --- Helpers ---

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
