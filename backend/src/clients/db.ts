import { db } from '../db/index';
import { plants, plantProperties, weatherStations, climateDailyAverages, locations, gardens, gardenPlants, gardenDiaryEntries, gardenDiaryPlantTags } from '../db/schema';
import { eq, and, ilike, or, desc } from 'drizzle-orm';
import type { DailyClimateAverage } from '../types/weather';

// --- Plants ---

export async function findAllPlants() {
  const result = await db
    .select()
    .from(plants)
    .leftJoin(plantProperties, eq(plantProperties.plantId, plants.id))
    .orderBy(plants.commonName);

  return result.map((r) => ({
    ...r.plants,
    properties: r.plant_properties,
  }));
}

export async function findPlantById(id: string) {
  const result = await db
    .select()
    .from(plants)
    .leftJoin(plantProperties, eq(plantProperties.plantId, plants.id))
    .where(eq(plants.id, id));

  if (result.length === 0) return null;

  const r = result[0];
  return {
    ...r.plants,
    properties: r.plant_properties,
  };
}

export async function findPlantByExternalId(externalId: string) {
  const result = await db
    .select()
    .from(plants)
    .leftJoin(plantProperties, eq(plantProperties.plantId, plants.id))
    .where(eq(plants.externalId, externalId));

  if (result.length === 0) return null;

  const r = result[0];
  return {
    ...r.plants,
    properties: r.plant_properties,
  };
}

export async function searchPlants(query: string) {
  const pattern = `%${query}%`;
  const result = await db
    .select()
    .from(plants)
    .leftJoin(plantProperties, eq(plantProperties.plantId, plants.id))
    .where(or(ilike(plants.commonName, pattern), ilike(plants.scientificName, pattern), ilike(plants.family, pattern)))
    .orderBy(plants.commonName);

  return result.map((r) => ({
    ...r.plants,
    properties: r.plant_properties,
  }));
}

export async function insertPlant(data: typeof plants.$inferInsert) {
  const [inserted] = await db.insert(plants).values(data).returning();
  return inserted;
}

export async function upsertPlantProperties(data: typeof plantProperties.$inferInsert) {
  const [result] = await db
    .insert(plantProperties)
    .values(data)
    .onConflictDoUpdate({
      target: plantProperties.plantId,
      set: { ...data, lastEnrichedAt: new Date() },
    })
    .returning();

  return result;
}

export async function updatePlantProperties(plantId: string, data: Record<string, unknown>) {
  const [result] = await db
    .update(plantProperties)
    .set(data)
    .where(eq(plantProperties.plantId, plantId))
    .returning();

  return result ?? null;
}

// --- Weather Stations ---

export async function findAllStations() {
  return db.select().from(weatherStations);
}

