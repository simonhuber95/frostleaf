import { Router, type Router as RouterType } from 'express';
import { listPlants, getPlant, searchPlants, importExternal } from '../services/plants';

export const plantsRouter: RouterType = Router();

// GET /api/plants — list all plants
plantsRouter.get('/', async (_req, res) => {
  const result = await listPlants();
  res.json(result);
});

// GET /api/plants/search?q=&includeExternal=true — search plants, optionally include Trefle
plantsRouter.get('/search', async (req, res) => {
  const q = req.query.q as string;
  const includeExternal = req.query.includeExternal === 'true';

  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  try {
    const result = await searchPlants(q, includeExternal);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// POST /api/plants/import/:trefleId — import a plant from Trefle into our DB
plantsRouter.post('/import/:trefleId', async (req, res) => {
  const trefleId = parseInt(req.params.trefleId);
  if (isNaN(trefleId)) {
    res.status(400).json({ error: 'Invalid Trefle ID' });
    return;
  }

  try {
    const result = await importExternal(trefleId);
    if (!result) {
      res.status(404).json({ error: 'Plant not found on Trefle' });
      return;
    }
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/plants/:id — get plant by our UUID
plantsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await getPlant(id);

  if (!result) {
    res.status(404).json({ error: 'Plant not found' });
    return;
  }

  res.json(result);
});
