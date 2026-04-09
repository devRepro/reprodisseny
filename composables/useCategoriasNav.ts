import { computed, watch } from "vue";
import type {
  NavCategoryItem,
  NavProductItem,
} from "~/server/services/cms/catalog.service";

export type ProductoNode = NavProductItem;
export type CategoriaNode = NavCategoryItem;

type Options = {
  includeProducts?: boolean;
  productLimit?: number;
};

type ReturnShape = {
  tree: CategoriaNode[];
  indexBySlug: Record<string, CategoriaNode>;
  menuItems: CategoriaNode[];
};

const EMPTY_NAV: ReturnShape = {
  tree: [],
  indexBySlug: {},
  menuItems: [],
};

export async function useCategoriasNav(opts: Options = {}) {
  const includeProducts = opts.includeProducts ?? true;
  const productLimit = Math.max(0, Math.min(opts.productLimit ?? 8, 12));

  const cacheKey = `nav-categorias:ip${includeProducts ? 1 : 0}:pl${productLimit}`;

  const stableNav = useState<ReturnShape>(`${cacheKey}:stable`, () => ({
    tree: [],
    indexBySlug: {},
    menuItems: [],
  }));

  const request = await useFetch<ReturnShape>("/api/nav/categorias", {
    key: cacheKey,
    query: {
      includeProducts,
      productLimit,
    },
    server: true,
    lazy: false,
    dedupe: "defer",
    default: () => ({
      tree: [],
      indexBySlug: {},
      menuItems: [],
    }),
    transform: (value) => value ?? EMPTY_NAV,
  });

  watch(
    () => request.data.value,
    (value) => {
      if (value?.tree?.length) {
        stableNav.value = value;
      }
    },
    { immediate: true, deep: false }
  );

  const resolvedData = computed<ReturnShape>(() => {
    if (request.data.value?.tree?.length) return request.data.value;
    if (stableNav.value?.tree?.length) return stableNav.value;
    return EMPTY_NAV;
  });

  const tree = computed(() => resolvedData.value.tree ?? []);
  const indexBySlug = computed(() => resolvedData.value.indexBySlug ?? {});
  const menuItems = computed(() => resolvedData.value.menuItems ?? []);

  const pending = computed(() => request.pending.value && !tree.value.length);
  const error = computed(() => (tree.value.length ? null : request.error.value));

  return {
    ...request,
    pending,
    error,
    tree,
    indexBySlug,
    menuItems,
    data: resolvedData,
  };
}