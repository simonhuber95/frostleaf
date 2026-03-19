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

export const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const stageColors = {
  Sowing: 'bg-amber-500',
  Growth: 'bg-emerald-500',
  Bloom: 'bg-pink-400',
  Harvest: 'bg-orange-500',
} as const;

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
