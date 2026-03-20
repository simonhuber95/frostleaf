import { api } from './client';

export type PlantTimeline = {
  sowingMethod: string | null;
  indoorSowStart: string | null;
  indoorSowEnd: string | null;
  transplantDate: string | null;
  directSowStart: string | null;
  directSowEnd: string | null;
  growthStart: string;
  growthEnd: string;
  harvestStart: string;
  harvestEnd: string;
};

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
  timeline: PlantTimeline | null;
};

export type ViabilityReport = {
  locationId: string;
  stationName: string;
  averageGdd: number;
  frostFreeDays: number;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  monthlyAverages: number[];
  plants: ViabilityResult[];
};

export function getViability(locationId: string) {
  return api.get<ViabilityReport>(`/api/viability/${locationId}`);
}
