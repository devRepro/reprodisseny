import { computed, ref } from "vue";
import type { Product } from "@/types/product";

export function useProductsCatalog() {
  const products = ref<Product[]>([]); // aquí cargas tus datos reales
  const query = ref("");
  const selectedCategory = ref<string | null>(null);
  const sort = ref("featured");

  const categories = computed(() => {
    const map = new Map<string, { label: string; slug: string }>();

    for (const product of products.value) {
      for (const slug of getProductCategories(product)) {
        if (!map.has(slug)) {
          map.set(slug, {
            slug,
            label: slugToLabel(slug),
          });
        }
      }
    }

    return [...map.values()];
  });

  const filteredProducts = computed(() => {
    let result = [...products.value];

    if (selectedCategory.value) {
      result = result.filter((product) =>
        getProductCategories(product).includes(selectedCategory.value as string)
      );
    }

    if (query.value.trim()) {
      const q = query.value.trim().toLowerCase();

      result = result.filter((product) =>
        [
          product.title,
          product.shortDescription,
          product.categorySlug,
          ...(product.categories || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (sort.value === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sort.value === "za") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  });

  const totalProducts = computed(() => products.value.length);

  function clearFilters() {
    query.value = "";
    selectedCategory.value = null;
    sort.value = "featured";
  }

  return {
    products,
    categories,
    query,
    selectedCategory,
    sort,
    filteredProducts,
    totalProducts,
    clearFilters,
  };
}

function getProductCategories(product: Product): string[] {
  return [...new Set([product.categorySlug, ...(product.categories || [])].filter(Boolean))] as string[];
}

function slugToLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}