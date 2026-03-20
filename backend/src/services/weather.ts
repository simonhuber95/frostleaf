import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import * as db from '../clients/db';
import * as frostClient from '../clients/frost';
import type { TemperatureRecord, DailyClimateAverage } from '../types/weather';
import { detectFrostDates, averageFrostDates, calculateSeasonalGdd } from './gdd';

dayjs.extend(dayOfYear);

const DATA_YEARS = 5;

export async function findNearestStation(lat: number, lon: number) {
  const cached = await db.findAllStations();

  if (cached.length > 0) {
    const nearest = findNearestByDistance(cached, lat, lon);
    const distKm = haversineKm(lat, lon, nearest.latitude, nearest.longitude);
    if (distKm < 50) return nearest;
  }

  const response = await frostClient.fetchNearbyStations(lat, lon);

  if (!response.data || response.data.length === 0) {
    throw new Error('No weather stations found near this location');
  }

  const stations = [];
  for (const source of response.data) {
    const [stationLon, stationLat] = source.geometry.coordinates;

    const station = await db.upsertStation({
      frostApiId: source.id,
      name: source.name,
      latitude: stationLat,
      longitude: stationLon,
    });

    stations.push(station);
  }

  return findNearestByDistance(stations, lat, lon);
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

  // Compute per-year frost dates and GDD, then average
  const years = [...new Set(records.map((r) => dayjs(r.date).year()))].sort();
  const frostByYear = years.map((year) => {
    const yearRecords = records.filter((r) => r.date.startsWith(String(year)));
    return detectFrostDates(yearRecords, year);
  });
  const avgFrost = averageFrostDates(frostByYear);

  // Compute average GDD across years (using frost-free period per year)
  const gddByYear = years.map((year) => {
    const yearRecords = records.filter((r) => r.date.startsWith(String(year)));
    const frost = detectFrostDates(yearRecords, year);
    const growingRecords = yearRecords.filter((r) => {
      if (frost.lastFrostSpring && r.date <= frost.lastFrostSpring) return false;
      if (frost.firstFrostAutumn && r.date >= frost.firstFrostAutumn) return false;
      return true;
    });
    return calculateSeasonalGdd(growingRecords);
  });
  const avgGdd = Math.round(gddByYear.reduce((a, b) => a + b, 0) / gddByYear.length);

  // Store station-level metrics
  await db.updateStationClimate(stationDbId, {
    dataYearsFrom: years[0],
    dataYearsTo: years[years.length - 1],
    avgGdd,
    avgFrostFreeDays: avgFrost.frostFreeDays,
    lastFrostSpring: avgFrost.lastFrostSpring,
    firstFrostAutumn: avgFrost.firstFrostAutumn,
  });

  return averages;
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

function findNearestByDistance<T extends { latitude: number; longitude: number }>(
  stations: T[],
  lat: number,
  lon: number,
): T {
  let nearest = stations[0];
  let minDist = Infinity;

  for (const s of stations) {
    const d = haversineKm(lat, lon, s.latitude, s.longitude);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }

  return nearest;
}
