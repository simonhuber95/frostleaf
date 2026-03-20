import type { FrostSourcesResponse, FrostObservationsResponse } from '../types/frost';

const FROST_API_BASE = 'https://frost.met.no';

function getClientId(): string {
  const clientId = process.env.FROST_API_CLIENT_ID;
  if (!clientId) throw new Error('FROST_API_CLIENT_ID is not set');
  return clientId;
}

function authHeaders(): HeadersInit {
  const encoded = Buffer.from(`${getClientId()}:`).toString('base64');
  return { Authorization: `Basic ${encoded}` };
}

export async function fetchNearbyStations(lat: number, lon: number, maxCount = 10): Promise<FrostSourcesResponse> {
  const params = new URLSearchParams({
    geometry: `nearest(POINT(${lon} ${lat}))`,
    nearestmaxcount: String(maxCount),
    elements: 'min(air_temperature P1D),max(air_temperature P1D),mean(air_temperature P1D)',
  });

  const res = await fetch(`${FROST_API_BASE}/sources/v0.jsonld?${params}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Frost API sources error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function fetchObservations(
  stationId: string,
  fromDate: string,
  toDate: string,
): Promise<FrostObservationsResponse> {
  const params = new URLSearchParams({
    sources: stationId,
    elements: 'min(air_temperature P1D),max(air_temperature P1D),mean(air_temperature P1D)',
    referencetime: `${fromDate}/${toDate}`,
  });

  const res = await fetch(`${FROST_API_BASE}/observations/v0.jsonld?${params}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Frost API observations error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
