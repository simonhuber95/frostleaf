export interface Plant {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  cropGroup: CropGroup;
  daysToHarvest: number;
  lightRequirement: LightRequirement;
  soilPreferences: string[];
}

export interface PlantThermalProperties {
  plantId: string;
  tBase: number;
  tUpper: number;
  gddRequired: number | null;
  source: ThermalDataSource;
  confidence: ConfidenceLevel;
}

export type CropGroup = 'vegetable' | 'herb' | 'fruit' | 'berry' | 'legume' | 'root' | 'brassica' | 'leafy_green';

export type LightRequirement = 'full_sun' | 'partial_shade' | 'full_shade';

export type ThermalDataSource = 'measured' | 'estimated' | 'inferred';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface PlantViability {
  plant: Plant;
  thermalProperties: PlantThermalProperties;
  viabilityScore: number; // 0-1
  isViable: boolean;
  locationGdd: number;
  requiredGdd: number;
}
