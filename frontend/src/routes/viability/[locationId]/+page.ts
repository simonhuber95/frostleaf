import { getViability, type ViabilityReport } from '$lib/api/viability';

export const load = async ({
  params,
}: {
  params: { locationId: string };
}): Promise<{ report: ViabilityReport }> => {
  const report = await getViability(params.locationId);
  return { report };
};
