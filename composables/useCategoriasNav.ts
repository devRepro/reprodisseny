import { computed } from "vue";
import type {
  NavigationCategoryDto,
  NavigationProductDto,
} from "~/shared/navigation";

export type ProductoNode = NavigationProductDto;
export type CategoriaNode = NavigationCategoryDto;

type Options = {
  includeProducts?: boolean;
  productLimit?: number;
};

type ReturnShape = {
  tree: CategoriaNode[];
};

const EMPTY_NAV: ReturnShape = {
  tree: [],
};

export async function useCategoriasNav(opts: Options = {}) {
  const includeProducts = opts.includeProducts ?? true;
  const productLimit = Math.max(0, Math.min(opts.productLimit ?? 8, 12));

  const cacheKey = `nav-categorias:ip${includeProducts ? 1 : 0}:pl${productLimit}`;

  const request = await useFetch<ReturnShape>("/api/nav/categorias", {
    key: cacheKey,
    query: {
      includeProducts,
      productLimit,
    },
    server: true,
    lazy: false,
    dedupe: "defer",
    default: () => ({ tree: [] }),
    transform: (value) => value ?? EMPTY_NAV,
  });

  const tree = computed(() => request.data.value?.tree ?? []);

  const pending = computed(() => request.pending.value && !tree.value.length);
  const error = computed(() => (tree.value.length ? null : request.error.value));

  return {
    ...request,
    pending,
    error,
    tree,
  };
}
