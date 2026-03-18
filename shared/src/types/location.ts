export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  nearestStationId: string;
}

export interface WeatherStation {
  id: string;
  frostApiId: string;
  name: string;
  latitude: number;
  longitude: number;
  availableObservations: string[];
}

export interface LocationInput {
  type: 'coordinates' | 'address' | 'municipality';
  value: string;
  latitude?: number;
  longitude?: number;
}
