import { getQuery } from "h3";
import {
  getNavigationCategories,
  type NavCategoryItem,
} from "~/server/services/cms/catalog.service";

type ReturnShape = {
  tree: NavCategoryItem[];
  indexBySlug: Record<string, NavCategoryItem>;
  menuItems: NavCategoryItem[];
};

function buildIndexBySlug(
  nodes: NavCategoryItem[],
  acc: Record<string, NavCategoryItem> = {}
) {
  for (const node of nodes) {
    acc[node.slug] = node;

    if (node.children?.length) {
      buildIndexBySlug(node.children, acc);
    }
  }

  return acc;
}

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

  const tree = getNavigationCategories({
    includeProducts,
    productLimit,
  });

  const indexBySlug = buildIndexBySlug(tree);

  return {
    tree,
    indexBySlug,
    menuItems: tree,
  };
});