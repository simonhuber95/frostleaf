import dayjs from 'dayjs';
import { db } from '../db/index.js';
import { weatherStations, climateData } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { fetchNearbyStations, fetchObservations } from '../clients/frost.js';
import type { TemperatureRecord } from '../types/weather.js';

// --- Station lookup ---

export async function findNearestStation(lat: number, lon: number): Promise<typeof weatherStations.$inferSelect> {
  // Check cached stations first
  const cached = await db.select().from(weatherStations);

  if (cached.length > 0) {
    const nearest = findNearestByDistance(cached, lat, lon);
    const distKm = haversineKm(lat, lon, nearest.latitude, nearest.longitude);
    if (distKm < 50) return nearest;
  }

  // Fetch from Frost API
  const response = await fetchNearbyStations(lat, lon);

  if (!response.data || response.data.length === 0) {
    throw new Error('No weather stations found near this location');
  }

  // Cache stations in DB
  const stations = [];
  for (const source of response.data) {
    const [stationLon, stationLat] = source.geometry.coordinates;

    const [station] = await db
      .insert(weatherStations)
      .values({
        frostApiId: source.id,
        name: source.name,
        latitude: stationLat,
        longitude: stationLon,
        availableObservations: ['min(air_temperature P1D)', 'max(air_temperature P1D)'],
      })
      .onConflictDoUpdate({
        target: weatherStations.frostApiId,
        set: { name: source.name, latitude: stationLat, longitude: stationLon },
      })
      .returning();

    stations.push(station);
  }

  return findNearestByDistance(stations, lat, lon);
}

// --- Temperature data with DB caching ---

export async function getTemperatureData(
  stationFrostId: string,
  stationDbId: string,
  fromDate: string,
  toDate: string,
): Promise<TemperatureRecord[]> {
  // Check cache
  const cached = await db.select().from(climateData).where(eq(climateData.stationId, stationDbId));

  if (cached.length > 0) {
    const dates = new Set(cached.map((r) => r.date));
    let allCached = true;

    let cursor = dayjs(fromDate);
    const end = dayjs(toDate);
    while (cursor.isBefore(end) || cursor.isSame(end)) {
      if (!dates.has(cursor.format('YYYY-MM-DD'))) {
        allCached = false;
        break;
      }
      cursor = cursor.add(1, 'day');
    }

    if (allCached) {
      return cached.map((r) => ({ date: r.date, tempMin: r.tempMin, tempMax: r.tempMax }));
    }
  }

  // Fetch from Frost API
  const response = await fetchObservations(stationFrostId, fromDate, toDate);

  if (!response.data || response.data.length === 0) {
    return [];
  }

  // Parse observations into daily records
  const dailyData = new Map<string, { tempMin: number; tempMax: number }>();

  for (const obs of response.data) {
    const date = dayjs(obs.referenceTime).format('YYYY-MM-DD');
    const existing = dailyData.get(date) || { tempMin: Infinity, tempMax: -Infinity };

    for (const o of obs.observations) {
      if (o.elementId === 'min(air_temperature P1D)') {
        existing.tempMin = o.value;
      } else if (o.elementId === 'max(air_temperature P1D)') {
        existing.tempMax = o.value;
      }
    }

    dailyData.set(date, existing);
  }

  // Upsert into DB cache
  const results: TemperatureRecord[] = [];

  for (const [date, temps] of dailyData) {
    if (temps.tempMin === Infinity || temps.tempMax === -Infinity) continue;

    await db
      .insert(climateData)
      .values({
        stationId: stationDbId,
        date,
        tempMin: temps.tempMin,
        tempMax: temps.tempMax,
      })
      .onConflictDoUpdate({
        target: [climateData.stationId, climateData.date],
        set: { tempMin: temps.tempMin, tempMax: temps.tempMax, fetchedAt: new Date() },
      });

    results.push({ date, tempMin: temps.tempMin, tempMax: temps.tempMax });
  }

  return results;
}

// --- Helpers ---

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestByDistance<T extends { latitude: number; longitude: number }>(
  stations: T[],
  lat: number,
  lon: number,
): T {
  let nearest = stations[0];
  let minDist = Infinity;

  for (const s of stations) {
    const d = haversineKm(lat, lon, s.latitude, s.longitude);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }

  return nearest;
}
