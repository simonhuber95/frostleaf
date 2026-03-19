import { api } from './client';

export type LocationResult = {
  location: { id: string; latitude: number; longitude: number; nearestStationId: string };
  displayName: string;
  station: { id: string; name: string };
  metrics: Array<{
    year: number;
    gddAccumulated: number;
    frostFreeDays: number;
    lastFrostSpring: string | null;
    firstFrostAutumn: string | null;
  }>;
};

export function resolveLocation(type: string, params: Record<string, string | number>) {
  const query = new URLSearchParams({ type, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  return api.get<LocationResult>(`/api/location/resolve?${query}`);
}

export function getLocation(id: string) {
  return api.get<LocationResult>(`/api/location/${id}`);
}
