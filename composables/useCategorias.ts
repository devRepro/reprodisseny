export const useCategorias = async () => {

  const { data: categories } = await useAsyncData("categories-list", () =>
    queryCollection("categorias")
    .where('type', '=', 'categoria')
    .select("title", "nav", "slug", "path", "description", "image", "alt")
    .all()
  );
  return { data: categories }
}