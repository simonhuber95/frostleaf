import { Router, type Router as RouterType } from 'express';
import dayjs from 'dayjs';
import * as db from '../clients/db';
import { findNearestStation, getTemperatureData } from '../services/weather';
import { computeStationMetrics } from '../services/gdd';

export const locationRouter: RouterType = Router();

// POST /api/location — resolve location to nearest weather station, fetch climate data
locationRouter.post('/', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ error: 'latitude and longitude are required as numbers' });
    return;
  }

  try {
    const station = await findNearestStation(latitude, longitude);
    const location = await db.insertLocation(latitude, longitude, station.id);

    const currentYear = dayjs().year();
    const fromDate = `${currentYear - 5}-01-01`;
    const toDate = `${currentYear - 1}-12-31`;

    const tempData = await getTemperatureData(station.frostApiId, station.id, fromDate, toDate);

    const metricsResults = [];
    for (let year = currentYear - 5; year < currentYear; year++) {
      const yearRecords = tempData.filter((r) => r.date.startsWith(`${year}`));
      if (yearRecords.length < 100) continue;

      const metrics = computeStationMetrics(station.id, year, yearRecords);
      const saved = await db.upsertDerivedMetrics(metrics);
      metricsResults.push(saved);
    }

    res.json({
      location,
      station: { id: station.id, name: station.name, frostApiId: station.frostApiId },
      metrics: metricsResults,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/location/:id — get location with its station and metrics
locationRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const location = await db.findLocationById(id);
  if (!location) {
    res.status(404).json({ error: 'Location not found' });
    return;
  }

  const metrics = await db.findDerivedMetricsByStation(location.nearestStationId);
  res.json({ location, metrics });
});
