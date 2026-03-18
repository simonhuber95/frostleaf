import dayjs from 'dayjs';
import type { TemperatureRecord, DailyGddRecord, FrostDates, StationMetrics } from '../types/weather';

/**
 * Calculate daily GDD for a single day using the simplified FAO method.
 *
 * GDD = 0                        if Tavg < Tbase
 * GDD = Tavg - Tbase             if Tbase ≤ Tavg ≤ Tupper
 * GDD = Tupper - Tbase           if Tavg > Tupper
 */
export function calculateDailyGdd(tempMin: number, tempMax: number, tBase: number, tUpper: number): number {
  const tavg = (tempMin + tempMax) / 2;

  if (tavg < tBase) return 0;
  if (tavg > tUpper) return tUpper - tBase;
  return tavg - tBase;
}

/**
 * Calculate daily GDD series from temperature records.
 * Default Tbase 5°C / Tupper 30°C for location-level accumulation.
 */
export function calculateDailyGddSeries(
  records: TemperatureRecord[],
  tBase: number = 5,
  tUpper: number = 30,
): DailyGddRecord[] {
  return records.map((r) => {
    const tempMean = (r.tempMin + r.tempMax) / 2;
    const gdd = calculateDailyGdd(r.tempMin, r.tempMax, tBase, tUpper);
    return {
      date: r.date,
      tempMin: r.tempMin,
      tempMax: r.tempMax,
      tempMean: Math.round(tempMean * 10) / 10,
      gdd: Math.round(gdd * 10) / 10,
    };
  });
}

/**
 * Calculate cumulative/seasonal GDD from daily temperature records.
 */
export function calculateSeasonalGdd(records: TemperatureRecord[], tBase: number = 5, tUpper: number = 30): number {
  return records.reduce((sum, r) => sum + calculateDailyGdd(r.tempMin, r.tempMax, tBase, tUpper), 0);
}

/**
 * Detect frost dates from daily temperature records for a given year.
 * - Last spring frost: last date before July 1 where tempMin ≤ 0°C
 * - First autumn frost: first date after July 1 where tempMin ≤ 0°C
 */
export function detectFrostDates(records: TemperatureRecord[], year: number): FrostDates {
  const midYear = dayjs(`${year}-07-01`);
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  let lastFrostSpring: string | null = null;
  let firstFrostAutumn: string | null = null;

  for (const r of sorted) {
    if (r.tempMin <= 0) {
      const date = dayjs(r.date);
      if (date.isBefore(midYear)) {
        lastFrostSpring = r.date;
      } else if (!firstFrostAutumn) {
        firstFrostAutumn = r.date;
      }
    }
  }

  let frostFreeDays = 0;
  if (lastFrostSpring && firstFrostAutumn) {
    frostFreeDays = dayjs(firstFrostAutumn).diff(dayjs(lastFrostSpring), 'day');
  }

  return { lastFrostSpring, firstFrostAutumn, frostFreeDays };
}

/**
 * Compute full derived metrics for a station-year: GDD accumulation + frost dates.
 * GDD is accumulated only during the frost-free period.
 */
export function computeStationMetrics(
  stationId: string,
  year: number,
  records: TemperatureRecord[],
  tBase: number = 5,
  tUpper: number = 30,
): StationMetrics {
  const { lastFrostSpring, firstFrostAutumn, frostFreeDays } = detectFrostDates(records, year);

  const growingRecords = records.filter((r) => {
    if (lastFrostSpring && r.date <= lastFrostSpring) return false;
    if (firstFrostAutumn && r.date >= firstFrostAutumn) return false;
    return true;
  });

  const gddAccumulated = calculateSeasonalGdd(growingRecords, tBase, tUpper);

  return {
    stationId,
    year,
    gddAccumulated: Math.round(gddAccumulated),
    lastFrostSpring,
    firstFrostAutumn,
    frostFreeDays,
  };
}
