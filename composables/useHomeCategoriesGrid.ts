import { computed } from "vue";
import type { HomeCategoryCardItem } from "~/server/services/catalog.service";

type HomeCategoriesResponse = {
  items: HomeCategoryCardItem[];
};

export function useHomeCategoriesGrid(limit = 8) {
  const request = useFetch<HomeCategoriesResponse>("/api/home/categorias", {
    query: { limit },
    key: `home-categorias-${limit}`,
    default: () => ({ items: [] }),
    server: true,
    lazy: false,
  });

  const categories = computed<HomeCategoryCardItem[]>(() => {
    return request.data.value?.items ?? [];
  });

  return {
    ...request,
    categories,
  };
}