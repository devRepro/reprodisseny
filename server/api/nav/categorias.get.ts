import { getQuery } from "h3";
import { getNavigationCategories } from "~/server/services/cms/catalog.service";
import {
  toNavigationDto,
  type NavigationCategoryDto,
} from "~/shared/navigation";

type ReturnShape = {
  tree: NavigationCategoryDto[];
};

function parseProductLimit(value: unknown, fallback = 8) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(parsed, 12));
}

function parseBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }

  return fallback;
}

export default defineEventHandler((event): ReturnShape => {
  const query = getQuery(event);

  const includeProducts = parseBoolean(query.includeProducts, true);
  const productLimit = parseProductLimit(query.productLimit, 8);

  return {
    tree: toNavigationDto(
      getNavigationCategories({
        includeProducts,
        productLimit,
      }),
    ),
  };
});
