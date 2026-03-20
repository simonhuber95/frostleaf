import * as db from '../clients/db';

export async function createGarden(userId: string, name: string, locationId: string) {
  return db.insertGarden({ userId, name, locationId });
}

export async function listUserGardens(userId: string) {
  return db.findGardensByUser(userId);
}

export async function getGardenWithPlants(gardenId: string) {
  const garden = await db.findGardenById(gardenId);
  if (!garden) return null;

  const rows = await db.findGardenPlants(gardenId);
  const plants = rows.map((r) => ({
    ...r.garden_plants,
    commonName: r.plants?.commonName ?? '',
    scientificName: r.plants?.scientificName ?? '',
    cropGroup: r.plants?.cropGroup ?? '',
  }));

  return { ...garden, plants };
}

export async function updateGarden(gardenId: string, data: { name?: string; locationId?: string }) {
  return db.updateGarden(gardenId, data);
}

export async function deleteGarden(gardenId: string) {
  return db.deleteGarden(gardenId);
}

export async function addPlant(gardenId: string, plantId: string, notes?: string) {
  return db.insertGardenPlant({ gardenId, plantId, notes });
}

export async function removePlant(gardenId: string, plantId: string) {
  return db.deleteGardenPlant(gardenId, plantId);
}

export async function updatePlant(gardenId: string, plantId: string, data: { notes?: string; plantedDate?: string | null }) {
  return db.updateGardenPlant(gardenId, plantId, data);
}

// --- Diary ---

export async function getDiaryEntries(gardenId: string) {
  return db.findDiaryEntries(gardenId);
}

export async function addDiaryEntry(gardenId: string, content: string, plantIds: string[]) {
  return db.insertDiaryEntry(gardenId, content, plantIds);
}

export async function updateDiaryEntry(entryId: string, content: string, plantIds: string[]) {
  return db.updateDiaryEntry(entryId, content, plantIds);
}

export async function deleteDiaryEntry(entryId: string) {
  return db.deleteDiaryEntry(entryId);
}

export async function findDiaryEntry(entryId: string) {
  return db.findDiaryEntryById(entryId);
}

export async function exportGarden(gardenId: string) {
  const garden = await db.findGardenById(gardenId);
  if (!garden) return null;

  const location = await db.findLocationById(garden.locationId);
  const rows = await db.findGardenPlants(gardenId);

  return {
    version: 1 as const,
    name: garden.name,
    location: {
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
    },
    plants: rows.map((r) => ({
      plantId: r.garden_plants.plantId,
      commonName: r.plants?.commonName ?? '',
      plantedDate: r.garden_plants.plantedDate,
      notes: r.garden_plants.notes,
    })),
    exportedAt: new Date().toISOString(),
  };
}
