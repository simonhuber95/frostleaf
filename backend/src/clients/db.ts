import { db } from '../db/index';
import { plants, plantProperties, weatherStations, climateData, derivedMetrics, locations, gardens, gardenPlants } from '../db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';
import type { StationMetrics } from '../types/weather';

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
  availableObservations: string[];
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

// --- Climate Data ---

export async function findClimateDataByStation(stationId: string) {
  return db.select().from(climateData).where(eq(climateData.stationId, stationId));
}

export async function upsertClimateRecord(stationId: string, date: string, tempMin: number, tempMax: number) {
  await db
    .insert(climateData)
    .values({ stationId, date, tempMin, tempMax })
    .onConflictDoUpdate({
      target: [climateData.stationId, climateData.date],
      set: { tempMin, tempMax, fetchedAt: new Date() },
    });
}

// --- Derived Metrics ---

export async function upsertDerivedMetrics(metrics: StationMetrics) {
  const [saved] = await db
    .insert(derivedMetrics)
    .values(metrics)
    .onConflictDoUpdate({
      target: [derivedMetrics.stationId, derivedMetrics.year],
      set: {
        gddAccumulated: metrics.gddAccumulated,
        lastFrostSpring: metrics.lastFrostSpring,
        firstFrostAutumn: metrics.firstFrostAutumn,
        frostFreeDays: metrics.frostFreeDays,
      },
    })
    .returning();

  return saved;
}

export async function findDerivedMetricsByStation(stationId: string) {
  return db.select().from(derivedMetrics).where(eq(derivedMetrics.stationId, stationId));
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
