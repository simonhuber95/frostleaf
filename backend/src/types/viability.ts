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
};

export type ViabilityReport = {
  locationId: string;
  stationName: string;
  averageGdd: number;
  frostFreeDays: number;
  lastFrostSpring: string | null;
  firstFrostAutumn: string | null;
  plants: ViabilityResult[];
};
