import { api } from './client';

export type ServerGarden = {
  id: string;
  userId: string;
  name: string;
  locationId: string;
  createdAt: string;
};

export type ServerGardenWithPlants = ServerGarden & {
  plants: Array<{
    id: string;
    gardenId: string;
    plantId: string;
    plantedDate: string | null;
    notes: string;
    commonName: string;
    scientificName: string;
    cropGroup: string;
  }>;
};

export function listGardens() {
  return api.get<ServerGarden[]>('/api/gardens');
}

export function getGarden(id: string) {
  return api.get<ServerGardenWithPlants>(`/api/gardens/${id}`);
}

export function createGarden(name: string, locationId: string) {
  return api.post<ServerGarden>('/api/gardens', { name, locationId });
}

export function updateGarden(id: string, data: { name?: string; locationId?: string }) {
  return api.put<ServerGarden>(`/api/gardens/${id}`, data);
}

export function deleteGarden(id: string) {
  return api.del<{ ok: boolean }>(`/api/gardens/${id}`);
}

export function addPlantToGarden(gardenId: string, plantId: string, notes?: string) {
  return api.post(`/api/gardens/${gardenId}/plants`, { plantId, notes });
}

export function removePlantFromGarden(gardenId: string, plantId: string) {
  return api.del(`/api/gardens/${gardenId}/plants/${plantId}`);
}

export function updateGardenPlant(gardenId: string, plantId: string, data: { notes?: string; plantedDate?: string | null }) {
  return api.patch(`/api/gardens/${gardenId}/plants/${plantId}`, data);
}

// --- Diary ---

export type DiaryEntry = {
  id: string;
  gardenId: string;
  content: string;
  plantTags: { plantId: string; commonName: string }[];
  createdAt: string;
  updatedAt: string;
};

export function listDiaryEntries(gardenId: string) {
  return api.get<DiaryEntry[]>(`/api/gardens/${gardenId}/diary`);
}

export function addDiaryEntry(gardenId: string, content: string, plantIds: string[]) {
  return api.post<DiaryEntry>(`/api/gardens/${gardenId}/diary`, { content, plantIds });
}

export function updateDiaryEntry(gardenId: string, entryId: string, content: string, plantIds: string[]) {
  return api.patch<DiaryEntry>(`/api/gardens/${gardenId}/diary/${entryId}`, { content, plantIds });
}

export function deleteDiaryEntry(gardenId: string, entryId: string) {
  return api.del<{ ok: boolean }>(`/api/gardens/${gardenId}/diary/${entryId}`);
}
