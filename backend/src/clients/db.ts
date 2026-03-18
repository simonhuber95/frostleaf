import { db } from '../db/index';
import { plants, plantProperties, weatherStations, climateData, derivedMetrics, locations } from '../db/schema';
import { eq, ilike, or } from 'drizzle-orm';
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

export async function insertLocation(latitude: number, longitude: number, nearestStationId: string) {
  const [location] = await db.insert(locations).values({ latitude, longitude, nearestStationId }).returning();
  return location;
}

export async function findLocationById(id: string) {
  const result = await db.select().from(locations).where(eq(locations.id, id));
  return result.length > 0 ? result[0] : null;
}
