export type LocationInput =
  | { type: 'coordinates'; latitude: number; longitude: number }
  | { type: 'address'; query: string }
  | { type: 'municipality'; query: string };

export type GeocodingResult = {
  latitude: number;
  longitude: number;
  displayName: string;
};
