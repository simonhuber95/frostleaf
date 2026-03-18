export type Location = {
  id: string;
  latitude: number;
  longitude: number;
  nearestStationId: string;
};

export type WeatherStation = {
  id: string;
  frostApiId: string;
  name: string;
  latitude: number;
  longitude: number;
  availableObservations: string[];
};

export type LocationInput = {
  type: 'coordinates' | 'address' | 'municipality';
  value: string;
  latitude?: number;
  longitude?: number;
};
