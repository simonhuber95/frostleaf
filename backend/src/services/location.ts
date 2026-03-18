import dayjs from 'dayjs';
import * as db from '../clients/db';
import * as kartverket from '../clients/kartverket';
import * as weatherService from './weather';
import * as gddService from './gdd';
import type { LocationInput } from '../types/location';

export async function resolveLocation(input: LocationInput) {
  const coords = await resolveCoordinates(input);
  const station = await weatherService.findNearestStation(coords.latitude, coords.longitude);

  // Return existing location if we already have one for this station
  const existingLocation = await db.findLocationByStation(station.id);
  if (existingLocation) {
    const metrics = await db.findDerivedMetricsByStation(station.id);
    return {
      location: existingLocation,
      displayName: coords.displayName,
      station: { id: station.id, name: station.name },
      metrics,
    };
  }

  const location = await db.insertLocation(coords.latitude, coords.longitude, station.id);

  // Fetch and compute climate metrics
  const currentYear = dayjs().year();
  const fromDate = `${currentYear - 5}-01-01`;
  const toDate = `${currentYear - 1}-12-31`;

  const tempData = await weatherService.getTemperatureData(station.frostApiId, station.id, fromDate, toDate);

  const metrics = [];
  for (let year = currentYear - 5; year < currentYear; year++) {
    const yearRecords = tempData.filter((r) => r.date.startsWith(`${year}`));
    if (yearRecords.length < 100) continue;

    const computed = gddService.computeStationMetrics(station.id, year, yearRecords);
    const saved = await db.upsertDerivedMetrics(computed);
    metrics.push(saved);
  }

  return {
    location,
    displayName: coords.displayName,
    station: { id: station.id, name: station.name },
    metrics,
  };
}

export async function getLocation(id: string) {
  const location = await db.findLocationById(id);
  if (!location) return null;

  const metrics = await db.findDerivedMetricsByStation(location.nearestStationId);
  return { location, metrics };
}

async function resolveCoordinates(input: LocationInput) {
  if (input.type === 'coordinates') {
    return { latitude: input.latitude, longitude: input.longitude, displayName: `${input.latitude}, ${input.longitude}` };
  }

  if (input.type === 'municipality') {
    const result = await kartverket.geocodeMunicipality(input.query);
    if (!result) throw new Error(`Municipality not found: ${input.query}`);
    return result;
  }

  const result = await kartverket.geocodeAddress(input.query);
  if (!result) throw new Error(`Address not found: ${input.query}`);
  return result;
}
