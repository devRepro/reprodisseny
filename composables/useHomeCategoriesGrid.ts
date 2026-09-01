import { computed } from "vue";

type HomeCategoryCardItem = {
  id: string;
  title: string;
  slug: string;
  href: string;
  image: {
    src?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  shortDescription?: string | null;
  description?: string | null;
};

type HomeCategoriesResponse =
  | {
      items?: HomeCategoryCardItem[] | null;
    }
  | HomeCategoryCardItem[]
  | null
  | undefined;

function normalizeHomeCategoriesResponse(
  value: unknown
): HomeCategoryCardItem[] {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (value && Array.isArray(value.items)) {
    return value.items.filter(Boolean);
  }

  return [];
}

export async function useHomeCategoriesGrid(limit = 8) {
  const hydratedCategories = useState<HomeCategoryCardItem[]>(
    `home-categorias-items-${limit}`,
    () => []
  );

  const request = await useFetch<HomeCategoriesResponse>("/api/home/categorias", {
    query: { limit },
    key: `home-categorias-${limit}`,
    default: () => ({ items: [] }),
    server: true,
    lazy: false,
    transform: (input) => {
      return {
        items: normalizeHomeCategoriesResponse(input),
      };
    },
  });

  const requestItems = computed<HomeCategoryCardItem[]>(() => {
    return normalizeHomeCategoriesResponse(request.data.value);
  });

  if (requestItems.value.length) {
    hydratedCategories.value = requestItems.value;
  }

  const categories = computed<HomeCategoryCardItem[]>(() => {
    return requestItems.value.length ? requestItems.value : hydratedCategories.value;
  });

  return {
    ...request,
    categories,
  };
}
