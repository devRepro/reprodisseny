import { defineEventHandler, getQuery } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

type CatalogSort = "relevance" | "name-asc" | "name-desc";

type CatalogCategory = {
  id?: string | number;
  slug?: string;
  title?: string;
  nav?: string;
  path?: string;
  parent?: string | null;
  hidden?: boolean;
  isPublished?: boolean;
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
  label: string;
  value?: string;
  icon?: string;
  tone?: string;
};

type CatalogProductSeo = {
  metaTitle?: string;
  metaDescription?: string;
  ogImageSrc?: string;
  keywords?: string[] | string;
  searchTerms?: string[] | string;
};

type CatalogProduct = {
  id?: string | number;
  slug?: string;
  title?: string;
  path?: string;

  shortDescription?: string;
  description?: string;
  bodyMd?: string;

  image?: ProductImage;
  galleryImages?: ProductImage[];

  hidden?: boolean;
  isPublished?: boolean;

  categorySlug?: string;
  categorySlugs?: string[];

  attributes?: CatalogProductAttribute[] | string;

  seo?: CatalogProductSeo;
};

type PreparedProduct = {
  product: CatalogProduct;
  title: string;
  description: string;
  categorySlugs: string[];
  primaryCategorySlug: string;
  categoryLabel: string;
  searchScore: number;
};

const spanishCollator = new Intl.Collator("es", {
  sensitivity: "base",
});

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function clampInt(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number.parseInt(text(firstQueryValue(value)), 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsed));
}

function normalizeSearchText(value: unknown) {
  return text(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlug(value: unknown) {
  const raw = text(firstQueryValue(value))
    .split("#")[0]
    .split("?")[0]
    .replace(/^\/+|\/+$/g, "");

  if (!raw) {
    return "";
  }

  const lastSegment = raw.split("/").filter(Boolean).at(-1) ?? "";

  return lastSegment
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const raw = value.trim();

  if (!raw) {
    return [];
  }

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed.map(text).filter(Boolean);
      }
    } catch {
      // Se intenta después como lista separada por comas o saltos.
    }
  }

  return raw
    .split(/[,;\n]/g)
    .map(text)
    .filter(Boolean);
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = normalizeSearchText(value);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function cleanDescription(value: unknown, maxLength = 180) {
  const cleaned = text(value)
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length <= maxLength) {
    return cleaned;
  }

  const truncated = cleaned
    .slice(0, maxLength)
    .replace(/\s+\S*$/, "")
    .trim();

  return `${truncated}…`;
}

