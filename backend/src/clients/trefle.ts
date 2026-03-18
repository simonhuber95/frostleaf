import createClient from 'openapi-fetch';
import type { paths } from '../types/trefle.generated';

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
      // Always append token
      searchParams.set('token', getToken());
      return searchParams.toString();
    },
  });
}

export async function searchSpecies(query: string, page = 1) {
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/species/search', {
    params: { query: { q: query, page } },
  });

  if (error) throw new Error(`Trefle search error: ${JSON.stringify(error)}`);
  return data;
}

export async function getSpeciesById(id: number) {
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/species/{id}', {
    params: { path: { id: String(id) } },
  });

  if (error) throw new Error(`Trefle species error: ${JSON.stringify(error)}`);
  return data;
}

export async function listSpecies(page = 1) {
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/species', {
    params: { query: { page } },
  });

  if (error) throw new Error(`Trefle species list error: ${JSON.stringify(error)}`);
  return data;
}

export async function searchPlants(query: string, page = 1) {
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/plants/search', {
    params: { query: { q: query, page } },
  });

  if (error) throw new Error(`Trefle plants search error: ${JSON.stringify(error)}`);
  return data;
}

export async function getPlantById(id: number) {
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/plants/{id}', {
    params: { path: { id: String(id) } },
  });

  if (error) throw new Error(`Trefle plant error: ${JSON.stringify(error)}`);
  return data;
}

export async function listPlants(page = 1) {
  const client = createTrefleClient();
  const { data, error } = await client.GET('/api/v1/plants', {
    params: { query: { page } },
  });

  if (error) throw new Error(`Trefle plants list error: ${JSON.stringify(error)}`);
  return data;
}
