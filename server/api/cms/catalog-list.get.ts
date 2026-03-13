import { getQuery, setHeader } from "h3";
import { defineCachedEventHandler } from "nitropack/runtime";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

function toPositiveInt(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function norm(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function slugify(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function productMatchesQuery(product: any, query: string) {
  if (!query) return true;

  const haystack = [
    product?.title,
    product?.description,
    product?.primaryCategory,
    ...(Array.isArray(product?.categories) ? product.categories : []),
    ...(Array.isArray(product?.categorySlugs) ? product.categorySlugs : []),
    ...(Array.isArray(product?.searchTerms) ? product.searchTerms : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function productSort(a: any, b: any, sort: string) {
  switch (sort) {
    case "az":
      return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "es");
    case "za":
      return String(b?.title ?? "").localeCompare(String(a?.title ?? ""), "es");
    case "relevance":
    default: {
      const aFeatured = Boolean(a?.featured);
      const bFeatured = Boolean(b?.featured);

      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;

      const aOrder = Number(a?.order ?? 999999);
      const bOrder = Number(b?.order ?? 999999);

      if (aOrder !== bOrder) return aOrder - bOrder;

      return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "es");
    }
  }
}

function walkCategories(nodes: any[], visitor: (node: any) => void) {
  for (const node of Array.isArray(nodes) ? nodes : []) {
    visitor(node);

    if (Array.isArray(node?.children) && node.children.length) {
      walkCategories(node.children, visitor);
    }
  }
}

function buildCategoryAliasMap(categories: any[]) {
  const aliasToSlug = new Map<string, string>();

  walkCategories(categories, (c) => {
    const slug = slugify(c?.slug);
    if (!slug) return;

    const aliases = [c?.slug, c?.title, c?.navTitle, c?.nav, c?.label]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);

    for (const alias of aliases) {
      aliasToSlug.set(norm(alias), slug);
      aliasToSlug.set(slugify(alias), slug);
    }
  });

  return aliasToSlug;
}

function buildDescendantsMap(nodes: any[]) {
  const map = new Map<string, Set<string>>();

  function visit(node: any): Set<string> {
    const ownSlug = slugify(node?.slug);
    const descendants = new Set<string>();

    for (const child of Array.isArray(node?.children) ? node.children : []) {
      const childSlug = slugify(child?.slug);
      const childDescendants = visit(child);

      if (childSlug) descendants.add(childSlug);
      for (const s of childDescendants) descendants.add(s);
    }

    if (ownSlug) {
      map.set(ownSlug, descendants);
    }

    return descendants;
  }

  for (const node of Array.isArray(nodes) ? nodes : []) {
    visit(node);
  }

  return map;
}

function extractCategoryCandidates(value: any): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap(extractCategoryCandidates);
  }

  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }

  if (typeof value === "object") {
    const candidates = [
      value.slug,
      value.title,
      value.name,
      value.nav,
      value.navTitle,
      value.label,
      value.path,
    ]
      .filter(Boolean)
      .map((v) => String(v));

    if (typeof value.path === "string") {
      const match = value.path.match(/\/categorias\/([^/]+)$/i);
      if (match?.[1]) {
        candidates.push(match[1]);
      }
    }

    return candidates;
  }

  return [];
}

function getProductCategorySlugs(product: any, aliasToSlug: Map<string, string>) {
  const rawCandidates = [
    ...extractCategoryCandidates(product?.primaryCategory),
    ...extractCategoryCandidates(product?.categories),
    ...extractCategoryCandidates(product?.categorySlugs),
  ].filter(Boolean);

  const resolved = new Set<string>();

  for (const raw of rawCandidates) {
    const normalized = norm(raw);
    const slug = slugify(raw);

    if (normalized && aliasToSlug.has(normalized)) {
      resolved.add(aliasToSlug.get(normalized)!);
    }

    if (slug && aliasToSlug.has(slug)) {
      resolved.add(aliasToSlug.get(slug)!);
    }

    if (slug) {
      resolved.add(slug);
    }
  }

  return Array.from(resolved);
}

