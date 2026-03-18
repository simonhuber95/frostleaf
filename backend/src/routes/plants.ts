import { Router, type Router as RouterType } from 'express';
import {
  listPlants,
  getPlant,
  searchPlantsByQuery,
  getPlantFromCatalog,
  searchSpeciesByQuery,
  getSpecies,
} from '../services/plants';

export const plantsRouter: RouterType = Router();

// GET /api/plants — list all plants with thermal properties
plantsRouter.get('/', async (_req, res) => {
  const result = await listPlants();
  res.json(result);
});

// GET /api/plants/trefle/plants/search — search Trefle plants (lightweight)
plantsRouter.get('/trefle/plants/search', async (req, res) => {
  const q = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;

  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  try {
    const result = await searchPlantsByQuery(q, page);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/plants/trefle/plants/:id — get Trefle plant by ID (lightweight)
plantsRouter.get('/trefle/plants/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid plant ID' });
    return;
  }

  try {
    const result = await getPlantFromCatalog(id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/plants/trefle/species/search — search Trefle species (detailed)
plantsRouter.get('/trefle/species/search', async (req, res) => {
  const q = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;

  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  try {
    const result = await searchSpeciesByQuery(q, page);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/plants/trefle/species/:id — get Trefle species by ID (detailed, with growth data)
plantsRouter.get('/trefle/species/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid species ID' });
    return;
  }

  try {
    const result = await getSpecies(id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/plants/:id — single plant with thermal properties
plantsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await getPlant(id);

  if (!result) {
    res.status(404).json({ error: 'Plant not found' });
    return;
  }

  res.json(result);
});
