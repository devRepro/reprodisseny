import { defineEventHandler, getQuery } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const norm = (s: any) => String(s || "").trim().toLowerCase();

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const productLimit = Math.max(0, Math.min(50, Number(q.productLimit ?? 6)));

  const { categories, products } = await getCmsCatalog();

  const cats = (categories || [])
    .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
    .slice()
    .sort((a: any, b: any) => n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder));

  const prods = (products || [])
    .filter((p: any) => p?.isPublished !== false && p?.hidden !== true)
    .slice()
    .sort((a: any, b: any) => n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder));

  // 1) nodos categoría
  const bySlug: Record<string, any> = {};
  for (const c of cats) {
    const slug = norm(c.slug);
    if (!slug) continue;
    bySlug[slug] = {
      id: c.id,
      slug: c.slug,
      title: c.title,
      nav: c.nav ?? c.title,
      order: n(c.order ?? c.sortOrder ?? c.SortOrder),
      path: c.path || `/categorias/${c.slug}`,
      image: (typeof c.image === "string" ? c.image : c.image?.src) || undefined,
      parent: norm(c.parent || c.parentSlug || c.ParentSlug) || undefined,
      children: [],
      products: [],
    };
  }

  // 2) árbol por parent
  const roots: any[] = [];
  for (const s in bySlug) {
    const node = bySlug[s];
    if (node.parent && bySlug[node.parent]) bySlug[node.parent].children.push(node);
    else roots.push(node);
  }

  // 3) productos agrupados por categorySlug
  const byCat: Record<string, any[]> = {};
  for (const p of prods) {
    const cs = norm(p.categorySlug ?? p.CategorySlug);
    if (!cs) continue;
    (byCat[cs] ||= []).push({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.shortDescription ?? p.description ?? "",
      image: (typeof p.image === "string" ? p.image : p.image?.src) || undefined,
      categorySlug: p.categorySlug ?? p.CategorySlug,
      path: p.path || `/productos/${p.slug}`,
      order: n(p.order ?? p.sortOrder ?? p.SortOrder),
      price: n(p.price ?? p.Price),
    });
  }

  // 4) adjuntar productos SOLO a hojas
  const attach = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) attach(node.children);
      else {
        const list = byCat[norm(node.slug)] || [];
        node.products = productLimit > 0 ? list.slice(0, productLimit) : list;
      }
    }
  };
  attach(roots);

  // 5) índice por slug + menuItems (árbol)
  const indexBySlug: Record<string, any> = {};
  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      indexBySlug[norm(node.slug)] = node;
      if (node.children?.length) walk(node.children);
    }
  };
  walk(roots);

  return { tree: roots, indexBySlug, menuItems: roots };
});
