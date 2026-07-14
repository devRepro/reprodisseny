import {
  createError,
  getQuery,
  getRouterParam,
} from "h3";
import { defineCachedEventHandler } from "nitropack/runtime";

import { getCategoryProductsBySlug } from
  "~/server/services/cms/catalog.service";

function firstQueryValue(value: unknown) {
  return Array.isArray(value)
    ? value[0]
    : value;
}

function normalizeSort(
  value: unknown,
): "order" | "title" | "price" {
  const sort = String(
    firstQueryValue(value) || "",
  )
    .trim()
    .toLowerCase();

  return sort === "title" || sort === "price"
    ? sort
    : "order";
}

function normalizeDirection(
  value: unknown,
): "ASC" | "DESC" {
  return String(
    firstQueryValue(value) || "",
  )
    .trim()
    .toUpperCase() === "DESC"
    ? "DESC"
    : "ASC";
}

function normalizeBoolean(
  value: unknown,
  fallback: boolean,
) {
  const raw = firstQueryValue(value);

  if (
    raw === undefined ||
    raw === null ||
    raw === ""
  ) {
    return fallback;
  }

  const normalized = String(raw)
    .trim()
    .toLowerCase();

  return (
    normalized === "1" ||
    normalized === "true"
  );
}

function parseRequestedPage(
  value: unknown,
): number | null {
  const raw = firstQueryValue(value);

  if (
    raw === undefined ||
    raw === null ||
    raw === ""
  ) {
    return 1;
  }

  const normalized = String(raw).trim();

  if (!/^[1-9]\d*$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isSafeInteger(parsed)
    ? parsed
    : null;
}

function parseLimit(value: unknown) {
  const raw = firstQueryValue(value);
  const normalized = String(raw ?? "").trim();

  if (!/^[1-9]\d*$/.test(normalized)) {
    return 12;
  }

  const parsed = Number(normalized);

  if (!Number.isSafeInteger(parsed)) {
    return 12;
  }

  return Math.min(parsed, 48);
}

export default defineCachedEventHandler(
  async (event) => {
    const slug = String(
      getRouterParam(event, "slug") || "",
    ).trim();

    if (!slug) {
      throw createError({
        statusCode: 404,
        statusMessage:
          "Categoría no encontrada",
      });
    }

    const query = getQuery(event);
    const requestedPage = parseRequestedPage(
      query.page,
    );

    if (requestedPage === null) {
      throw createError({
        statusCode: 404,
        statusMessage:
          "Página no encontrada",
      });
    }

    const limit = parseLimit(query.limit);

    const result = getCategoryProductsBySlug(
      slug,
      {
        page: requestedPage,
        limit,
        sort: normalizeSort(query.sort),
        direction: normalizeDirection(
          query.direction,
        ),
        q: String(
          firstQueryValue(query.q) ?? "",
        ).trim(),
        includeSubcategories:
          normalizeBoolean(
            query.includeSubcategory ??
              query.includeSub,
            true,
          ),
      },
    );

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage:
          "Categoría no encontrada",
        message:
          `Categoría no encontrada: ${slug}`,
      });
    }

    const maximumPage = Math.max(
      result.pages,
      1,
    );

    if (requestedPage > maximumPage) {
      throw createError({
        statusCode: 404,
        statusMessage:
          "Página no encontrada",
      });
    }

    return {
      ...result,
      page: requestedPage,
    };
  },
  {
    maxAge: 60 * 5,
    swr: true,

    getKey: (event) => {
      const slug = String(
        getRouterParam(event, "slug") || "",
      ).trim();

      const query = getQuery(event);

      return [
        "cms:category-products",
        slug,
        String(
          firstQueryValue(query.page) ?? 1,
        ),
        String(
          firstQueryValue(query.limit) ?? 12,
        ),
        String(
          firstQueryValue(query.sort) ??
            "order",
        ),
        String(
          firstQueryValue(
            query.direction,
          ) ?? "ASC",
        ),
        String(
          firstQueryValue(query.q) ?? "",
        ),
        String(
          firstQueryValue(
            query.includeSubcategory ??
              query.includeSub,
          ) ?? "true",
        ),
      ].join(":");
    },
  },
);