export default defineCachedEventHandler(
  async (event) => {
    const q = getQuery(event);

    const page = toPositiveInt(q.page, 1);
    const perPage = Math.min(toPositiveInt(q.perPage, 12), 48);
    const category = slugify(q.category);
    const search = norm(q.q);
    const sort = String(q.sort || "relevance").trim() || "relevance";
    const debug = String(q.debug || "0") === "1";

    setHeader(
      event,
      "Cache-Control",
      "public, max-age=0, s-maxage=300, stale-while-revalidate=3600"
    );

    const { categories, products } = await getCmsCatalog();

    const categoryTree = Array.isArray(categories) ? categories : [];
    const aliasToSlug = buildCategoryAliasMap(categoryTree);
    const descendantsMap = buildDescendantsMap(categoryTree);

    const flatCategories: any[] = [];
    walkCategories(categoryTree, (c) => {
      if (c?.hidden === true || c?.isPublished === false) return;
      if (c?.showInNav === false) return;

      const slug = slugify(c?.slug);
      const title = String(c?.title || "").trim();
      if (!slug || !title) return;

      flatCategories.push({
        id: c?.id,
        slug,
        title,
        nav: c?.navTitle || c?.nav || c?.title || c?.slug,
        label: c?.navTitle || c?.nav || c?.title || c?.slug,
        order: Number(c?.navOrder ?? c?.order ?? c?.sortOrder ?? 999999),
        path: c?.path || `/categorias/${slug}`,
        image:
          typeof c?.image === "string"
            ? c.image
            : c?.image?.src || c?.ImageSrc || undefined,
      });
    });

    flatCategories.sort((a, b) => a.order - b.order);

    let filtered = (Array.isArray(products) ? products : [])
      .filter((p: any) => p?.hidden !== true && p?.isPublished !== false)
      .filter((p: any) => p?.slug && p?.title)
      .filter((p: any) => p?.inStock !== false)
      .map((p: any) => {
        const normalizedCategorySlugs = getProductCategorySlugs(p, aliasToSlug);

        return {
          id: p?.id,
          slug: slugify(p?.slug),
          title: p?.title,
          path: p?.path || `/productos/${p?.slug}`,
          description: p?.description || "",
          image:
            typeof p?.image === "string"
              ? p.image
              : p?.image?.src || p?.ImageSrc || undefined,
          alt: p?.alt || p?.image?.alt || "",
          primaryCategory: p?.primaryCategory || "",
          categories: Array.isArray(p?.categories) ? p.categories : [],
          categorySlugs: normalizedCategorySlugs,
          featured: Boolean(p?.featured),
          order: Number(p?.order ?? p?.sortOrder ?? 999999),
          inStock: p?.inStock !== false,
          searchTerms: Array.isArray(p?.searchTerms) ? p.searchTerms : [],
        };
      });

    if (debug) {
      console.log("[catalog debug] query =", {
        page,
        perPage,
        category,
        search,
        sort,
      });

      console.log(
        "[catalog debug] first mapped products =",
        filtered.slice(0, 5).map((p: any) => ({
          title: p.title,
          primaryCategory: p.primaryCategory,
          categories: p.categories,
          categorySlugs: p.categorySlugs,
        }))
      );
    }

    if (category) {
      const allowedSlugs = new Set<string>([category]);

      for (const childSlug of descendantsMap.get(category) ?? []) {
        allowedSlugs.add(childSlug);
      }

      if (debug) {
        console.log("[catalog debug] allowed slugs =", Array.from(allowedSlugs));
      }

      filtered = filtered.filter((p: any) =>
        Array.isArray(p.categorySlugs) &&
        p.categorySlugs.some((slug: string) => allowedSlugs.has(slug))
      );

      if (debug) {
        console.log(
          "[catalog debug] after category filter =",
          filtered.slice(0, 10).map((p: any) => ({
            title: p.title,
            categorySlugs: p.categorySlugs,
          }))
        );
      }
    }

    if (search) {
      filtered = filtered.filter((p: any) => productMatchesQuery(p, search));
    }

    filtered = filtered.slice().sort((a: any, b: any) => productSort(a, b, sort));

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;
    const items = filtered.slice(start, start + perPage);

    return {
      items,
      total,
      page: safePage,
      perPage,
      totalPages,
      categories: flatCategories,
    };
  },
  {
    maxAge: 60 * 5,
    swr: true,
    getKey: (event) => {
      const q = getQuery(event);

      return [
        "cmsCatalogList",
        String(q.page || 1),
        String(q.perPage || 12),
        String(q.category || ""),
        String(q.q || ""),
        String(q.sort || "relevance"),
      ].join(":");
    },
    shouldInvalidateCache: (event) => getQuery(event).refresh === "1",
  }
);