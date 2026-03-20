export type PlantTimeline = {
  sowingMethod: 'indoor' | 'direct' | 'both' | null;
  // Indoor path (non-overlapping: indoorSowStart..indoorSowEnd → transplantDate → growthStart)
  indoorSowStart: string | null;   // MM-DD
  indoorSowEnd: string | null;     // MM-DD — day before transplant
  transplantDate: string | null;    // MM-DD
  // Direct path
  directSowStart: string | null;   // MM-DD
  directSowEnd: string | null;     // MM-DD — day before growth
  // Phases (all non-overlapping)
  growthStart: string;   // MM-DD
  growthEnd: string;     // MM-DD — day before harvest
  harvestStart: string;  // MM-DD
  harvestEnd: string;    // MM-DD
};

export type PhotoperiodWarning = {
  type: 'bolting_risk' | 'flowering_unlikely' | 'extended_daylight';
  severity: 'info' | 'warning';
  message: string;
};

export type ViabilityResult = {
  plantId: string;
  commonName: string;
  scientificName: string;
  cropGroup: string;
  imageUrl: string | null;
  isViable: boolean;
  viabilityScore: number; // 0-1
  locationGdd: number;
  requiredGdd: number | null;
  confidence: 'high' | 'medium' | 'low' | null;
  photoperiodClass: 'long_day' | 'short_day' | 'day_neutral' | null;
  photoperiodWarnings: PhotoperiodWarning[];
  timeline: PlantTimeline | null;
};

export type ViabilityReport = {
  locationId: string;
  stationName: string;
  averageGdd: number;
  frostFreeDays: number;
  lastFrostSpring: string | null; // MM-DD (averaged across years)
  firstFrostAutumn: string | null; // MM-DD (averaged across years)
  peakDaylightHours: number;
  monthlyAverages: number[]; // 12 entries, avg temp per month
  plants: ViabilityResult[];
};
