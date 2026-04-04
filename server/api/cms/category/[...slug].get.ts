import { createError, getRouterParam } from "h3";
import { defineCachedEventHandler } from "nitropack/runtime";
import { getCategoryDetailByPath } from "~/server/services/cms/catalog.service";

function safeDecode(value: unknown) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

function toSlugParts(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((part) => safeDecode(part).trim())
      .filter(Boolean);
  }

  return safeDecode(value)
    .split(/[\/,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizePath(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function isAssetLike(value: unknown) {
  const s = String(value ?? "").trim();

  return (
    /^(img|_nuxt|_ipx)\//i.test(s) ||
    /(?:^|\/)_payload\.json(?:\?.*)?$/i.test(s) ||
    /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf|css|js|map|json|txt|xml|ico)$/i.test(s)
  );
}

export default defineCachedEventHandler(
  (event) => {
    const slugParam = getRouterParam(event, "slug");
    const parts = toSlugParts(slugParam);

    if (!parts.length) {
      throw createError({
        statusCode: 404,
        message: "Categoría no encontrada",
      });
    }

    const rawSlug = normalizePath(parts.join("/"));

    if (!rawSlug || isAssetLike(rawSlug)) {
      throw createError({
        statusCode: 404,
        message: `Categoría no encontrada: ${rawSlug}`,
      });
    }

    // Probamos variantes porque el servicio parece resolver por path.
    const candidates = [
      rawSlug,
      `categorias/${rawSlug}`,
      `/${rawSlug}`,
      `/categorias/${rawSlug}`,
    ].map(normalizePath);

    let category = null;

    for (const candidate of candidates) {
      category = getCategoryDetailByPath(candidate, {
        productLimit: 24,
        childLimit: 50,
      });

      if (category) break;
    }

    if (!category) {
      throw createError({
        statusCode: 404,
        message: `Categoría no encontrada: ${rawSlug}`,
      });
    }

    return category;
  },
  {
    maxAge: 60 * 5,
    swr: true,
    getKey: (event) => {
      const slugParam = getRouterParam(event, "slug");
      const parts = toSlugParts(slugParam);
      const rawSlug = normalizePath(parts.join("/"));
      return `cms:category:${rawSlug}`;
    },
  }
);