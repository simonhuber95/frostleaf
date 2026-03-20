export type PlantTimeline = {
  sowingStart: string;   // MM-DD
  sowingEnd: string;     // MM-DD
  growthStart: string;   // MM-DD
  growthEnd: string;     // MM-DD
  harvestStart: string;  // MM-DD
  harvestEnd: string;    // MM-DD
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
  timeline: PlantTimeline | null;
};

export type ViabilityReport = {
  locationId: string;
  stationName: string;
  averageGdd: number;
  frostFreeDays: number;
  lastFrostSpring: string | null; // MM-DD (averaged across years)
  firstFrostAutumn: string | null; // MM-DD (averaged across years)
  monthlyAverages: number[]; // 12 entries, avg temp per month
  plants: ViabilityResult[];
};
