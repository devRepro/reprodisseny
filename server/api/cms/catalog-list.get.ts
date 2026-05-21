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
  showInNav?: boolean;
};

type ProductImage =
  | string
  | {
      src?: string;
      alt?: string;
      url?: string;
    }
  | null
  | undefined;

type CatalogProductAttribute = {
  key?: string;
  label?: string;
  value?: string;
  icon?: string;
  tone?: string;
};

type CatalogProduct = {
  id?: string | number;
  slug?: string;
  title?: string;
  path?: string;
  href?: string;

  description?: string;
  shortDescription?: string;
  excerpt?: string;
  summary?: string;

  metaTitle?: string;
  MetaTitle?: string;
  metaDescription?: string;
  MetaDescription?: string;

  image?: ProductImage;
  heroImage?: ProductImage;
  coverImage?: ProductImage;
  galleryImages?: ProductImage[];

  hidden?: boolean;
  isPublished?: boolean;
  published?: boolean;

  categorySlug?: string;
  category?: string;
  categoryId?: string | number;
  categoryLabel?: string;
  categoryTitle?: string;
  categoryName?: string;

  keywords?: string[] | string;
  KeywordsJson?: string[] | string;
  keywordsJson?: string[] | string;

  searchTerms?: string[] | string;
  SearchTermsJson?: string[] | string;
  searchTermsJson?: string[] | string;

  attributes?: CatalogProductAttribute[];
  attributesJson?: string;
  AttributesJson?: string;

  seo?: {
    title?: string;
    description?: string;
    metaDescription?: string;
    ogImageSrc?: string;
    image?: string;
    keywords?: string[] | string;
    searchTerms?: string[] | string;
  };
};

function s(value: unknown) {
  return String(value ?? "").trim();
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function norm(value: unknown) {
  return s(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlug(value: unknown) {
  const raw = s(value)
    .split("#")[0]
    .split("?")[0]
    .replace(/\/+$/, "");

  if (!raw) return "";

  const lastSegment = raw.includes("/")
    ? raw.split("/").filter(Boolean).at(-1) || raw
    : raw;

  return norm(lastSegment);
}

function parseAttributes(value: unknown): CatalogProductAttribute[] {
  if (Array.isArray(value)) {
    return value
      .map((item: any) => ({
        key: s(item?.key),
        label: s(item?.label),
        value: s(item?.value),
        icon: s(item?.icon),
        tone: s(item?.tone),
      }))
      .filter((item) => item.label)
      .slice(0, 4);
  }

  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return parseAttributes(parsed);
  } catch {
    return [];
  }
}

function getProductAttributes(product: CatalogProduct) {
  return parseAttributes(
    product.attributes || product.attributesJson || product.AttributesJson
  );
}

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(s).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(s).filter(Boolean);
    } catch {
      // Fallback a separación por coma, punto y coma o salto de línea.
    }
  }

  return raw
    .split(/[,;\n]/g)
    .map(s)
    .filter(Boolean);
}

