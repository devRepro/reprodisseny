import { defineEventHandler, getRouterParams, getQuery } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const norm = (s: any) => String(s || "").trim().toLowerCase();

function buildChildrenIndex(categories: any[]) {
  const byParent: Record<string, string[]> = {};
  for (const c of categories) {
    const parent = norm(c.parent || c.parentSlug || c.ParentSlug);
    const slug = norm(c.slug);
    if (!slug) continue;
    if (parent) (byParent[parent] ||= []).push(slug);
  }
  return byParent;
}

function descendants(slug: string, byParent: Record<string, string[]>) {
  const out: string[] = [];
  const q = [slug];
  const seen = new Set<string>([slug]);
  while (q.length) {
    const cur = q.shift()!;
    for (const ch of byParent[cur] || []) {
      if (seen.has(ch)) continue;
      seen.add(ch);
      out.push(ch);
      q.push(ch);
    }
  }
  return out;
}

function sanitizeProduct(p: any) {
  return {
    _id: p.id,
    path: p.path || (p.slug ? `/productos/${p.slug}` : null),
    title: p.title,
    description: p.shortDescription ?? p.description ?? "",
    image: (typeof p.image === "string" ? p.image : p.image?.src) || "/img/placeholder.webp",
    slug: p.slug,
    order: n(p.order ?? p.sortOrder ?? p.SortOrder),
    price: n(p.price ?? p.Price),
    categorySlug: p.categorySlug ?? p.CategorySlug,
  };
}

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event) as { slug: string };
  const q = getQuery(event);

  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Number(q.limit) || 24);
  const sortField = (q.sort === "title" ? "title" : q.sort === "price" ? "price" : "order") as "title" | "order" | "price";
  const sortDirection = (q.direction === "DESC" ? "DESC" : "ASC") as "ASC" | "DESC";
  const includeSub = String(q.includeSubcategory ?? q.includeSub ?? "true") === "true";
  const qClient = norm(q.q);

  const { categories, products } = await getCmsCatalog();
  const cats = (categories || []).filter((c: any) => c?.isPublished !== false && c?.hidden !== true);
  const prods = (products || []).filter((p: any) => p?.isPublished !== false && p?.hidden !== true);

  const byParent = buildChildrenIndex(cats);
  const baseSlug = norm(slug);
  const allowed = includeSub ? [baseSlug, ...descendants(baseSlug, byParent)] : [baseSlug];
  const allowedSet = new Set(allowed);

  let list = prods.filter((p: any) => {
    const cs = norm(p.categorySlug ?? p.CategorySlug);
    return allowedSet.has(cs);
  });

  if (qClient) {
    list = list.filter((p: any) => {
      const t = norm(p.title);
      const d = norm(p.shortDescription ?? p.description);
      return t.includes(qClient) || d.includes(qClient);
    });
  }

  const dir = sortDirection === "ASC" ? 1 : -1;
  list.sort((a: any, b: any) => {
    if (sortField === "title") return String(a.title || "").localeCompare(String(b.title || "")) * dir;
    if (sortField === "price") return (n(a.price ?? a.Price) - n(b.price ?? b.Price)) * dir;
    return (n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder)) * dir;
  });

  const total = list.length;
  const pages = total ? Math.max(1, Math.ceil(total / limit)) : 0;
  const start = (page - 1) * limit;

  return {
    items: list.slice(start, start + limit).map(sanitizeProduct),
    page,
    pages,
    total,
    limit,
  };
});

