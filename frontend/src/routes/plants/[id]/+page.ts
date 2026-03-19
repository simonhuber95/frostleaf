import { getPlant, type Plant } from '$lib/api/plants';

export const load = async ({ params }: { params: { id: string } }): Promise<{ plant: Plant }> => {
  const plant = await getPlant(params.id);
  return { plant };
};
