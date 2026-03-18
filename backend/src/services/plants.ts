import * as db from '../clients/db';
import * as trefleClient from '../clients/trefle';
import type { TrefleExternalPlant } from '../clients/trefle';

// --- Query our DB ---

export async function listPlants() {
  return db.findAllPlants();
}

export async function getPlant(id: string) {
  const plant = await db.findPlantById(id);
  if (!plant) return null;

  // No enrichment needed for non-Trefle or already enriched plants
  if (plant.source !== 'trefle') return plant;
  if (!plant.externalId) return plant;
  if (plant.properties?.lastEnrichedAt) return plant;

  // Lazy enrich: fetch full detail from Trefle
  const trefleId = parseTrefleId(plant.externalId);
  if (!trefleId) return plant;

  const external = await trefleClient.fetchById(trefleId);
  if (!external) return plant;

  const properties = await db.upsertPlantProperties({
    plantId: plant.id,
    ...mapTrefleToProperties(external),
  });

  return { ...plant, properties };
}

export async function searchPlants(query: string, includeExternal = false) {
  const local = await db.searchPlants(query);

  if (!includeExternal) {
    return local;
  }

  // Fetch from Trefle and persist any we don't already have
  const trefleResponse = await trefleClient.search(query);
  const localExternalIds = new Set(local.map((p) => p.externalId).filter(Boolean));

  const newSpecies = (trefleResponse?.data ?? []).filter((s) => !localExternalIds.has(`trefle:${s.id}`));

  for (const species of newSpecies) {
    const externalId = `trefle:${species.id}`;

    const plant = await db.insertPlant({
      scientificName: species.scientific_name,
      commonName: species.common_name ?? species.scientific_name,
      family: species.family ?? 'Unknown',
      cropGroup: 'vegetable',
      source: 'trefle',
      externalId,
      imageUrl: species.image_url ?? null,
    });

    await db.upsertPlantProperties({ plantId: plant.id });
  }

  // Re-query DB to include newly imported plants
  if (newSpecies.length > 0) {
    return db.searchPlants(query);
  }

  return local;
}

// --- Import from external source into our DB ---

export async function importExternal(trefleId: number) {
  // Check if already imported
  const externalId = `trefle:${trefleId}`;
  const existing = await db.findPlantByExternalId(externalId);
  if (existing) return existing;

  // Fetch from Trefle
  const external = await trefleClient.fetchById(trefleId);
  if (!external) return null;

  // Persist to our DB
  const plant = await db.insertPlant({
    scientificName: external.scientificName,
    commonName: external.commonName ?? external.scientificName,
    family: external.family ?? 'Unknown',
    cropGroup: 'vegetable',
    source: 'trefle',
    externalId: external.externalId,
    imageUrl: external.imageUrl,
  });

  const properties = await db.upsertPlantProperties({
    plantId: plant.id,
    ...mapTrefleToProperties(external),
  });

  return { ...plant, properties };
}

// --- Mapping ---

function mapTrefleToProperties(external: TrefleExternalPlant) {
  const species = external.species;
  if (!species) return {};

  const growth = species.growth;

  return {
    daysToHarvest: growth?.days_to_harvest ?? null,
    lightRequirement: mapLight(growth?.light),
    duration: mapDuration(species.duration),
    edibleParts: (species.edible_part?.filter(Boolean) as string[]) ?? [],
    description: growth?.description ?? null,
    sowingInfo: growth?.sowing ?? null,
    bloomMonths: (growth?.bloom_months?.filter(Boolean) as string[]) ?? [],
    growthMonths: (growth?.growth_months?.filter(Boolean) as string[]) ?? [],
    minTemperature: growth?.minimum_temperature?.deg_c ?? null,
    maxTemperature: growth?.maximum_temperature?.deg_c ?? null,
  };
}

function parseTrefleId(externalId: string): number | null {
  const match = externalId.match(/^trefle:(\d+)$/);
  return match ? parseInt(match[1]) : null;
}

function mapLight(light: number | null | undefined): 'full_sun' | 'partial_shade' | 'full_shade' | null {
  if (light == null) return null;
  if (light >= 7) return 'full_sun';
  if (light >= 4) return 'partial_shade';
  return 'full_shade';
}

function mapDuration(
  duration: ('annual' | 'biennial' | 'perennial' | null)[] | null | undefined,
): 'annual' | 'biennial' | 'perennial' | null {
  if (!duration || duration.length === 0) return null;
  const first = duration.find((d) => d !== null);
  if (first === 'annual' || first === 'biennial' || first === 'perennial') return first;
  return null;
}
