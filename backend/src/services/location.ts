import * as db from '../clients/db';
import * as kartverket from '../clients/kartverket';
import * as weatherService from './weather';
import type { LocationInput } from '../types/location';

export async function resolveLocation(input: LocationInput) {
  const coords = await resolveCoordinates(input);
  const station = await weatherService.findNearestStation(coords.latitude, coords.longitude);

  // Return existing location if we already have one for this station
  const existingLocation = await db.findLocationByStation(station.id);
  if (existingLocation) {
    // Ensure climate data is computed/cached
    await weatherService.getStationClimate(station.frostApiId, station.id);
    const updatedStation = await db.findStationById(station.id);

    return {
      location: existingLocation,
      displayName: coords.displayName,
      station: { id: station.id, name: station.name },
      climate: updatedStation,
    };
  }

  const location = await db.insertLocation(coords.latitude, coords.longitude, station.id);

  // Fetch and compute climate averages (handles caching internally)
  await weatherService.getStationClimate(station.frostApiId, station.id);
  const updatedStation = await db.findStationById(station.id);

  return {
    location,
    displayName: coords.displayName,
    station: { id: station.id, name: station.name },
    climate: updatedStation,
  };
}

export async function getLocation(id: string) {
  const location = await db.findLocationById(id);
  if (!location) return null;

  const station = await db.findStationById(location.nearestStationId);
  return { location, climate: station };
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
