import { computed, ref } from "vue";
import type { ProductListItem } from "@/types/product";

type SortOption = "featured" | "az" | "za";

export function useProductsCatalog(initialProducts: ProductListItem[] = []) {
  const products = ref<ProductListItem[]>(initialProducts);
  const query = ref("");
  const selectedCategory = ref<string | null>(null);
  const sort = ref<SortOption>("featured");

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

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
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
          product.description,
          product.categorySlug,
          ...(product.categories || []),
          ...(product.searchTerms || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (sort.value === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort.value === "za") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort.value === "featured") {
      result.sort((a, b) => {
        const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (featuredDiff !== 0) return featuredDiff;

        const orderA = typeof a.order === "number" ? a.order : 999999;
        const orderB = typeof b.order === "number" ? b.order : 999999;

        if (orderA !== orderB) return orderA - orderB;

        return a.title.localeCompare(b.title);
      });
    }

    return result;
  });

  const totalProducts = computed(() => products.value.length);

  function setProducts(items: ProductListItem[]) {
    products.value = Array.isArray(items) ? items : [];
  }

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
    setProducts,
    clearFilters,
  };
}

function getProductCategories(product: ProductListItem): string[] {
  return [
    ...new Set(
      [product.categorySlug, ...(product.categories || [])]
        .map((v) => String(v || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}

function slugToLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}