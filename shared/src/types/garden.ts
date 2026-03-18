export interface Garden {
  id: string;
  userId: string | null;
  name: string;
  locationId: string;
  createdAt: string;
}

export interface GardenPlant {
  gardenId: string;
  plantId: string;
  plantedDate: string | null;
  notes: string;
}

export interface GardenExport {
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
}
