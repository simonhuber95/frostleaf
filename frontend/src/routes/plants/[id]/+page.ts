import type { Plant } from '$lib/api/plants';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }: { params: { id: string }; fetch: typeof globalThis.fetch }): Promise<{ plant: Plant }> => {
  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${API_BASE}/api/plants/${params.id}`);
  if (!res.ok) throw error(404, 'Plant not found');
  const plant: Plant = await res.json();
  return { plant };
};
