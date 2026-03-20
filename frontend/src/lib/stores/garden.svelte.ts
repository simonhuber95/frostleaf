import type { LocalGarden, LocalGardenPlant } from '@frostleaf/shared';
import * as gardensApi from '$lib/api/gardens';

const STORAGE_KEY = 'frostleaf-gardens';

let gardens = $state<LocalGarden[]>([]);
let activeGardenId = $state<string | null>(null);

function persist() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ gardens, activeGardenId }));
}

export const gardenStore = {
  get gardens() {
    return gardens;
  },
  get activeGardenId() {
    return activeGardenId;
  },
  get activeGarden(): LocalGarden | undefined {
    return gardens.find((g) => g.id === activeGardenId);
  },

  getGarden(id: string): LocalGarden | undefined {
    return gardens.find((g) => g.id === id);
  },

  async createGarden(name: string, locationId: string, latitude: number, longitude: number): Promise<LocalGarden> {
    let id: string = crypto.randomUUID();

    // Try to create on server first (if logged in, this will succeed)
    try {
      const serverGarden = await gardensApi.createGarden(name, locationId);
      id = serverGarden.id;
    } catch {
      // Not logged in or server unavailable — local only
    }

    const garden: LocalGarden = {
      id,
      name,
      locationId,
      latitude,
      longitude,
      plants: [],
      createdAt: new Date().toISOString(),
    };
    gardens.push(garden);
    activeGardenId = garden.id;
    persist();
    return garden;
  },

  deleteGarden(id: string) {
    gardens = gardens.filter((g) => g.id !== id);
    if (activeGardenId === id) {
      activeGardenId = gardens[0]?.id ?? null;
    }
    persist();
  },

  updateGarden(id: string, patch: Partial<Pick<LocalGarden, 'name' | 'locationId' | 'latitude' | 'longitude'>>) {
    const garden = gardens.find((g) => g.id === id);
    if (!garden) return;
    Object.assign(garden, patch);
    persist();
  },

  addPlant(gardenId: string, plantId: string, commonName: string, sowingChoice: 'indoor' | 'direct' | null = null): boolean {
    const garden = gardens.find((g) => g.id === gardenId);
    if (!garden) return false;
    if (garden.plants.some((p) => p.plantId === plantId)) return false;
    garden.plants.push({ plantId, commonName, plantedDate: null, notes: '', sowingChoice });
    persist();
    // Sync to server (fire and forget)
    gardensApi.addPlantToGarden(gardenId, plantId).catch(() => {});
    return true;
  },

  removePlant(gardenId: string, plantId: string) {
    const garden = gardens.find((g) => g.id === gardenId);
    if (!garden) return;
    garden.plants = garden.plants.filter((p) => p.plantId !== plantId);
    persist();
    // Sync to server (fire and forget)
    gardensApi.removePlantFromGarden(gardenId, plantId).catch(() => {});
  },

  updatePlant(gardenId: string, plantId: string, patch: Partial<Pick<LocalGardenPlant, 'notes' | 'plantedDate' | 'sowingChoice'>>) {
    const garden = gardens.find((g) => g.id === gardenId);
    if (!garden) return;
    const plant = garden.plants.find((p) => p.plantId === plantId);
    if (!plant) return;
    Object.assign(plant, patch);
    persist();
  },

  setActive(id: string | null) {
    activeGardenId = id;
    persist();
  },

  importGarden(garden: LocalGarden) {
    garden.id = crypto.randomUUID();
    gardens.push(garden);
    activeGardenId = garden.id;
    persist();
  },

  init() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        gardens = data.gardens ?? [];
        activeGardenId = data.activeGardenId ?? null;
      } catch {
        // ignore corrupt data
      }
    }
  },

  /** Sync local gardens to the server (call after login). Returns number of gardens synced. */
  async syncToServer(): Promise<number> {
    let synced = 0;
    for (const garden of gardens) {
      try {
        const serverGarden = await gardensApi.createGarden(garden.name, garden.locationId);
        // Update local ID to match server
        const oldId = garden.id;
        garden.id = serverGarden.id;
        if (activeGardenId === oldId) activeGardenId = serverGarden.id;
        for (const plant of garden.plants) {
          await gardensApi.addPlantToGarden(serverGarden.id, plant.plantId, plant.notes);
        }
        synced++;
      } catch {
        // skip gardens that fail (e.g. invalid locationId)
      }
    }
    persist();
    return synced;
  },

  /** Ensure a garden exists on the server. Creates it if needed, returns the server garden ID. */
  async ensureServerGarden(gardenId: string): Promise<string | null> {
    const garden = gardens.find((g) => g.id === gardenId);
    if (!garden) return null;

    // Check if it already exists on the server
    try {
      await gardensApi.getGarden(gardenId);
      return gardenId;
    } catch {
      // Not on server — create it
    }

    try {
      const serverGarden = await gardensApi.createGarden(garden.name, garden.locationId);
      const oldId = garden.id;
      garden.id = serverGarden.id;
      if (activeGardenId === oldId) activeGardenId = serverGarden.id;
      for (const plant of garden.plants) {
        await gardensApi.addPlantToGarden(serverGarden.id, plant.plantId, plant.notes);
      }
      persist();
      return serverGarden.id;
    } catch {
      return null;
    }
  },

  /** Load gardens from server (replaces local state). */
  async loadFromServer() {
    try {
      const serverGardens = await gardensApi.listGardens();
      const localGardens: LocalGarden[] = [];

      for (const sg of serverGardens) {
        try {
          const full = await gardensApi.getGarden(sg.id);
          localGardens.push({
            id: full.id,
            name: full.name,
            locationId: full.locationId,
            latitude: 0,
            longitude: 0,
            plants: full.plants.map((p) => ({
              plantId: p.plantId,
              commonName: p.commonName,
              plantedDate: p.plantedDate,
              notes: p.notes,
              sowingChoice: null,
            })),
            createdAt: full.createdAt,
          });
        } catch {
          // skip gardens that fail to load
        }
      }

      gardens = localGardens;
      activeGardenId = localGardens[0]?.id ?? null;
      persist();
    } catch {
      // keep local state if server is unreachable
    }
  },
};
