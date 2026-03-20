export type Plant = {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  cropGroup: CropGroup;
  source: PlantSource;
  externalId: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type SowingMethod = 'indoor' | 'direct' | 'both';

export type PlantProperties = {
  plantId: string;
  daysToHarvest: number | null;
  lightRequirement: LightRequirement | null;
  soilPreferences: string[];
  duration: Duration | null;
  edibleParts: string[];
  description: string | null;
  sowingMethod: SowingMethod | null;
  transplantLeadWeeks: number | null;
  sowingInfo: string | null;
  bloomMonths: string[];
  growthMonths: string[];
  minTemperature: number | null;
  baseTemperature: number | null;
  maxTemperature: number | null;
  gddRequired: number | null;
  thermalSource: ThermalDataSource | null;
  thermalConfidence: ConfidenceLevel | null;
  lastEnrichedAt: string | null;
};

export type PlantWithProperties = Plant & {
  properties: PlantProperties | null;
};

export type CropGroup = 'vegetable' | 'herb' | 'fruit' | 'berry' | 'legume' | 'root' | 'brassica' | 'leafy_green';

export type PlantSource = 'seed' | 'trefle' | 'manual';

export type Duration = 'annual' | 'biennial' | 'perennial';

export type LightRequirement = 'full_sun' | 'partial_shade' | 'full_shade';

export type ThermalDataSource = 'measured' | 'estimated' | 'inferred';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type PlantViability = {
  plant: PlantWithProperties;
  viabilityScore: number; // 0-1
  isViable: boolean;
  locationGdd: number;
  requiredGdd: number;
};
