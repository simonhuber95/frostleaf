export type TemperatureRecord = {
  date: string;
  tempMin: number;
  tempMax: number;
  tempMean: number;
};

export type DailyClimateAverage = {
  dayOfYear: number; // 1-366
  avgMin: number;
  avgMax: number;
  avgMean: number;
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

export type StationClimate = {
  stationId: string;
  avgGdd: number;
  avgFrostFreeDays: number;
  lastFrostSpring: string | null; // MM-DD
  firstFrostAutumn: string | null; // MM-DD
  dailyAverages: DailyClimateAverage[];
};
