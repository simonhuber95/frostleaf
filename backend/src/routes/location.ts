import { Router, type Router as RouterType } from 'express';
import * as locationService from '../services/location';
import type { LocationInput } from '../types/location';

export const locationRouter: RouterType = Router();

// GET /api/location/nearby?type=municipality&query=Salangen
// Returns nearby stations for user to pick from
locationRouter.get('/nearby', async (req, res) => {
  const { type, latitude, longitude, query } = req.query;

  if (!type || !['coordinates', 'address', 'municipality'].includes(type as string)) {
    res.status(400).json({ error: 'type must be "coordinates", "address", or "municipality"' });
    return;
  }

  let input: LocationInput;

  if (type === 'coordinates') {
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ error: 'latitude and longitude are required for type "coordinates"' });
      return;
    }
    input = { type: 'coordinates', latitude: lat, longitude: lon };
  } else {
    if (typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'query is required for type "address" or "municipality"' });
      return;
    }
    input = { type: type as 'address' | 'municipality', query };
  }

  try {
    const result = await locationService.findNearbyStations(input);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// POST /api/location/resolve
// Creates a location with a user-chosen station
locationRouter.post('/resolve', async (req, res) => {
  const { latitude, longitude, stationId, displayName } = req.body;

  if (!latitude || !longitude || !stationId || !displayName) {
    res.status(400).json({ error: 'latitude, longitude, stationId, and displayName are required' });
    return;
  }

  try {
    const result = await locationService.resolveLocation(latitude, longitude, stationId, displayName);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/location/:id/climate — daily temperature averages for charting
locationRouter.get('/:id/climate', async (req, res) => {
  try {
    const result = await locationService.getLocationClimate(req.params.id);
    if (!result) {
      res.status(404).json({ error: 'Location not found or no climate data' });
      return;
    }
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/location/:id
locationRouter.get('/:id', async (req, res) => {
  const result = await locationService.getLocation(req.params.id);

  if (!result) {
    res.status(404).json({ error: 'Location not found' });
    return;
  }

  res.json(result);
});
