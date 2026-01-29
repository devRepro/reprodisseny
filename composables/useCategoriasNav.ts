import { useAsyncData } from "#app";

export type CategoriaNode = {
  id?: string;
  slug?: string;
  title?: string;
  nav?: string;
  order?: number;
  path?: string | null;
  image?: string;
  parent?: string;
  children?: CategoriaNode[];
  products?: ProductoNode[];
};

export type ProductoNode = {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  image?: string;
  categorySlug?: string;
  path?: string | null;
  order?: number;
  price?: number;
};

type Options = { productLimit?: number; debug?: boolean };
type ReturnShape = {
  tree: CategoriaNode[];
  indexBySlug: Record<string, CategoriaNode>;
  menuItems: CategoriaNode[];
};

export function useCategoriasNav(opts: Options = {}) {
  const { productLimit = 6 } = opts;

  return useAsyncData<ReturnShape>(
    `categorias:nav:${productLimit}`,
    () => $fetch("/api/cms/nav", { params: { productLimit } }),
    {
      server: true,
      default: () => ({ tree: [], indexBySlug: {}, menuItems: [] }),
      dedupe: "defer",
    }
  );
}
