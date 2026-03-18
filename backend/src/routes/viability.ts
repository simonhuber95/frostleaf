import { Router, type Router as RouterType } from 'express';
import * as viabilityService from '../services/viability';

export const viabilityRouter: RouterType = Router();

// GET /api/viability/:locationId — get viability report for a location
viabilityRouter.get('/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const result = await viabilityService.calculateViability(locationId);

    if (!result) {
      res.status(404).json({ error: 'Location not found or no climate data available' });
      return;
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