function parseAttributes(value: unknown): CatalogProductAttribute[] {
  if (typeof value === "string") {
    const raw = value.trim();

    if (!raw) {
      return [];
    }

    try {
      return parseAttributes(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;

      const label = text(
        record.label ||
          record.value ||
          record.key
      );

      if (!label) {
        return null;
      }

      return {
        key: text(record.key) || undefined,
        label,
        value: text(record.value) || undefined,
        icon: text(record.icon) || undefined,
        tone: text(record.tone) || undefined,
      };
    })
    .filter(
      (item): item is CatalogProductAttribute =>
        item !== null
    )
    .slice(0, 4);
}

function isPublishedCategory(category: CatalogCategory) {
  return (
    category.hidden !== true &&
    category.isPublished !== false
  );
}

function isFilterableCategory(category: CatalogCategory) {
  return (
    isPublishedCategory(category) &&
    category.showInNav !== false
  );
}

function isVisibleProduct(product: CatalogProduct) {
  return (
    product.hidden !== true &&
    product.isPublished !== false
  );
}

function getCategorySlug(category?: CatalogCategory) {
  return normalizeSlug(category?.slug);
}

function getCategoryParentSlug(category?: CatalogCategory) {
  return normalizeSlug(category?.parent);
}

function getCategoryLabel(category?: CatalogCategory) {
  return text(category?.nav || category?.title);
}

function getCategoryPath(category?: CatalogCategory) {
  const directPath = text(category?.path);

  if (directPath) {
    return directPath;
  }

  const slug = getCategorySlug(category);

  return slug ? `/categorias/${slug}` : "";
}

function getProductPath(product: CatalogProduct) {
  const directPath = text(product.path);

  if (directPath) {
    return directPath;
  }

  const slug = normalizeSlug(product.slug);

  return slug ? `/productos/${slug}` : "/productos";
}

function getProductTitle(product: CatalogProduct) {
  return text(product.title) || "Producto";
}

function getProductDescription(product: CatalogProduct) {
  return cleanDescription(
    product.shortDescription ||
      product.description ||
      product.seo?.metaDescription ||
      product.bodyMd
  );
}

function resolveImage(
  image: ProductImage,
  fallbackAlt: string
): { src: string; alt: string } | null {
  if (typeof image === "string") {
    const src = text(image);

    return src
      ? {
          src,
          alt: fallbackAlt,
        }
      : null;
  }

  if (!image || typeof image !== "object") {
    return null;
  }

  const src = text(image.src || image.url);

  if (!src) {
    return null;
  }

  return {
    src,
    alt: text(image.alt) || fallbackAlt,
  };
}

function getProductImage(product: CatalogProduct) {
  const title = getProductTitle(product);

  const candidates: ProductImage[] = [
    product.image,
    product.seo?.ogImageSrc,
    ...(Array.isArray(product.galleryImages)
      ? product.galleryImages
      : []),
  ];

  for (const candidate of candidates) {
    const resolved = resolveImage(candidate, title);

    if (resolved) {
      return resolved;
    }
  }

  return null;
}

/**
 * Términos exclusivamente internos para el buscador.
 * Nunca se devuelven como tags visibles.
 */
function getProductSearchTerms(product: CatalogProduct) {
  return uniqueStrings([
    ...parseStringList(product.seo?.keywords),
    ...parseStringList(product.seo?.searchTerms),
  ]);
}

function getProductAttributes(product: CatalogProduct) {
  return parseAttributes(product.attributes);
}

/**
 * Solo los atributos comerciales pueden mostrarse
 * como etiquetas en las tarjetas.
 */
function getDisplayTags(
  attributes: CatalogProductAttribute[]
) {
  return uniqueStrings(
    attributes.map((attribute) => attribute.label)
  ).slice(0, 3);
}

function getProductCategorySlugs(
  product: CatalogProduct
) {
  const categorySlugs = [
    normalizeSlug(product.categorySlug),
    ...(Array.isArray(product.categorySlugs)
      ? product.categorySlugs.map(normalizeSlug)
      : []),
  ].filter(Boolean);

  return uniqueStrings(categorySlugs);
}

function scoreText(
  value: unknown,
  term: string,
  weight = 1
) {
  const normalized = normalizeSearchText(value);

  if (!normalized || !term) {
    return 0;
  }

  if (normalized === term) {
    return Math.round(220 * weight);
  }

  if (normalized.startsWith(term)) {
    return Math.round(160 * weight);
  }

  if (normalized.includes(term)) {
    return Math.round(95 * weight);
  }

  const tokens = term
    .split(/\s+/g)
    .filter((token) => token.length >= 2);

  if (
    tokens.length > 1 &&
    tokens.every((token) => normalized.includes(token))
  ) {
    return Math.round(70 * weight);
  }

  return 0;
}

function scoreList(
  values: string[],
  term: string,
  weight = 1
) {
  return values.reduce(
    (bestScore, value) =>
      Math.max(
        bestScore,
        scoreText(value, term, weight)
      ),
    0
  );
}

function scoreProduct(
  product: CatalogProduct,
  term: string,
  categoryLabels: string,
  title: string,
  description: string
) {
  if (!term) {
    return 0;
  }

  let score = 0;

  score += scoreText(title, term, 1);
  score += scoreText(product.slug, term, 0.75);
  score += scoreList(
    getProductSearchTerms(product),
    term,
    0.8
  );
  score += scoreText(categoryLabels, term, 0.55);
  score += scoreText(
    product.seo?.metaTitle,
    term,
    0.45
  );
  score += scoreText(
    product.seo?.metaDescription,
    term,
    0.3
  );
  score += scoreText(description, term, 0.25);

  return score;
}

function normalizeSort(value: unknown): CatalogSort {
  const requested = text(firstQueryValue(value));

  if (
    requested === "name-asc" ||
    requested === "name-desc"
  ) {
    return requested;
  }

  return "relevance";
}

function buildCategoryChildrenIndex(
  categories: CatalogCategory[]
) {
  const childrenByParent = new Map<string, string[]>();

  for (const category of categories) {
    const slug = getCategorySlug(category);
    const parentSlug = getCategoryParentSlug(category);

    if (!slug || !parentSlug) {
      continue;
    }

    const children =
      childrenByParent.get(parentSlug) ?? [];

    children.push(slug);
    childrenByParent.set(parentSlug, children);
  }

  return childrenByParent;
}

function getCategoryDescendantSlugs(
  selectedSlug: string,
  childrenByParent: Map<string, string[]>
) {
  const result = new Set<string>([selectedSlug]);
  const queue = [selectedSlug];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    for (
      const child of childrenByParent.get(current) ?? []
    ) {
      if (result.has(child)) {
        continue;
      }

      result.add(child);
      queue.push(child);
    }
  }

  return result;
}

