import * as db from '../clients/db';
import type { ViabilityReport, ViabilityResult } from '../types/viability';

export async function calculateViability(locationId: string): Promise<ViabilityReport | null> {
  const location = await db.findLocationById(locationId);
  if (!location) return null;

  const metrics = await db.findDerivedMetricsByStation(location.nearestStationId);
  if (metrics.length === 0) return null;

  // Average GDD and frost data across available years
  const averageGdd = metrics.reduce((sum, m) => sum + m.gddAccumulated, 0) / metrics.length;
  const averageFrostFree = Math.round(metrics.reduce((sum, m) => sum + m.frostFreeDays, 0) / metrics.length);

  // Use the most recent year's frost dates as representative
  const latest = metrics.sort((a, b) => b.year - a.year)[0];

  const allPlants = await db.findAllPlants();
  const station = await db.findStationById(location.nearestStationId);

  const plants: ViabilityResult[] = allPlants.map((plant) => {
    const props = plant.properties;
    const requiredGdd = props?.gddRequired ?? null;
    const tBase = props?.tBase ?? null;
    const confidence = props?.thermalConfidence ?? null;

    const { isViable, score } = computeScore(averageGdd, requiredGdd, tBase, averageFrostFree, props?.daysToHarvest ?? null);

    return {
      plantId: plant.id,
      commonName: plant.commonName,
      scientificName: plant.scientificName,
      cropGroup: plant.cropGroup,
      imageUrl: plant.imageUrl,
      isViable,
      viabilityScore: score,
      locationGdd: Math.round(averageGdd),
      requiredGdd,
      confidence,
    };
  });

  // Sort by viability score descending
  plants.sort((a, b) => b.viabilityScore - a.viabilityScore);

  return {
    locationId,
    stationName: station?.name ?? 'Unknown',
    averageGdd: Math.round(averageGdd),
    frostFreeDays: averageFrostFree,
    lastFrostSpring: latest.lastFrostSpring,
    firstFrostAutumn: latest.firstFrostAutumn,
    plants,
  };
}

function computeScore(
  locationGdd: number,
  requiredGdd: number | null,
  tBase: number | null,
  frostFreeDays: number,
  daysToHarvest: number | null,
): { isViable: boolean; score: number } {
  // No GDD data — can't determine viability, give a neutral score
  if (!requiredGdd) {
    // If we have days to harvest, check against frost-free window
    if (daysToHarvest && daysToHarvest <= frostFreeDays) {
      return { isViable: true, score: 0.5 };
    }
    if (daysToHarvest && daysToHarvest > frostFreeDays) {
      return { isViable: false, score: 0.2 };
    }
    return { isViable: false, score: 0.3 };
  }

  const ratio = locationGdd / requiredGdd;

  // Clearly viable — location provides more GDD than needed
  if (ratio >= 1.2) return { isViable: true, score: 1.0 };
  if (ratio >= 1.0) return { isViable: true, score: 0.8 + (ratio - 1.0) * 1.0 };

  // Marginal — close but might not make it
  if (ratio >= 0.8) return { isViable: false, score: 0.4 + (ratio - 0.8) * 2.0 };

  // Not viable
  return { isViable: false, score: Math.max(0, ratio * 0.5) };
}
