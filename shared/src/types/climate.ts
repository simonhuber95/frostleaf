export type ClimateData = {
  stationId: string;
  date: string;
  tempMin: number;
  tempMax: number;
  fetchedAt: string;
};

export type DerivedMetrics = {
  stationId: string;
  year: number;
  gddAccumulated: number;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  frostFreeDays: number;
};

export type DailyGdd = {
  date: string;
  tempMin: number;
  tempMax: number;
  tempMean: number;
  gdd: number;
};
