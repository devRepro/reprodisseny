import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from "vue";
import { useRoute } from "vue-router";

import type { CategoryProductsListDto } from
  "~/server/services/cms/catalog.service";

type ProductSort = "order" | "title" | "price";
type SortDirection = "ASC" | "DESC";

type Options = {
  limit?: MaybeRefOrGetter<number | undefined>;
  page?: MaybeRefOrGetter<number | undefined>;
  sort?: MaybeRefOrGetter<ProductSort | undefined>;
  direction?: MaybeRefOrGetter<SortDirection | undefined>;
  q?: MaybeRefOrGetter<string | undefined>;
  includeSubcategory?: MaybeRefOrGetter<boolean | undefined>;
  categorySlug?: MaybeRefOrGetter<
    string | string[] | undefined
  >;
};

function positiveInteger(
  value: unknown,
  fallback: number,
): number {
  const normalized = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(normalized)) {
    return fallback;
  }

  const parsed = Number(normalized);

  return Number.isSafeInteger(parsed)
    ? parsed
    : fallback;
}

/**
 * El endpoint de productos busca la categoría por su slug interno,
 * no por la ruta pública completa.
 *
 * Ejemplos:
 * - "gran-formato" -> "gran-formato"
 * - ["gran-formato"] -> "gran-formato"
 * - ["gran-formato", "material-flexible"] -> "material-flexible"
 * - "gran-formato/material-flexible" -> "material-flexible"
 */
function normalizeCategorySlug(value: unknown): string {
  const raw = Array.isArray(value)
    ? value.join("/")
    : String(value ?? "");

  return (
    raw
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)
      .at(-1) ?? ""
  );
}

export async function useCategoriaProductos(
  options: Options = {},
) {
  const route = useRoute();

  const slug = computed(() =>
    normalizeCategorySlug(
      toValue(options.categorySlug) ??
        route.params.slug,
    ),
  );

  const page = computed(() =>
    positiveInteger(
      toValue(options.page),
      1,
    ),
  );

  const limit = computed(() =>
    Math.min(
      positiveInteger(
        toValue(options.limit),
        12,
      ),
      48,
    ),
  );

  const sort = computed<ProductSort>(() => {
    const value = toValue(options.sort);

    if (value === "title" || value === "price") {
      return value;
    }

    return "order";
  });

  const direction = computed<SortDirection>(() => {
    const value = String(
      toValue(options.direction) ?? "ASC",
    ).toUpperCase();

    return value === "DESC"
      ? "DESC"
      : "ASC";
  });

  const search = computed(() =>
    String(
      toValue(options.q) ?? "",
    ).trim(),
  );

  const includeSubcategory = computed(
    () =>
      toValue(options.includeSubcategory) ??
      true,
  );

  const key = computed(() =>
    [
      "cms",
      "category-products",
      slug.value,
      page.value,
      limit.value,
      sort.value,
      direction.value,
      search.value,
      includeSubcategory.value,
    ].join(":"),
  );

  const {
    data,
    pending,
    status,
    error,
    refresh,
  } = await useAsyncData<CategoryProductsListDto>(
    key,
    () => {
      if (!slug.value) {
        throw createError({
          statusCode: 404,
          statusMessage:
            "Categoría no encontrada",
        });
      }

      // Declararlo como string evita que TypeScript intente
      // calcular todos los tipos de rutas de Nuxt.
      const endpoint: string =
        `/api/cms/category/${encodeURIComponent(
          slug.value,
        )}/products`;

      return $fetch<CategoryProductsListDto>(
        endpoint,
        {
          query: {
            page: page.value,
            limit: limit.value,
            sort: sort.value,
            direction: direction.value,
            includeSubcategory:
              includeSubcategory.value
                ? "1"
                : "0",
            ...(search.value
              ? { q: search.value }
              : {}),
          },
        },
      );
    },
    {
      server: true,
      default: () => ({
        items: [],
        page: page.value,
        pages: 0,
        total: 0,
        limit: limit.value,
      }),
    },
  );

  const items = computed(
    () => data.value?.items ?? [],
  );

  const meta = computed(() => ({
    page:
      data.value?.page ??
      page.value,
    pages:
      data.value?.pages ??
      0,
    total:
      data.value?.total ??
      0,
    limit:
      data.value?.limit ??
      limit.value,
  }));

  return {
    data,
    items,
    meta,
    pending,
    status,
    error,
    refresh,
  };
}