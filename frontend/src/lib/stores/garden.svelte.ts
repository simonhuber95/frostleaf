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

  createGarden(name: string, locationId: string, latitude: number, longitude: number): LocalGarden {
    const garden: LocalGarden = {
      id: crypto.randomUUID(),
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
    return true;
  },

  removePlant(gardenId: string, plantId: string) {
    const garden = gardens.find((g) => g.id === gardenId);
    if (!garden) return;
    garden.plants = garden.plants.filter((p) => p.plantId !== plantId);
    persist();
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
        for (const plant of garden.plants) {
          await gardensApi.addPlantToGarden(serverGarden.id, plant.plantId, plant.notes);
        }
        synced++;
      } catch {
        // skip gardens that fail (e.g. invalid locationId)
      }
    }
    return synced;
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
