export interface ClimateData {
  stationId: string;
  date: string;
  tempMin: number;
  tempMax: number;
  fetchedAt: string;
}

export interface DerivedMetrics {
  stationId: string;
  year: number;
  gddAccumulated: number;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  frostFreeDays: number;
}

export interface DailyGdd {
  date: string;
  tempMin: number;
  tempMax: number;
  tempMean: number;
  gdd: number;
}
