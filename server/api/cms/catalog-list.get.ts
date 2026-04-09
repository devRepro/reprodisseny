import { defineEventHandler, getQuery } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

type CatalogCategory = {
  id?: string | number;
  slug?: string;
  title?: string;
  label?: string;
  nav?: string;
  path?: string;
  parent?: string | null;
  hidden?: boolean;
  isPublished?: boolean;
  published?: boolean;
};

type CatalogProduct = {
  id?: string | number;
  slug?: string;
  title?: string;
  path?: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  image?: string | { src?: string; alt?: string } | null;
  hidden?: boolean;
  isPublished?: boolean;
  published?: boolean;
  categorySlug?: string;
  category?: string;
  categoryId?: string | number;
};

function s(v: unknown) {
  return String(v ?? "").trim();
}

function n(v: unknown, fallback = 0) {
  const value = Number(v);
  return Number.isFinite(value) ? value : fallback;
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

function isVisibleCategory(item: any) {
  return item?.hidden !== true && item?.isPublished !== false && item?.published !== false;
}

function isVisibleProduct(item: any) {
  return item?.hidden !== true && item?.isPublished !== false && item?.published !== false;
}

function getCategorySlug(category: any) {
  return s(category?.slug).toLowerCase();
}

function getCategoryLabel(category: any) {
  return s(category?.label || category?.nav || category?.title);
}

function getCategoryPath(category: any) {
  return s(category?.path || (category?.slug ? `/categorias/${category.slug}` : ""));
}

function getProductPath(product: any) {
  return s(product?.path || (product?.slug ? `/productos/${product.slug}` : ""));
}

function getProductTitle(product: any) {
  return s(product?.title);
}

function getProductDescription(product: any) {
  return s(product?.description || product?.excerpt || product?.summary);
}

function getProductImage(product: any) {
  if (typeof product?.image === "string") return product.image;
  return s(product?.image?.src) || null;
}

function scoreProduct(product: any, term: string, categoryLabel = "") {
  const title = norm(getProductTitle(product));
  const desc = norm(getProductDescription(product));
  const cat = norm(categoryLabel);

  let score = 0;

  if (title.startsWith(term)) score += 120;
  else if (title.includes(term)) score += 70;

  if (cat.startsWith(term)) score += 40;
  else if (cat.includes(term)) score += 20;

  if (desc.includes(term)) score += 15;

  return score;
}

function scoreCategory(category: any, term: string) {
  const title = norm(getCategoryLabel(category));

  if (!title) return 0;
  if (title.startsWith(term)) return 100;
  if (title.includes(term)) return 50;
  return 0;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const page = clampInt(query.page, 1, 1, 9999);
  const perPage = clampInt(query.perPage, 12, 1, 60);
  const q = s(query.q);
  const term = norm(q);
  const sort = s(query.sort || "relevance");
  const selectedCategory = norm(query.category);

  const { categories, products } = await getCmsCatalog();

  const visibleCategories = (Array.isArray(categories) ? categories : []).filter(isVisibleCategory);
  const visibleProducts = (Array.isArray(products) ? products : []).filter(isVisibleProduct);

  const categoriesBySlug = new Map<string, CatalogCategory>();
  for (const category of visibleCategories) {
    const slug = getCategorySlug(category);
    if (slug) categoriesBySlug.set(slug, category);
  }

  let filteredProducts = visibleProducts.filter((product: any) => {
    if (!selectedCategory) return true;

    const productCategorySlug = norm(product?.categorySlug || product?.category);
    return productCategorySlug === selectedCategory;
  });

  if (term) {
    filteredProducts = filteredProducts
      .map((product: any) => {
        const category = categoriesBySlug.get(norm(product?.categorySlug || product?.category));
        const categoryLabel = getCategoryLabel(category);
        const productScore = scoreProduct(product, term, categoryLabel);

        return {
          product,
          score: productScore,
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (sort === "name-asc") {
          return getProductTitle(a.product).localeCompare(getProductTitle(b.product));
        }

        if (sort === "name-desc") {
          return getProductTitle(b.product).localeCompare(getProductTitle(a.product));
        }

        return b.score - a.score || getProductTitle(a.product).localeCompare(getProductTitle(b.product));
      })
      .map((entry) => entry.product);
  } else {
    filteredProducts = [...filteredProducts].sort((a: any, b: any) => {
      if (sort === "name-asc") {
        return getProductTitle(a).localeCompare(getProductTitle(b));
      }

      if (sort === "name-desc") {
        return getProductTitle(b).localeCompare(getProductTitle(a));
      }

      return getProductTitle(a).localeCompare(getProductTitle(b));
    });
  }

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const paginatedItems = filteredProducts.slice(start, start + perPage);

  const items = paginatedItems.map((product: any) => {
    const category = categoriesBySlug.get(norm(product?.categorySlug || product?.category));

    return {
      id: s(product?.id || product?.slug || product?.path),
      slug: s(product?.slug),
      path: getProductPath(product),
      title: getProductTitle(product),
      description: getProductDescription(product),
      image: getProductImage(product)
        ? { src: getProductImage(product), alt: getProductTitle(product) }
        : null,
      categoryTitle: getCategoryLabel(category),
    };
  });

  const categoryCounts = new Map<string, number>();

  for (const product of visibleProducts) {
    const slug = norm(product?.categorySlug || product?.category);
    if (!slug) continue;

    if (selectedCategory && slug !== selectedCategory) continue;

    if (term) {
      const category = categoriesBySlug.get(slug);
      const categoryLabel = getCategoryLabel(category);
      const productScore = scoreProduct(product, term, categoryLabel);
      if (productScore <= 0) continue;
    }

    categoryCounts.set(slug, (categoryCounts.get(slug) || 0) + 1);
  }

  const categoryItems = visibleCategories
    .map((category: any) => {
      const slug = getCategorySlug(category);
      return {
        id: s(category?.id || slug || category?.path),
        slug,
        title: getCategoryLabel(category),
        label: getCategoryLabel(category),
        nav: getCategoryLabel(category),
        path: getCategoryPath(category),
        count: categoryCounts.get(slug) || 0,
      };
    })
    .filter((category) => Boolean(category.slug))
    .sort((a, b) => a.title.localeCompare(b.title));

  return {
    items,
    total,
    totalPages,
    page,
    perPage,
    categories: categoryItems,
  };
});