function getCategoryAncestorSlugs(
  slug: string,
  categoriesBySlug: Map<
    string,
    CatalogCategory
  >
) {
  const result = new Set<string>();
  let current = categoriesBySlug.get(slug);

  while (current) {
    const parentSlug =
      getCategoryParentSlug(current);

    if (!parentSlug || result.has(parentSlug)) {
      break;
    }

    result.add(parentSlug);
    current = categoriesBySlug.get(parentSlug);
  }

  return result;
}

function prepareProduct(
  product: CatalogProduct,
  categoriesBySlug: Map<
    string,
    CatalogCategory
  >,
  term: string
): PreparedProduct {
  const title = getProductTitle(product);
  const description =
    getProductDescription(product);

  const categorySlugs =
    getProductCategorySlugs(product);

  const primaryCategorySlug =
    categorySlugs[0] || "";

  const categoryLabels = categorySlugs
    .map((slug) =>
      getCategoryLabel(categoriesBySlug.get(slug))
    )
    .filter(Boolean);

  return {
    product,
    title,
    description,
    categorySlugs,
    primaryCategorySlug,
    categoryLabel: categoryLabels[0] || "",
    searchScore: scoreProduct(
      product,
      term,
      categoryLabels.join(" "),
      title,
      description
    ),
  };
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const requestedPage = clampInt(
    query.page,
    1,
    1,
    9999
  );

  const perPage = clampInt(
    query.perPage,
    12,
    1,
    60
  );

  const q = text(firstQueryValue(query.q));
  const term = normalizeSearchText(q);

  const sort = normalizeSort(query.sort);

  const selectedCategory = normalizeSlug(
    query.category
  );

  const { categories, products } =
    await getCmsCatalog();

  const publishedCategories = (
    Array.isArray(categories) ? categories : []
  )
    .filter(
      (
        category
      ): category is CatalogCategory =>
        Boolean(category)
    )
    .filter(isPublishedCategory);

  const visibleCategories =
    publishedCategories.filter(
      isFilterableCategory
    );

  const visibleProducts = (
    Array.isArray(products) ? products : []
  )
    .filter(
      (
        product
      ): product is CatalogProduct =>
        Boolean(product)
    )
    .filter(isVisibleProduct);

  const categoriesBySlug = new Map<
    string,
    CatalogCategory
  >();

  for (const category of publishedCategories) {
    const slug = getCategorySlug(category);

    if (slug) {
      categoriesBySlug.set(slug, category);
    }
  }

  const childrenByParent =
    buildCategoryChildrenIndex(
      publishedCategories
    );

  const selectedCategorySlugs =
    selectedCategory
      ? getCategoryDescendantSlugs(
          selectedCategory,
          childrenByParent
        )
      : new Set<string>();

  const preparedProducts = visibleProducts.map(
    (product) =>
      prepareProduct(
        product,
        categoriesBySlug,
        term
      )
  );

  const searchMatchedProducts = term
    ? preparedProducts.filter(
        (item) => item.searchScore > 0
      )
    : preparedProducts;

  const filteredProducts = selectedCategory
    ? searchMatchedProducts.filter((item) =>
        item.categorySlugs.some((slug) =>
          selectedCategorySlugs.has(slug)
        )
      )
    : searchMatchedProducts;

  filteredProducts.sort((a, b) => {
    if (sort === "name-desc") {
      return spanishCollator.compare(
        b.title,
        a.title
      );
    }

    if (sort === "name-asc") {
      return spanishCollator.compare(
        a.title,
        b.title
      );
    }

    if (
      term &&
      a.searchScore !== b.searchScore
    ) {
      return b.searchScore - a.searchScore;
    }

    return spanishCollator.compare(
      a.title,
      b.title
    );
  });

  const total = filteredProducts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / perPage)
  );

  const page = Math.min(
    requestedPage,
    totalPages
  );

  const start = (page - 1) * perPage;

  const paginatedItems =
    filteredProducts.slice(
      start,
      start + perPage
    );

  const items = paginatedItems.map((item) => {
    const {
      product,
      title,
      description,
      primaryCategorySlug,
      categoryLabel,
    } = item;

    const category = categoriesBySlug.get(
      primaryCategorySlug
    );

    const image = getProductImage(product);
    const attributes =
      getProductAttributes(product);
    const path = getProductPath(product);

    return {
      id: text(
        product.id ??
          product.slug ??
          product.path
      ),
      slug: normalizeSlug(product.slug),
      path,
      href: path,
      title,
      description,
      image,
      categorySlug: primaryCategorySlug,
      categoryTitle: categoryLabel,
      categoryLabel,
      categoryPath:
        getCategoryPath(category),
      tags: getDisplayTags(attributes),
      attributes,
    };
  });

  const categoryCounts = new Map<
    string,
    number
  >();

  /*
   * Los contadores respetan la búsqueda activa,
   * pero no el filtro de categoría seleccionado.
   * Así el usuario puede cambiar de categoría
   * sin perder los resultados compatibles.
   */
  for (const item of searchMatchedProducts) {
    const slugsToIncrement = new Set<string>();

    for (
      const categorySlug of item.categorySlugs
    ) {
      slugsToIncrement.add(categorySlug);

      for (
        const ancestorSlug of getCategoryAncestorSlugs(
          categorySlug,
          categoriesBySlug
        )
      ) {
        slugsToIncrement.add(ancestorSlug);
      }
    }

    for (
      const categorySlug of slugsToIncrement
    ) {
      categoryCounts.set(
        categorySlug,
        (categoryCounts.get(categorySlug) ?? 0) +
          1
      );
    }
  }

  const categoryItems = visibleCategories
    .map((category) => {
      const slug = getCategorySlug(category);
      const title = getCategoryLabel(category);

      return {
        id: text(
          category.id ??
            slug ??
            category.path
        ),
        slug,
        title,
        label: title,
        nav: title,
        path: getCategoryPath(category),
        count: categoryCounts.get(slug) ?? 0,
      };
    })
    .filter((category) =>
      Boolean(category.slug)
    )
    .sort((a, b) =>
      spanishCollator.compare(
        a.title,
        b.title
      )
    );

  return {
    items,
    total,
    totalPages,
    page,
    perPage,
    categories: categoryItems,
  };
});