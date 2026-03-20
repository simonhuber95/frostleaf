import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import type { TemperatureRecord, DailyClimateAverage, FrostDates } from '../types/weather';

dayjs.extend(dayOfYear);

/**
 * Calculate daily GDD for a single day using the simplified FAO method.
 *
 * GDD = 0                        if Tavg < Tbase
 * GDD = Tavg - Tbase             if Tbase ≤ Tavg ≤ Tupper
 * GDD = Tupper - Tbase           if Tavg > Tupper
 */
export function calculateDailyGdd(tempMean: number, tBase: number, tUpper: number): number {
  if (tempMean < tBase) return 0;
  if (tempMean > tUpper) return tUpper - tBase;
  return tempMean - tBase;
}

/**
 * Calculate cumulative/seasonal GDD from daily temperature records.
 * Uses actual mean temperature (not min+max/2 approximation).
 */
export function calculateSeasonalGdd(records: TemperatureRecord[], tBase: number = 5, tUpper: number = 30): number {
  return records.reduce((sum, r) => sum + calculateDailyGdd(r.tempMean, tBase, tUpper), 0);
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
 * Average frost dates across multiple years.
 * Returns MM-DD strings (year-independent) by averaging the day-of-year.
 */
export function averageFrostDates(metricsByYear: FrostDates[]): FrostDates {
  const springDoys: number[] = [];
  const autumnDoys: number[] = [];

  for (const m of metricsByYear) {
    if (m.lastFrostSpring) {
      springDoys.push(dayjs(m.lastFrostSpring).dayOfYear());
    }
    if (m.firstFrostAutumn) {
      autumnDoys.push(dayjs(m.firstFrostAutumn).dayOfYear());
    }
  }

  const avgSpringDoy = springDoys.length > 0 ? Math.round(springDoys.reduce((a, b) => a + b, 0) / springDoys.length) : null;
  const avgAutumnDoy = autumnDoys.length > 0 ? Math.round(autumnDoys.reduce((a, b) => a + b, 0) / autumnDoys.length) : null;

  const lastFrostSpring = avgSpringDoy !== null ? dayjs('2024-01-01').dayOfYear(avgSpringDoy).format('MM-DD') : null;
  const firstFrostAutumn = avgAutumnDoy !== null ? dayjs('2024-01-01').dayOfYear(avgAutumnDoy).format('MM-DD') : null;

  const frostFreeDays = avgSpringDoy !== null && avgAutumnDoy !== null ? avgAutumnDoy - avgSpringDoy : 0;

  return { lastFrostSpring, firstFrostAutumn, frostFreeDays };
}

/**
 * Find the first date (MM-DD) in spring where a daily average crosses a threshold.
 * Works directly with stored DailyClimateAverage data.
 */
export function findThresholdDate(
  dailyAverages: DailyClimateAverage[],
  threshold: number,
  field: 'avgMin' | 'avgMax' | 'avgMean' = 'avgMean',
): string | null {
  // Search spring: DOY 1 (Jan 1) through DOY 182 (Jul 1)
  for (const avg of dailyAverages) {
    if (avg.dayOfYear > 182) break;
    if (avg[field] >= threshold) {
      return dayjs('2024-01-01').dayOfYear(avg.dayOfYear).format('MM-DD');
    }
  }
  return null;
}

/**
 * Compute average monthly temperatures from daily climate averages.
 * Returns array of 12 entries (index 0 = January).
 */
export function computeMonthlyAverages(dailyAverages: DailyClimateAverage[]): number[] {
  const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const result: number[] = [];
  let doy = 0;
  for (let m = 0; m < 12; m++) {
    let sum = 0;
    for (let d = 0; d < monthDays[m]; d++) {
      sum += dailyAverages[doy]?.avgMean ?? 0;
      doy++;
    }
    result.push(Math.round((sum / monthDays[m]) * 10) / 10);
  }
  return result;
}
