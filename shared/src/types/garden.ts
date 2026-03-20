export type Garden = {
  id: string;
  userId: string | null;
  name: string;
  locationId: string;
  createdAt: string;
};

export type GardenPlant = {
  gardenId: string;
  plantId: string;
  plantedDate: string | null;
  notes: string;
};

export type SowingChoice = 'indoor' | 'direct';

export type LocalGardenPlant = {
  plantId: string;
  commonName: string;
  plantedDate: string | null;
  notes: string;
  sowingChoice: SowingChoice | null; // user's choice: indoor start or direct sow
};

export type LocalGarden = {
  id: string;
  name: string;
  locationId: string;
  latitude: number;
  longitude: number;
  plants: LocalGardenPlant[];
  createdAt: string;
};

export type GardenDiaryEntry = {
  id: string;
  gardenId: string;
  content: string;
  plantTags: { plantId: string; commonName: string }[];
  createdAt: string;
  updatedAt: string;
};

export type GardenExport = {
  version: 1;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  plants: Array<{
    plantId: string;
    commonName: string;
    plantedDate: string | null;
    notes: string;
  }>;
  exportedAt: string;
};
