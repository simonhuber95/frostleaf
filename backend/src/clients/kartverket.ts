import type { GeocodingResult } from '../types/location';

const KARTVERKET_BASE = 'https://ws.geonorge.no/stedsnavn/v1';
const KOMMUNEINFO_BASE = 'https://ws.geonorge.no/kommuneinfo/v1';

type StedsnavnResponse = {
  navn: Array<{
    skrivemåte: string;
    representasjonspunkt: { øst: number; nord: number };
    kommuner: Array<{ kommunenavn: string }>;
  }>;
};

type KommuneSearchResponse = {
  antallTreff: number;
  kommuner: Array<{
    kommunenavn: string;
    punktIOmrade: {
      coordinates: [number, number]; // [lon, lat]
    };
  }>;
};

export async function geocodeAddress(query: string): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    sok: query,
    maxAnt: '1',
    utkoordsys: '4258',
  });

  const res = await fetch(`${KARTVERKET_BASE}/sok?${params}`);
  if (!res.ok) return null;

  const data: StedsnavnResponse = await res.json();
  const first = data.navn?.[0];
  if (!first?.representasjonspunkt) return null;

  const kommune = first.kommuner?.[0]?.kommunenavn ?? '';
  return {
    latitude: first.representasjonspunkt.nord,
    longitude: first.representasjonspunkt.øst,
    displayName: `${first.skrivemåte}${kommune ? `, ${kommune}` : ''}`,
  };
}

export async function geocodeMunicipality(query: string): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({ knavn: query });

  const res = await fetch(`${KOMMUNEINFO_BASE}/sok?${params}`);
  if (!res.ok) return null;

  const data: KommuneSearchResponse = await res.json();
  const first = data.kommuner?.[0];
  if (!first?.punktIOmrade) return null;

  const [lon, lat] = first.punktIOmrade.coordinates;
  return {
    latitude: lat,
    longitude: lon,
    displayName: first.kommunenavn,
  };
}
