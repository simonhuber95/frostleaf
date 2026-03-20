import * as db from '../clients/db';
import * as kartverket from '../clients/kartverket';
import * as weatherService from './weather';
import type { LocationInput } from '../types/location';

export async function findNearbyStations(input: LocationInput) {
  const coords = await resolveCoordinates(input);
  const stations = await weatherService.findNearbyStations(coords.latitude, coords.longitude);

  return {
    displayName: coords.displayName,
    latitude: coords.latitude,
    longitude: coords.longitude,
    stations,
  };
}

export async function resolveLocation(
  latitude: number,
  longitude: number,
  stationId: string,
  displayName: string,
) {
  const station = await db.findStationById(stationId);
  if (!station) throw new Error('Station not found');

  // Return existing location if we already have one for this station
  const existingLocation = await db.findLocationByStation(station.id);
  if (existingLocation) {
    await weatherService.getStationClimate(station.frostApiId, station.id);
    const updatedStation = await db.findStationById(station.id);

    return {
      location: existingLocation,
      displayName,
      station: { id: station.id, name: station.name },
      climate: updatedStation,
    };
  }

  const location = await db.insertLocation(latitude, longitude, station.id);

  await weatherService.getStationClimate(station.frostApiId, station.id);
  const updatedStation = await db.findStationById(station.id);

  return {
    location,
    displayName,
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
