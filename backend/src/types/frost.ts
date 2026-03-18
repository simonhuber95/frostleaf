export type FrostSource = {
  '@type': string;
  id: string;
  name: string;
  geometry: { '@type': string; coordinates: [number, number, number?] };
  validFrom?: string;
  validTo?: string;
};

export type FrostSourcesResponse = {
  '@type': string;
  data: FrostSource[];
};

export type FrostObservation = {
  sourceId: string;
  referenceTime: string;
  observations: Array<{
    elementId: string;
    value: number;
    unit: string;
  }>;
};

export type FrostObservationsResponse = {
  '@type': string;
  data: FrostObservation[];
};