export async function findStationById(id: string) {
  const result = await db.select().from(weatherStations).where(eq(weatherStations.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function upsertStation(data: {
  frostApiId: string;
  name: string;
  latitude: number;
  longitude: number;
}) {
  const [station] = await db
    .insert(weatherStations)
    .values(data)
    .onConflictDoUpdate({
      target: weatherStations.frostApiId,
      set: { name: data.name, latitude: data.latitude, longitude: data.longitude },
    })
    .returning();

  return station;
}

// --- Climate Daily Averages ---

export async function findDailyAveragesByStation(stationId: string): Promise<DailyClimateAverage[]> {
  const rows = await db
    .select()
    .from(climateDailyAverages)
    .where(eq(climateDailyAverages.stationId, stationId))
    .orderBy(climateDailyAverages.dayOfYear);

  return rows.map((r) => ({
    dayOfYear: r.dayOfYear,
    avgMin: r.avgMin,
    avgMax: r.avgMax,
    avgMean: r.avgMean,
  }));
}

export async function insertDailyAverages(
  stationId: string,
  averages: DailyClimateAverage[],
) {
  await db.insert(climateDailyAverages).values(
    averages.map((a) => ({
      stationId,
      dayOfYear: a.dayOfYear,
      avgMin: a.avgMin,
      avgMax: a.avgMax,
      avgMean: a.avgMean,
    })),
  );
}

export async function deleteDailyAveragesByStation(stationId: string) {
  await db.delete(climateDailyAverages).where(eq(climateDailyAverages.stationId, stationId));
}

export async function updateStationClimate(
  stationId: string,
  data: {
    dataYearsFrom: number;
    dataYearsTo: number;
    avgGdd: number;
    avgFrostFreeDays: number;
    lastFrostSpring: string | null;
    firstFrostAutumn: string | null;
  },
) {
  await db
    .update(weatherStations)
    .set({ ...data, lastFetchedAt: new Date() })
    .where(eq(weatherStations.id, stationId));
}

// --- Locations ---

export async function findLocationByStation(stationId: string) {
  const result = await db.select().from(locations).where(eq(locations.nearestStationId, stationId));
  return result.length > 0 ? result[0] : null;
}

export async function insertLocation(latitude: number, longitude: number, nearestStationId: string) {
  const [location] = await db.insert(locations).values({ latitude, longitude, nearestStationId }).returning();
  return location;
}

export async function findLocationById(id: string) {
  const result = await db.select().from(locations).where(eq(locations.id, id));
  return result.length > 0 ? result[0] : null;
}

// --- Gardens ---

export async function insertGarden(data: { userId: string; name: string; locationId: string }) {
  const [garden] = await db.insert(gardens).values(data).returning();
  return garden;
}

export async function findGardensByUser(userId: string) {
  return db.select().from(gardens).where(eq(gardens.userId, userId)).orderBy(gardens.createdAt);
}

export async function findGardenById(id: string) {
  const result = await db.select().from(gardens).where(eq(gardens.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function updateGarden(id: string, data: { name?: string; locationId?: string }) {
  const [updated] = await db.update(gardens).set(data).where(eq(gardens.id, id)).returning();
  return updated ?? null;
}

export async function deleteGarden(id: string) {
  await db.delete(gardens).where(eq(gardens.id, id));
}

// --- Garden Plants ---

export async function findGardenPlants(gardenId: string) {
  return db
    .select()
    .from(gardenPlants)
    .leftJoin(plants, eq(plants.id, gardenPlants.plantId))
    .where(eq(gardenPlants.gardenId, gardenId));
}

export async function insertGardenPlant(data: { gardenId: string; plantId: string; notes?: string }) {
  const [inserted] = await db
    .insert(gardenPlants)
    .values({ ...data, notes: data.notes ?? '' })
    .onConflictDoUpdate({
      target: [gardenPlants.gardenId, gardenPlants.plantId],
      set: { notes: data.notes ?? '' },
    })
    .returning();
  return inserted;
}

export async function deleteGardenPlant(gardenId: string, plantId: string) {
  await db
    .delete(gardenPlants)
    .where(and(eq(gardenPlants.gardenId, gardenId), eq(gardenPlants.plantId, plantId)));
}

export async function updateGardenPlant(gardenId: string, plantId: string, data: { notes?: string; plantedDate?: string | null }) {
  const [updated] = await db
    .update(gardenPlants)
    .set(data)
    .where(and(eq(gardenPlants.gardenId, gardenId), eq(gardenPlants.plantId, plantId)))
    .returning();
  return updated ?? null;
}

// --- Garden Diary ---

export async function findDiaryEntries(gardenId: string) {
  const entries = await db
    .select()
    .from(gardenDiaryEntries)
    .where(eq(gardenDiaryEntries.gardenId, gardenId))
    .orderBy(desc(gardenDiaryEntries.createdAt));

  const entryIds = entries.map((e) => e.id);
  if (entryIds.length === 0) return [];

  const tags = await db
    .select({
      diaryEntryId: gardenDiaryPlantTags.diaryEntryId,
      plantId: gardenDiaryPlantTags.plantId,
      commonName: plants.commonName,
    })
    .from(gardenDiaryPlantTags)
    .leftJoin(plants, eq(plants.id, gardenDiaryPlantTags.plantId))
    .where(or(...entryIds.map((id) => eq(gardenDiaryPlantTags.diaryEntryId, id))));

  const tagsByEntry = new Map<string, { plantId: string; commonName: string }[]>();
  for (const tag of tags) {
    const list = tagsByEntry.get(tag.diaryEntryId) ?? [];
    list.push({ plantId: tag.plantId, commonName: tag.commonName ?? '' });
    tagsByEntry.set(tag.diaryEntryId, list);
  }

  return entries.map((e) => ({
    ...e,
    plantTags: tagsByEntry.get(e.id) ?? [],
  }));
}

export async function insertDiaryEntry(gardenId: string, content: string, plantIds: string[]) {
  const [entry] = await db
    .insert(gardenDiaryEntries)
    .values({ gardenId, content })
    .returning();

  if (plantIds.length > 0) {
    await db.insert(gardenDiaryPlantTags).values(
      plantIds.map((plantId) => ({ diaryEntryId: entry.id, plantId })),
    );
  }

  return entry;
}

export async function updateDiaryEntry(entryId: string, content: string, plantIds: string[]) {
  const [updated] = await db
    .update(gardenDiaryEntries)
    .set({ content, updatedAt: new Date() })
    .where(eq(gardenDiaryEntries.id, entryId))
    .returning();

  if (!updated) return null;

  // Replace tags: delete all, re-insert
  await db.delete(gardenDiaryPlantTags).where(eq(gardenDiaryPlantTags.diaryEntryId, entryId));
  if (plantIds.length > 0) {
    await db.insert(gardenDiaryPlantTags).values(
      plantIds.map((plantId) => ({ diaryEntryId: entryId, plantId })),
    );
  }

  return updated;
}

export async function deleteDiaryEntry(entryId: string) {
  await db.delete(gardenDiaryEntries).where(eq(gardenDiaryEntries.id, entryId));
}

export async function findDiaryEntryById(entryId: string) {
  const result = await db.select().from(gardenDiaryEntries).where(eq(gardenDiaryEntries.id, entryId));
  return result.length > 0 ? result[0] : null;
}
