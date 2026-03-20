import { api } from './client';

export type NearbyStation = {
  id: string;
  frostApiId: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
};

export type NearbyResult = {
  displayName: string;
  latitude: number;
  longitude: number;
  stations: NearbyStation[];
};

export type LocationResult = {
  location: { id: string; latitude: number; longitude: number; nearestStationId: string };
  displayName: string;
  station: { id: string; name: string };
  climate: {
    avgGdd: number | null;
    avgFrostFreeDays: number | null;
    lastFrostSpring: string | null;
    firstFrostAutumn: string | null;
  } | null;
};

export function findNearbyStations(type: string, params: Record<string, string | number>) {
  const query = new URLSearchParams({ type, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  return api.get<NearbyResult>(`/api/location/nearby?${query}`);
}

export function resolveLocation(latitude: number, longitude: number, stationId: string, displayName: string) {
  return api.post<LocationResult>('/api/location/resolve', { latitude, longitude, stationId, displayName });
}

export function getLocation(id: string) {
  return api.get<LocationResult>(`/api/location/${id}`);
}

export type DailyClimateAverage = {
  dayOfYear: number;
  avgMin: number;
  avgMax: number;
  avgMean: number;
};

export type LocationClimate = {
  stationName: string;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  dailyAverages: DailyClimateAverage[];
};

export function getLocationClimate(locationId: string) {
  return api.get<LocationClimate>(`/api/location/${locationId}/climate`);
}
