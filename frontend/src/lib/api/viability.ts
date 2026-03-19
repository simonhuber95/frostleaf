import { api } from './client';

export type ViabilityResult = {
  plantId: string;
  commonName: string;
  scientificName: string;
  cropGroup: string;
  imageUrl: string | null;
  isViable: boolean;
  viabilityScore: number;
  locationGdd: number;
  requiredGdd: number | null;
  confidence: string | null;
};

export type ViabilityReport = {
  locationId: string;
  stationName: string;
  averageGdd: number;
  frostFreeDays: number;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  plants: ViabilityResult[];
};

export function getViability(locationId: string) {
  return api.get<ViabilityReport>(`/api/viability/${locationId}`);
}
