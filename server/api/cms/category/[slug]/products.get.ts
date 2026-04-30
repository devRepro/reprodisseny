import { createError, getQuery, getRouterParam } from "h3";
import { defineCachedEventHandler } from "nitropack/runtime";
import { getCategoryProductsBySlug } from "~/server/services/cms/catalog.service";

function normalizeSort(value: unknown): "order" | "title" | "price" {
  const sort = String(value || "").trim().toLowerCase();
  return sort === "title" || sort === "price" ? sort : "order";
}

function normalizeDirection(value: unknown): "ASC" | "DESC" {
  return String(value || "").trim().toUpperCase() === "DESC" ? "DESC" : "ASC";
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

export default defineCachedEventHandler(
  async (event) => {
    const slug = String(getRouterParam(event, "slug") || "").trim();
    const query = getQuery(event);

    if (!slug) {
      throw createError({
        statusCode: 404,
        message: "Categoría no encontrada",
      });
    }

    const result = getCategoryProductsBySlug(slug, {
      page: query.page,
      limit: query.limit,
      sort: normalizeSort(query.sort),
      direction: normalizeDirection(query.direction),
      q: String(query.q || "").trim(),
      includeSubcategories: normalizeBoolean(
        query.includeSubcategory ?? query.includeSub,
        true
      ),
    });

    if (!result) {
      throw createError({
        statusCode: 404,
        message: `Categoría no encontrada: ${slug}`,
      });
    }

    return result;
  },
  {
    maxAge: 60 * 5,
    swr: true,
    getKey: (event) => {
      const slug = String(getRouterParam(event, "slug") || "").trim();
      const query = getQuery(event);

      return [
        "cms:category-products",
        slug,
        String(query.page ?? 1),
        String(query.limit ?? 24),
        String(query.sort ?? "order"),
        String(query.direction ?? "ASC"),
        String(query.q ?? ""),
        String(query.includeSubcategory ?? query.includeSub ?? "true"),
      ].join(":");
    },
  }
);