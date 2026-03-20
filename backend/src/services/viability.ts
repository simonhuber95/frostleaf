import dayjs from 'dayjs';
import * as db from '../clients/db';
import { computeMonthlyAverages, findThresholdDate } from './gdd';
import { calculatePeakDaylightHours } from './daylight';
import { getStationClimate } from './weather';
import type { PhotoperiodWarning, ViabilityReport, ViabilityResult } from '../types/viability';

export async function calculateViability(locationId: string): Promise<ViabilityReport | null> {
  const location = await db.findLocationById(locationId);
  if (!location) return null;

  const station = await db.findStationById(location.nearestStationId);
  if (!station) return null;

  const peakDaylightHours = calculatePeakDaylightHours(location.latitude);

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
    const sowingMethod = props?.sowingMethod ?? null;
    const transplantLeadWeeks = props?.transplantLeadWeeks ?? null;

    const { isViable, score } = computeScore(averageGdd, requiredGdd, baseTemp, avgFrostFreeDays, daysToHarvest);

    // Direct sow threshold: hardy crops (minTemp < 0) when avgMin >= 0 (frost-free)
    //                        tender crops (minTemp >= 0) when avgMin >= baseTemp
    const sowThreshold = minTemp !== null && minTemp < 0 ? 0 : (baseTemp ?? 0);
    const sowStart = findThresholdDate(dailyAverages, sowThreshold, 'avgMin');
    // Growth: when avg mean temp >= plant's base growth temp
    const growStart = baseTemp !== null ? findThresholdDate(dailyAverages, baseTemp, 'avgMean') : null;

    let timeline: ViabilityResult['timeline'] = null;

    if (growStart) {
      const growStartDay = dayjs(`2024-${growStart}`);

      // Transplant date: tender crops wait until after last frost + 1 week safety margin
      // Hardy crops can transplant when soil is workable (growStart)
      const isTender = minTemp !== null && minTemp >= 0;
      let transplantDate: string | null = null;
      let indoorSowStart: string | null = null;
      let indoorSowEnd: string | null = null;
      let directSowStart: string | null = null;
      let directSowEnd: string | null = null;

      if (sowingMethod === 'indoor' || sowingMethod === 'both') {
        if (isTender && lastFrostSpring) {
          transplantDate = dayjs(`2024-${lastFrostSpring}`).add(7, 'day').format('MM-DD');
        } else {
          transplantDate = growStart;
        }

        if (transplantLeadWeeks && transplantDate) {
          indoorSowStart = dayjs(`2024-${transplantDate}`)
            .subtract(transplantLeadWeeks, 'week')
            .format('MM-DD');
          // Indoor sow ends the day before transplant (no overlap)
          indoorSowEnd = dayjs(`2024-${transplantDate}`).subtract(1, 'day').format('MM-DD');
        }
      }

      if (sowingMethod === 'direct' || sowingMethod === 'both') {
        if (sowStart && dayjs(`2024-${sowStart}`).isBefore(growStartDay)) {
          directSowStart = sowStart;
        } else {
          directSowStart = growStartDay.subtract(5, 'day').format('MM-DD');
        }
        // Direct sow ends the day before growth (no overlap)
        directSowEnd = growStartDay.subtract(1, 'day').format('MM-DD');
      }

      // Harvest calculation
      let harvestStart: string | null = null;
      let harvestEnd: string | null = null;
      let growthEnd: string;

      if (daysToHarvest) {
        const harvestDay = growStartDay.add(daysToHarvest, 'day');
        if (harvestDay.year() === 2024) {
          // Harvest starts the day after growth ends (no overlap)
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
        sowingMethod,
        indoorSowStart,
        indoorSowEnd,
        transplantDate,
        directSowStart,
        directSowEnd,
        growthStart: growStart,
        growthEnd,
        harvestStart: harvestStart ?? growthEnd,
        harvestEnd: harvestEnd ?? growthEnd,
      };
    }

    const photoperiodClass = props?.photoperiodClass ?? null;
    const photoperiodWarnings = computePhotoperiodWarnings(photoperiodClass, peakDaylightHours);

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
      photoperiodClass,
      photoperiodWarnings,
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
    peakDaylightHours,
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

function computePhotoperiodWarnings(
  photoperiodClass: string | null,
  peakDaylightHours: number,
): PhotoperiodWarning[] {
  if (!photoperiodClass) return [];

  const warnings: PhotoperiodWarning[] = [];

  if (photoperiodClass === 'long_day') {
    if (peakDaylightHours >= 20) {
      warnings.push({
        type: 'bolting_risk',
        severity: 'warning',
        message: 'Bolting risk — 20+ hours of summer daylight may cause early bolting in this long-day plant.',
      });
    } else if (peakDaylightHours >= 18) {
      warnings.push({
        type: 'extended_daylight',
        severity: 'info',
        message: 'Extended daylight (18+ hours) — leafy long-day crops may bolt earlier than expected.',
      });
    }
  }

  if (photoperiodClass === 'short_day') {
    if (peakDaylightHours >= 20) {
      warnings.push({
        type: 'flowering_unlikely',
        severity: 'warning',
        message: 'Flowering unlikely — midnight sun conditions prevent the short nights needed to trigger flowering.',
      });
    } else if (peakDaylightHours >= 18) {
      warnings.push({
        type: 'flowering_unlikely',
        severity: 'info',
        message: 'Long summer days (18+ hours) may delay or prevent flowering in this short-day plant.',
      });
    }
  }

  return warnings;
}
