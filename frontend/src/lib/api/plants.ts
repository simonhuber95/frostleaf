import { api } from './client';

export type Plant = {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  cropGroup: string;
  source: string;
  externalId: string | null;
  imageUrl: string | null;
  properties: PlantProperties | null;
};

export type PlantProperties = {
  daysToHarvest: number | null;
  lightRequirement: string | null;
  soilPreferences: string[];
  duration: string | null;
  edibleParts: string[];
  description: string | null;
  sowingMethod: string | null;
  transplantLeadWeeks: number | null;
  photoperiodClass: string | null;
  sowingInfo: string | null;
  bloomMonths: string[];
  growthMonths: string[];
  minTemperature: number | null;
  baseTemperature: number | null;
  maxTemperature: number | null;
  gddRequired: number | null;
  thermalSource: string | null;
  thermalConfidence: string | null;
};

export function searchPlants(query: string, includeExternal = false) {
  const params = new URLSearchParams({ q: query });
  if (includeExternal) params.set('includeExternal', 'true');
  return api.get<Plant[]>(`/api/plants/search?${params}`);
}

export function getPlant(id: string) {
  return api.get<Plant>(`/api/plants/${id}`);
}

export function importPlant(trefleId: number) {
  return api.post<Plant>(`/api/plants/import/${trefleId}`);
}

export function updatePlantProperties(plantId: string, data: Partial<PlantProperties>) {
  return api.put<Plant>(`/api/plants/${plantId}/properties`, data);
}
