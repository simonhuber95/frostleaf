export const load = ({ params }: { params: { id: string } }) => {
  return { gardenId: params.id };
};