function unique(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = norm(value);
    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function cleanDescription(value: unknown, maxLength = 180) {
  const text = s(value)
    .replace(/[#*_`>]/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

function isPublishedCategory(item: CatalogCategory) {
  return (
    item.hidden !== true &&
    item.isPublished !== false &&
    item.published !== false
  );
}

function isFilterableCategory(item: CatalogCategory) {
  return isPublishedCategory(item) && item.showInNav !== false;
}

function isVisibleProduct(item: CatalogProduct) {
  return (
    item.hidden !== true &&
    item.isPublished !== false &&
    item.published !== false
  );
}

function getCategorySlug(category: CatalogCategory | undefined) {
  return normalizeSlug(category?.slug);
}

function getCategoryParentSlug(category: CatalogCategory | undefined) {
  return normalizeSlug(category?.parent);
}

function getCategoryLabel(category: CatalogCategory | undefined) {
  return s(category?.label || category?.nav || category?.title);
}

function getCategoryPath(category: CatalogCategory | undefined) {
  return s(
    category?.path || (category?.slug ? `/categorias/${category.slug}` : "")
  );
}

function getProductPath(product: CatalogProduct) {
  return s(
    product.path || product.href || (product.slug ? `/productos/${product.slug}` : "")
  );
}

function getProductTitle(product: CatalogProduct) {
  return s(product.title);
}

function getProductDescription(product: CatalogProduct) {
  return cleanDescription(
    product.shortDescription ||
      product.description ||
      product.excerpt ||
      product.summary ||
      product.metaDescription ||
      product.MetaDescription ||
      product.seo?.description ||
      product.seo?.metaDescription
  );
}

function getImageSrc(image: ProductImage) {
  if (typeof image === "string") return s(image);
  return s(image?.src || image?.url);
}

function getProductImage(product: CatalogProduct) {
  const candidates: ProductImage[] = [
    product.image,
    product.heroImage,
    product.coverImage,
    product.seo?.ogImageSrc,
    product.seo?.image,
    ...(Array.isArray(product.galleryImages) ? product.galleryImages : []),
  ];

  for (const candidate of candidates) {
    const src = getImageSrc(candidate);
    if (src) return src;
  }

  return "";
}

function getProductKeywords(product: CatalogProduct) {
  return unique([
    ...parseList(product.keywords),
    ...parseList(product.KeywordsJson),
    ...parseList(product.keywordsJson),
    ...parseList(product.searchTerms),
    ...parseList(product.SearchTermsJson),
    ...parseList(product.searchTermsJson),
    ...parseList(product.seo?.keywords),
    ...parseList(product.seo?.searchTerms),
  ]);
}

function getProductAttributeTags(product: CatalogProduct) {
  return getProductAttributes(product)
    .map((attribute) => s(attribute.label || attribute.value))
    .filter(Boolean);
}

function getProductTags(product: CatalogProduct) {
  return unique([
    ...getProductAttributeTags(product),
    ...getProductKeywords(product),
  ]).slice(0, 3);
}

function getProductCategorySlug(product: CatalogProduct) {
  return normalizeSlug(product.categorySlug || product.category);
}

function getProductCategoryLabel(
  product: CatalogProduct,
  categoriesBySlug: Map<string, CatalogCategory>
) {
  const direct = s(
    product.categoryLabel || product.categoryTitle || product.categoryName
  );

  if (direct) return direct;

  return getCategoryLabel(categoriesBySlug.get(getProductCategorySlug(product)));
}

function scoreText(value: unknown, term: string, weight = 1) {
  const text = norm(value);
  if (!text || !term) return 0;

  if (text === term) return Math.round(220 * weight);
  if (text.startsWith(term)) return Math.round(160 * weight);
  if (text.includes(term)) return Math.round(95 * weight);

  const tokens = term.split(/\s+/g).filter((token) => token.length >= 2);
  if (tokens.length > 1 && tokens.every((token) => text.includes(token))) {
    return Math.round(70 * weight);
  }

  return 0;
}

function scoreList(values: string[], term: string, weight = 1) {
  return values.reduce(
    (best, value) => Math.max(best, scoreText(value, term, weight)),
    0
  );
}

function scoreProduct(
  product: CatalogProduct,
  term: string,
  categoryLabel = ""
) {
  const title = getProductTitle(product);
  const description = getProductDescription(product);
  const slug = s(product.slug);
  const keywords = getProductKeywords(product);
  const metaTitle = s(product.metaTitle || product.MetaTitle || product.seo?.title);
  const metaDescription = s(
    product.metaDescription ||
      product.MetaDescription ||
      product.seo?.description ||
      product.seo?.metaDescription
  );

  let score = 0;

  score += scoreText(title, term, 1);
  score += scoreText(slug, term, 0.75);
  score += scoreList(keywords, term, 0.8);
  score += scoreText(categoryLabel, term, 0.55);
  score += scoreText(metaTitle, term, 0.45);
  score += scoreText(metaDescription, term, 0.3);
  score += scoreText(description, term, 0.25);

  return score;
}

function getCategoryDescendantSlugs(
  selectedSlug: string,
  categories: CatalogCategory[]
) {
  const result = new Set<string>([selectedSlug]);

  let changed = true;

  while (changed) {
    changed = false;

    for (const category of categories) {
      const slug = getCategorySlug(category);
      const parentSlug = getCategoryParentSlug(category);

      if (slug && parentSlug && result.has(parentSlug) && !result.has(slug)) {
        result.add(slug);
        changed = true;
      }
    }
  }

  return result;
}

function getCategoryAncestorSlugs(
  slug: string,
  categoriesBySlug: Map<string, CatalogCategory>
) {
  const result = new Set<string>();
  let current = categoriesBySlug.get(slug);
  let guard = 0;

  while (current && guard < 20) {
    const parentSlug = getCategoryParentSlug(current);
    if (!parentSlug || result.has(parentSlug)) break;

    result.add(parentSlug);
    current = categoriesBySlug.get(parentSlug);
    guard += 1;
  }

  return result;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const requestedPage = clampInt(query.page, 1, 1, 9999);
  const perPage = clampInt(query.perPage, 12, 1, 60);
  const q = s(query.q);
  const term = norm(q);
  const sort = s(query.sort || "relevance");
  const selectedCategory = normalizeSlug(query.category);

  const { categories, products } = await getCmsCatalog();

  const publishedCategories = (Array.isArray(categories) ? categories : [])
    .filter((category): category is CatalogCategory => Boolean(category))
    .filter(isPublishedCategory);

  const visibleCategories = publishedCategories.filter(isFilterableCategory);

  const visibleProducts = (Array.isArray(products) ? products : [])
    .filter((product): product is CatalogProduct => Boolean(product))
    .filter(isVisibleProduct);

  const categoriesBySlug = new Map<string, CatalogCategory>();

  for (const category of publishedCategories) {
    const slug = getCategorySlug(category);
    if (slug) categoriesBySlug.set(slug, category);
  }

  const selectedCategorySlugs = selectedCategory
    ? getCategoryDescendantSlugs(selectedCategory, publishedCategories)
    : new Set<string>();

  const matchesSelectedCategory = (product: CatalogProduct) => {
    if (!selectedCategory) return true;
    return selectedCategorySlugs.has(getProductCategorySlug(product));
  };

  const matchesSearch = (product: CatalogProduct) => {
    if (!term) return true;

    const categoryLabel = getProductCategoryLabel(product, categoriesBySlug);
    return scoreProduct(product, term, categoryLabel) > 0;
  };

  let filteredProducts = visibleProducts
    .filter(matchesSelectedCategory)
    .filter(matchesSearch);

  filteredProducts = [...filteredProducts].sort((a, b) => {
    const titleA = getProductTitle(a);
    const titleB = getProductTitle(b);

    if (sort === "name-asc") return titleA.localeCompare(titleB, "es");
    if (sort === "name-desc") return titleB.localeCompare(titleA, "es");

    if (term) {
      const categoryA = getProductCategoryLabel(a, categoriesBySlug);
      const categoryB = getProductCategoryLabel(b, categoriesBySlug);
      const scoreA = scoreProduct(a, term, categoryA);
      const scoreB = scoreProduct(b, term, categoryB);

      return scoreB - scoreA || titleA.localeCompare(titleB, "es");
    }

    return titleA.localeCompare(titleB, "es");
  });

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * perPage;
  const paginatedItems = filteredProducts.slice(start, start + perPage);

  const items = paginatedItems.map((product) => {
    const categorySlug = getProductCategorySlug(product);
    const category = categoriesBySlug.get(categorySlug);
    const categoryLabel = getProductCategoryLabel(product, categoriesBySlug);
    const imageSrc = getProductImage(product);
    const title = getProductTitle(product);
    const path = getProductPath(product);

    return {
      id: s(product.id || product.slug || product.path),
      slug: s(product.slug),
      path,
      href: path,
      title,
      description: getProductDescription(product),
      image: imageSrc
        ? {
            src: imageSrc,
            alt: title,
          }
        : null,
      categorySlug,
      categoryTitle: categoryLabel,
      categoryLabel,
      categoryPath: getCategoryPath(category),
      tags: getProductTags(product),
      attributes: getProductAttributes(product),
    };
  });

  const categoryCounts = new Map<string, number>();

  for (const product of visibleProducts) {
    if (term && !matchesSearch(product)) continue;

    const slug = getProductCategorySlug(product);
    if (!slug) continue;

    const slugsToIncrement = new Set<string>([
      slug,
      ...getCategoryAncestorSlugs(slug, categoriesBySlug),
    ]);

    for (const categorySlug of slugsToIncrement) {
      categoryCounts.set(
        categorySlug,
        (categoryCounts.get(categorySlug) || 0) + 1
      );
    }
  }

  const categoryItems = visibleCategories
    .map((category) => {
      const slug = getCategorySlug(category);
      const title = getCategoryLabel(category);

      return {
        id: s(category.id || slug || category.path),
        slug,
        title,
        label: title,
        nav: title,
        path: getCategoryPath(category),
        count: categoryCounts.get(slug) || 0,
      };
    })
    .filter((category) => Boolean(category.slug))
    .sort((a, b) => a.title.localeCompare(b.title, "es"));

  return {
    items,
    total,
    totalPages,
    page,
    perPage,
    categories: categoryItems,
  };
});
