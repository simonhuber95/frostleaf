import { Router, type Router as RouterType } from 'express';
import * as locationService from '../services/location';
import type { LocationInput } from '../types/location';

export const locationRouter: RouterType = Router();

// GET /api/location/resolve?type=coordinates&latitude=59.9&longitude=10.7
// GET /api/location/resolve?type=address&query=Karl+Johans+gate
// GET /api/location/resolve?type=municipality&query=Oslo
locationRouter.get('/resolve', async (req, res) => {
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
    const result = await locationService.resolveLocation(input);
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
