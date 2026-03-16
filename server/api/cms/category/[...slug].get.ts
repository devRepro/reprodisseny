import { createError, getRouterParam } from "h3";
import { defineCachedEventHandler } from "nitropack/runtime";
import { getCategoryDetailByPath } from "~/server/services/cms/catalog.service";

function isAssetLike(value: unknown) {
  const s = String(value ?? "").trim();
  return /^(img|_nuxt)\//i.test(s) || /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf)$/i.test(s);
}

export default defineCachedEventHandler(
  async (event) => {
    const rawSlug = String(getRouterParam(event, "slug") || "").trim();

    if (!rawSlug || isAssetLike(rawSlug)) {
      throw createError({
        statusCode: 404,
        message: `Categoría no encontrada: ${rawSlug}`,
      });
    }

    const category = getCategoryDetailByPath(rawSlug, {
      productLimit: 24,
      childLimit: 50,
    });

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
      const rawSlug = String(getRouterParam(event, "slug") || "").trim();
      return `cms:category:${rawSlug}`;
    },
  }
);