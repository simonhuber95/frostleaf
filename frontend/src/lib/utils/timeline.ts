export type Stage = {
  label: string;
  startMonth: number;
  endMonth: number;
  color: string;
};

export type TimelineRow = {
  label: string;
  color: string;
  stages: Stage[];
};

/** Day-of-year based stage for precise positioning */
export type DayStage = {
  label: string;
  startDoy: number;
  endDoy: number;
  color: string;
  tooltip: string;
};

export const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const stageColors = {
  Sowing: 'bg-amber-500',
  Growth: 'bg-emerald-500',
  Bloom: 'bg-pink-400',
  Harvest: 'bg-orange-500',
} as const;

// --- Month-based utilities (used by PlantTimeline) ---

export function monthsToStages(months: number[], label: string, color: string): Stage[] {
  if (!months.length) return [];

  const sorted = [...months].sort((a, b) => a - b);
  const stages: Stage[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== prev + 1) {
      stages.push({ label, startMonth: start, endMonth: prev, color });
      start = sorted[i];
    }
    prev = sorted[i];
  }
  stages.push({ label, startMonth: start, endMonth: prev, color });
  return stages;
}

export function monthToPercent(month: number): number {
  return ((month - 1) / 12) * 100;
}

export function monthWidthPercent(start: number, end: number): number {
  return ((end - start + 1) / 12) * 100;
}

// --- Day-of-year utilities (used by GardenTimeline for precise positioning) ---

/** Cumulative day-of-year at the start of each month (0-indexed month). Non-leap year. */
const monthStartDoy = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

/** Parse MM-DD string to day-of-year (1-365) */
export function dateToDoy(mmdd: string): number {
  const [mm, dd] = mmdd.split('-').map(Number);
  return monthStartDoy[mm - 1] + (dd - 1);
}

/** Convert day-of-year (1-365) to percentage position across the year */
export function doyToPercent(doy: number): number {
  return ((doy - 1) / 365) * 100;
}

/** Width in percent between two day-of-year values */
export function doyWidthPercent(startDoy: number, endDoy: number): number {
  return ((endDoy - startDoy + 1) / 365) * 100;
}

/** Format MM-DD to human-readable "15 Mar" */
export function formatDate(mmdd: string): string {
  const [mm, dd] = mmdd.split('-').map(Number);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dd} ${monthNames[mm - 1]}`;
}

/** Percentage position of each month boundary (for grid lines) */
export function monthBoundaryPercents(): number[] {
  return monthStartDoy.map((doy) => doyToPercent(doy));
}
