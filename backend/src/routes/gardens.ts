import { Router, type Router as RouterType } from 'express';
import * as gardenService from '../services/garden';
import { requireAuth } from '../middleware/auth';

export const gardensRouter: RouterType = Router();

// All garden routes require auth
gardensRouter.use(requireAuth);

// POST /api/gardens — create a garden
gardensRouter.post('/', async (req, res) => {
  const userId = req.userId!;
  const { name, locationId } = req.body;

  if (!name || !locationId) {
    res.status(400).json({ error: 'name and locationId are required' });
    return;
  }

  try {
    const garden = await gardenService.createGarden(userId, name, locationId);
    res.status(201).json(garden);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/gardens — list user's gardens
gardensRouter.get('/', async (req, res) => {
  const userId = req.userId!;

  try {
    const gardens = await gardenService.listUserGardens(userId);
    res.json(gardens);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/gardens/:id — get garden with plants
gardensRouter.get('/:id', async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const garden = await gardenService.getGardenWithPlants(id);
    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }
    if (garden.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    res.json(garden);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// PUT /api/gardens/:id — update garden
gardensRouter.put('/:id', async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { name, locationId } = req.body;

  try {
    const garden = await gardenService.getGardenWithPlants(id);
    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }
    if (garden.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await gardenService.updateGarden(id, { name, locationId });
    res.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/gardens/:id — delete garden
gardensRouter.delete('/:id', async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const garden = await gardenService.getGardenWithPlants(id);
    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }
    if (garden.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await gardenService.deleteGarden(id);
    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// POST /api/gardens/:id/plants — add plant to garden
gardensRouter.post('/:id/plants', async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { plantId, notes } = req.body;

  if (!plantId) {
    res.status(400).json({ error: 'plantId is required' });
    return;
  }

  try {
    const garden = await gardenService.getGardenWithPlants(id);
    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }
    if (garden.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const gardenPlant = await gardenService.addPlant(id, plantId, notes);
    res.status(201).json(gardenPlant);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/gardens/:id/plants/:plantId — remove plant from garden
gardensRouter.delete('/:id/plants/:plantId', async (req, res) => {
  const userId = req.userId!;
  const { id, plantId } = req.params;

  try {
    const garden = await gardenService.getGardenWithPlants(id);
    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }
    if (garden.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await gardenService.removePlant(id, plantId);
    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// PATCH /api/gardens/:id/plants/:plantId — update plant notes/date
gardensRouter.patch('/:id/plants/:plantId', async (req, res) => {
  const userId = req.userId!;
  const { id, plantId } = req.params;
  const { notes, plantedDate } = req.body;

  try {
    const garden = await gardenService.getGardenWithPlants(id);
    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }
    if (garden.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await gardenService.updatePlant(id, plantId, { notes, plantedDate });
    res.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /api/gardens/:id/export — export garden as JSON
gardensRouter.get('/:id/export', async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const garden = await gardenService.getGardenWithPlants(id);
    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }
    if (garden.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const exportData = await gardenService.exportGarden(id);
    res.json(exportData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
