import dayjs from 'dayjs';
import * as db from '../clients/db';
import { computeMonthlyAverages, findThresholdDate } from './gdd';
import { getStationClimate } from './weather';
import type { ViabilityReport, ViabilityResult } from '../types/viability';

export async function calculateViability(locationId: string): Promise<ViabilityReport | null> {
  const location = await db.findLocationById(locationId);
  if (!location) return null;

  const station = await db.findStationById(location.nearestStationId);
  if (!station) return null;

  // Get pre-computed daily averages (fetches + caches if needed)
  const dailyAverages = await getStationClimate(station.frostApiId, station.id);
  if (dailyAverages.length === 0) return null;

  // Reload station to get updated metrics (may have been computed by getStationClimate)
  const updatedStation = await db.findStationById(station.id);
  const averageGdd = updatedStation?.avgGdd ?? 0;
  const avgFrostFreeDays = updatedStation?.avgFrostFreeDays ?? 0;
  const lastFrostSpring = updatedStation?.lastFrostSpring ?? null;
  const firstFrostAutumn = updatedStation?.firstFrostAutumn ?? null;

  const monthlyAverages = computeMonthlyAverages(dailyAverages);

  const allPlants = await db.findAllPlants();

  const plants: ViabilityResult[] = allPlants.map((plant) => {
    const props = plant.properties;
    const requiredGdd = props?.gddRequired ?? null;
    const baseTemp = props?.baseTemperature ?? null;
    const confidence = props?.thermalConfidence ?? null;
    const minTemp = props?.minTemperature ?? null;
    const daysToHarvest = props?.daysToHarvest ?? null;

    const { isViable, score } = computeScore(averageGdd, requiredGdd, baseTemp, avgFrostFreeDays, daysToHarvest);

    // Sowing: hardy crops (minTemp < 0) can sow when avgMin >= 0 (frost-free)
    //         tender crops (minTemp >= 0) sow when avgMin >= baseTemp
    const sowThreshold = minTemp !== null && minTemp < 0 ? 0 : (baseTemp ?? 0);
    const sowStart = findThresholdDate(dailyAverages, sowThreshold, 'avgMin');
    // Growth: when avg mean temp >= plant's base growth temp (avgMean)
    const growStart = baseTemp !== null ? findThresholdDate(dailyAverages, baseTemp, 'avgMean') : null;

    let timeline: { sowingStart: string; sowingEnd: string; growthStart: string; growthEnd: string; harvestStart: string; harvestEnd: string } | null = null;

    if (growStart) {
      const growStartDay = dayjs(`2024-${growStart}`);

      // Sowing phase: from tMin threshold to day before growth starts
      // When tMin === tBase or no sowing data, show a 5-day sowing window before growth
      let sowingStart: string;
      let sowingEnd: string;
      if (sowStart && sowStart !== growStart) {
        sowingStart = sowStart;
        sowingEnd = growStartDay.subtract(1, 'day').format('MM-DD');
      } else {
        sowingStart = growStartDay.subtract(5, 'day').format('MM-DD');
        sowingEnd = growStartDay.subtract(1, 'day').format('MM-DD');
      }

      // Growth phase: from tBase threshold to harvest start
      let harvestStart: string | null = null;
      let harvestEnd: string | null = null;
      let growthEnd: string;

      if (daysToHarvest) {
        const harvestDay = growStartDay.add(daysToHarvest, 'day');
        if (harvestDay.year() === 2024) {
          harvestStart = harvestDay.format('MM-DD');
          harvestEnd = harvestDay.add(14, 'day').format('MM-DD');
          growthEnd = harvestDay.subtract(1, 'day').format('MM-DD');
        } else {
          growthEnd = '12-31';
        }
      } else {
        growthEnd = firstFrostAutumn ?? '10-15';
      }

      timeline = {
        sowingStart,
        sowingEnd,
        growthStart: growStart,
        growthEnd,
        harvestStart: harvestStart ?? growthEnd,
        harvestEnd: harvestEnd ?? growthEnd,
      };
    }

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
      timeline,
    };
  });

  plants.sort((a, b) => b.viabilityScore - a.viabilityScore);

  return {
    locationId,
    stationName: station.name,
    averageGdd: Math.round(averageGdd),
    frostFreeDays: avgFrostFreeDays,
    lastFrostSpring,
    firstFrostAutumn,
    monthlyAverages,
    plants,
  };
}

function computeScore(
  locationGdd: number,
  requiredGdd: number | null,
  _tBase: number | null,
  frostFreeDays: number,
  daysToHarvest: number | null,
): { isViable: boolean; score: number } {
  if (!requiredGdd) {
    if (daysToHarvest && daysToHarvest <= frostFreeDays) {
      return { isViable: true, score: 0.5 };
    }
    if (daysToHarvest && daysToHarvest > frostFreeDays) {
      return { isViable: false, score: 0.2 };
    }
    return { isViable: false, score: 0.3 };
  }

  const ratio = locationGdd / requiredGdd;

  if (ratio >= 1.2) return { isViable: true, score: 1.0 };
  if (ratio >= 1.0) return { isViable: true, score: 0.8 + (ratio - 1.0) * 1.0 };
  if (ratio >= 0.8) return { isViable: false, score: 0.4 + (ratio - 0.8) * 2.0 };

  return { isViable: false, score: Math.max(0, ratio * 0.5) };
}
