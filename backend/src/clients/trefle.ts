import createClient from 'openapi-fetch';
import type { paths, components } from '../types/trefle.generated';

function getToken(): string {
  const token = process.env.TREFLE_API_TOKEN;
  if (!token) throw new Error('TREFLE_API_TOKEN is not set');
  return token;
}

function createTrefleClient() {
  return createClient<paths>({
    baseUrl: 'https://trefle.io',
    querySerializer: (params) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      searchParams.set('token', getToken());
      return searchParams.toString();
    },
  });
}

// Normalized result from either Trefle plants or species endpoint
export type TrefleExternalPlant = {
  externalId: string;
  scientificName: string;
  commonName: string | null;
  family: string | null;
  imageUrl: string | null;
  species: components['schemas']['species'] | null;
};

export async function search(query: string, page = 1) {
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/species/search', {
    params: { query: { q: query, page } },
  });

  if (error) throw new Error(`Trefle search error: ${JSON.stringify(error)}`);
  return data;
}

export async function fetchById(trefleId: number): Promise<TrefleExternalPlant | null> {
  // Try species first (has the richest data)
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/species/{id}', {
    params: { path: { id: String(trefleId) } },
  });

  if (error || !data?.data) return null;

  const species = data.data;
  return {
    externalId: `trefle:${trefleId}`,
    scientificName: species.scientific_name,
    commonName: species.common_name ?? null,
    family: species.family ?? null,
    imageUrl: species.image_url ?? null,
    species,
  };
}
