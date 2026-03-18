export type TemperatureRecord = {
  date: string;
  tempMin: number;
  tempMax: number;
};

export type DailyGddRecord = {
  date: string;
  tempMin: number;
  tempMax: number;
  tempMean: number;
  gdd: number;
};

export type FrostDates = {
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  frostFreeDays: number;
};

export type StationMetrics = {
  stationId: string;
  year: number;
  gddAccumulated: number;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  frostFreeDays: number;
};
