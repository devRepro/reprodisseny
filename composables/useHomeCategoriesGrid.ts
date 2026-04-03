import { computed } from "vue";
import type { HomeCategoryCardItem } from "~/server/services/catalog.service";

type HomeCategoriesResponse =
  | {
      items?: HomeCategoryCardItem[] | null;
    }
  | HomeCategoryCardItem[]
  | null
  | undefined;

function normalizeHomeCategoriesResponse(
  value: HomeCategoriesResponse
): HomeCategoryCardItem[] {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (value && Array.isArray(value.items)) {
    return value.items.filter(Boolean);
  }

  return [];
}

export function useHomeCategoriesGrid(limit = 8) {
  const request = useFetch<HomeCategoriesResponse>("/api/home/categorias", {
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

  const categories = computed<HomeCategoryCardItem[]>(() => {
    return request.data.value?.items ?? [];
  });

  return {
    ...request,
    categories,
  };
}