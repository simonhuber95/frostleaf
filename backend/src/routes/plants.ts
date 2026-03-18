import { Router, type Router as RouterType } from 'express';
import { db } from '../db/index.js';
import { plants, plantThermalProperties } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const plantsRouter: RouterType = Router();

// GET /api/plants — list all plants with thermal properties
plantsRouter.get('/', async (_req, res) => {
  const result = await db
    .select()
    .from(plants)
    .leftJoin(plantThermalProperties, eq(plantThermalProperties.plantId, plants.id))
    .orderBy(plants.commonName);

  const mapped = result.map((r) => ({
    ...r.plants,
    thermalProperties: r.plant_thermal_properties,
  }));

  res.json(mapped);
});

// GET /api/plants/:id — single plant with thermal properties
plantsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await db
    .select()
    .from(plants)
    .leftJoin(plantThermalProperties, eq(plantThermalProperties.plantId, plants.id))
    .where(eq(plants.id, id));

  if (result.length === 0) {
    res.status(404).json({ error: 'Plant not found' });
    return;
  }

  const r = result[0];
  res.json({
    ...r.plants,
    thermalProperties: r.plant_thermal_properties,
  });
});
