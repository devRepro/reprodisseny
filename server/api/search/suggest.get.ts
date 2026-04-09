import { defineEventHandler, getQuery } from "h3";
import { useStorage } from "#imports";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

type Kind = "producto" | "categoria";

type SuggestItem = {
  id: string;
  kind: Kind;
  title: string;
  href: string;
  image?: string | null;
};

type SuggestResponse = {
  q: string;
  items: SuggestItem[];
};

function s(v: unknown) {
  return String(v ?? "").trim();
}

function clampInt(v: unknown, fallback: number, min: number, max: number) {
  const value = parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function norm(v: unknown) {
  return s(v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreText(title: string, term: string) {
  const t = norm(title);
  if (!t) return 0;
  if (t.startsWith(term)) return 100;
  if (t.includes(term)) return 50;
  return 0;
}

function isVisibleCategory(item: any) {
  return item?.hidden !== true && item?.isPublished !== false && item?.published !== false;
}

function isVisibleProduct(item: any) {
  return item?.hidden !== true && item?.isPublished !== false && item?.published !== false;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const qRaw = s(query.q);
  const term = norm(qRaw);
  const limit = clampInt(query.limit, 8, 1, 12);
  const force = s(query.force) === "1";

  if (!qRaw || term.length < 2) {
    return { q: qRaw, items: [] } satisfies SuggestResponse;
  }

  const storage = useStorage("cache");
  const cacheKey = `search:suggest:${term}:${limit}`;

  if (!force) {
    const cached = await storage.getItem<SuggestResponse>(cacheKey);
    if (cached) return cached;
  }

  const { categories, products } = await getCmsCatalog();

  const visibleCategories = (Array.isArray(categories) ? categories : []).filter(
    isVisibleCategory
  );

  const visibleProducts = (Array.isArray(products) ? products : []).filter(
    isVisibleProduct
  );

  const categoryMatches = visibleCategories
    .map((category: any) => {
      const title = s(category?.label || category?.nav || category?.title);
      return {
        score: scoreText(title, term),
        item: {
          id: s(category?.id || category?.slug || category?.path),
          kind: "categoria" as const,
          title,
          href: s(category?.path || `/categorias/${category?.slug}`),
          image:
            (typeof category?.image === "string"
              ? category.image
              : category?.image?.src) || null,
        },
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map((entry) => entry.item);

  const productMatches = visibleProducts
    .map((product: any) => {
      const title = s(product?.title);
      return {
        score: scoreText(title, term),
        item: {
          id: s(product?.id || product?.slug || product?.path),
          kind: "producto" as const,
          title,
          href: s(product?.path || `/productos/${product?.slug}`),
          image:
            (typeof product?.image === "string"
              ? product.image
              : product?.image?.src) || null,
        },
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map((entry) => entry.item);

  const items = [...productMatches, ...categoryMatches].slice(0, limit);

  const payload: SuggestResponse = {
    q: qRaw,
    items,
  };

  await storage.setItem(cacheKey, payload);
  return payload;
});