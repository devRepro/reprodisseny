import catalog from "~/cms/catalog.json";

type CatalogImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

type CatalogTab = {
  id?: string;
  title?: string;
  label?: string;
  heading?: string;
  content?: string;
  body?: string;
  html?: string;
};

type CatalogSeo = {
  title?: string;
  description?: string;
  ogImageSrc?: string;
  robotsOverride?: string;
  robotsAdvanced?: string;
};

type CatalogProduct = {
  id?: string | number;
  slug: string;
  title: string;
  path?: string | null;
  categorySlug?: string | null;
  isPublished?: boolean;
  order?: number;
  featured?: boolean;
  description?: string;
  price?: number;
  seo?: CatalogSeo;
  image?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  } | null;
};

type CatalogCategory = {
  id?: string | number;
  slug: string;
  path?: string | null;
  title: string;
  nav?: string;
  order?: number;
  parent?: string | null;
  hidden?: boolean;
  featured?: boolean;
  isPublished?: boolean;
  description?: string;
  seo?: CatalogSeo;
  tabs?: CatalogTab[];
  image?: CatalogImage | null;
};

type CatalogShape = {
  categories?: CatalogCategory[];
  products?: CatalogProduct[];
};

export type HomeCategoryCardItem = {
  id: string;
  title: string;
  slug: string;
  href: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null;
};

export type NavProductItem = {
  id: string;
  slug: string;
  title: string;
  path: string;
  order: number;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
};

export type NavCategoryItem = {
  id: string;
  slug: string;
  title: string;
  nav?: string;
  order: number;
  path: string;
  parent?: string | null;
  children: NavCategoryItem[];
  products: NavProductItem[];
  productCount: number;
};

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export type CategoryDetailChildItem = {
  slug: string;
  path: string;
  title: string;
  nav?: string;
  description?: string;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  order: number;
};

export type CategoryDetailProductItem = {
  slug: string;
  path: string;
  title: string;
  description?: string;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  order: number;
};

export type CategoryDetailTabItem = {
  id: string;
  title: string;
  text?: string;
  html?: string;
};

export type CategoryDetailPageDto = {
  slug: string;
  path: string;
  title: string;
  nav?: string;
  description?: string;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  children: CategoryDetailChildItem[];
  products: CategoryDetailProductItem[];
  tabs: CategoryDetailTabItem[];
  breadcrumbs: BreadcrumbItem[];
  seo: {
    title?: string;
    description?: string;
    canonical: string;
    image?: string;
    robots?: string;
  };
  redirectTo?: string;
};

export type ProductDetailDto = {
  slug: string;
  path: string;
  title: string;
  description?: string;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  category: {
    slug: string;
    path: string;
    title: string;
    nav?: string;
  } | null;
  breadcrumbs: BreadcrumbItem[];
  seo: {
    title?: string;
    description?: string;
    canonical: string;
    image?: string;
    robots?: string;
  };
  redirectTo?: string;
};

export type CategoryProductsListItem = {
  id: string;
  slug: string;
  path: string;
  title: string;
  description?: string;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  order: number;
  price?: number;
  categorySlug?: string | null;
};

export type CategoryProductsListDto = {
  items: CategoryProductsListItem[];
  page: number;
  pages: number;
  total: number;
  limit: number;
};

type CategoryProductsListOptions = {
  page?: number;
  limit?: number;
  sort?: "order" | "title" | "price";
  direction?: "ASC" | "DESC";
  q?: string;
  includeSubcategories?: boolean;
};

const FALLBACK_CARD_WIDTH = 252;
const FALLBACK_CARD_HEIGHT = 231;
const DEFAULT_SORT_ORDER = 9999;

function getCatalogCategories(): CatalogCategory[] {
  const data = catalog as CatalogShape;
  return Array.isArray(data.categories) ? data.categories : [];
}

function getCatalogProducts(): CatalogProduct[] {
  const data = catalog as CatalogShape;
  return Array.isArray(data.products) ? data.products : [];
}

function sortCategories(a: CatalogCategory, b: CatalogCategory) {
  const orderA = Number.isFinite(a.order) ? Number(a.order) : DEFAULT_SORT_ORDER;
  const orderB = Number.isFinite(b.order) ? Number(b.order) : DEFAULT_SORT_ORDER;

  if (orderA !== orderB) return orderA - orderB;

  return (a.title || "").localeCompare(b.title || "", "es", {
    sensitivity: "base",
  });
}

function sortProducts(a: CatalogProduct, b: CatalogProduct) {
  const orderA = Number.isFinite(a.order) ? Number(a.order) : DEFAULT_SORT_ORDER;
  const orderB = Number.isFinite(b.order) ? Number(b.order) : DEFAULT_SORT_ORDER;

  if (orderA !== orderB) return orderA - orderB;

  return (a.title || "").localeCompare(b.title || "", "es", {
    sensitivity: "base",
  });
}

export function getPublishedVisibleCategories(): CatalogCategory[] {
  return getCatalogCategories()
    .filter((item) => item?.isPublished !== false)
    .filter((item) => item?.hidden !== true)
    .sort(sortCategories);
}

function getPublishedProducts(): CatalogProduct[] {
  return getCatalogProducts()
    .filter((item) => item?.isPublished !== false)
    .sort(sortProducts);
}

function normalizeSlug(value: unknown) {
  return String(value ?? "").trim().replace(/^\/+|\/+$/g, "");
}

function normalizeCategoryPath(value: unknown) {
  const raw = String(value ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!raw) return "/categorias";

  if (raw.toLowerCase().startsWith("categorias/")) {
    return `/${raw}`.replace(/\/{2,}/g, "/");
  }

  return `/categorias/${raw}`.replace(/\/{2,}/g, "/");
}

function categoryPathOf(category: CatalogCategory) {
  return normalizeCategoryPath(category.path || category.slug);
}

function imageDtoOf(
  image: CatalogImage | null | undefined,
  fallbackAlt: string
) {
  if (!image?.src) return null;

  return {
    src: image.src,
    alt: image.alt || fallbackAlt,
    width: image.width,
    height: image.height,
  };
}

function productImageDtoOf(
  image:
    | {
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
      }
    | null
    | undefined,
  fallbackAlt: string
) {
  if (!image?.src) return null;

  return {
    src: image.src,
    alt: image.alt || fallbackAlt,
    width: image.width,
    height: image.height,
  };
}

function computeCategoryRobots(category: CatalogCategory & { seo?: CatalogSeo }) {
  if (category.hidden) return "noindex,follow";

  const override = String(category?.seo?.robotsOverride ?? "")
    .trim()
    .toUpperCase();

  const base =
    override === "NOINDEX_FOLLOW"
      ? "noindex,follow"
      : override === "NOINDEX_NOFOLLOW"
        ? "noindex,nofollow"
        : override === "INDEX_NOFOLLOW"
          ? "index,nofollow"
          : "index,follow";

  const advanced = String(category?.seo?.robotsAdvanced ?? "").trim();

  return advanced ? `${base},${advanced}` : base;
}

function buildCategoryTrail(
  category: CatalogCategory,
  categories: CatalogCategory[]
): CatalogCategory[] {
  const bySlug = new Map(
    categories.map((item) => [String(item.slug), item] as const)
  );

  const trail: CatalogCategory[] = [];
  const seen = new Set<string>();

  let current: CatalogCategory | undefined = category;

  while (current?.parent) {
    const parentSlug = String(current.parent);
    if (!parentSlug || seen.has(parentSlug)) break;

    const parent = bySlug.get(parentSlug);
    if (!parent) break;

    trail.unshift(parent);
    seen.add(parentSlug);
    current = parent;
  }

  return trail;
}

function getDirectChildrenOf(
  parent: CatalogCategory,
  categories: CatalogCategory[],
  limit: number
): CategoryDetailChildItem[] {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 200));

  return categories
    .filter((item) => item.parent === parent.slug)
    .sort(sortCategories)
    .slice(0, safeLimit)
    .map((item) => ({
      slug: item.slug,
      path: categoryPathOf(item),
      title: item.title,
      nav: item.nav || item.title,
      description: item.description || "",
      image: imageDtoOf(item.image, item.title),
      order: Number.isFinite(item.order) ? Number(item.order) : DEFAULT_SORT_ORDER,
    }));
}

function getDirectProductsOfCategory(
  category: CatalogCategory,
  limit: number
): CategoryDetailProductItem[] {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 24, 200));

  return getPublishedProducts()
    .filter((product) => String(product.categorySlug || "") === String(category.slug))
    .slice(0, safeLimit)
    .map((product) => ({
      slug: product.slug,
      path: product.path || `/productos/${product.slug}`,
      title: product.title,
      description: product.description || "",
      image: productImageDtoOf(product.image, product.title),
      order: Number.isFinite(product.order) ? Number(product.order) : DEFAULT_SORT_ORDER,
    }));
}

function getCategoryTabs(category: CatalogCategory): CategoryDetailTabItem[] {
  return (Array.isArray(category?.tabs) ? category.tabs : [])
    .map((tab, index) => {
      const title =
        tab?.title || tab?.label || tab?.heading || `Detalle ${index + 1}`;
      const html = typeof tab?.html === "string" ? tab.html.trim() : "";
      const text =
        typeof tab?.content === "string"
          ? tab.content.trim()
          : typeof tab?.body === "string"
            ? tab.body.trim()
            : "";

      return {
        id: tab?.id || `tab-${index + 1}`,
        title,
        ...(html ? { html } : {}),
        ...(!html && text ? { text } : {}),
      };
    })
    .filter((tab) => tab.title && (tab.html || tab.text));
}

export function getHomeCategories(limit = 8): HomeCategoryCardItem[] {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 8, 12));
  const all = getPublishedVisibleCategories();

  const featured = all.filter((item) => item.featured);
  const rest = all.filter((item) => !item.featured);

  return [...featured, ...rest].slice(0, safeLimit).map((category) => ({
    id: String(category.id ?? category.slug),
    title: category.title,
    slug: category.slug,
    href: category.path || `/categorias/${category.slug}`,
    image: category.image?.src
      ? {
          src: category.image.src,
          alt: category.image.alt || category.title,
          width: Number(category.image.width) || FALLBACK_CARD_WIDTH,
          height: Number(category.image.height) || FALLBACK_CARD_HEIGHT,
        }
      : null,
  }));
}

function toNavProductItem(product: CatalogProduct): NavProductItem {
  return {
    id: String(product.id ?? product.slug),
    slug: product.slug,
    title: product.title,
    path: product.path || `/productos/${product.slug}`,
    order: Number.isFinite(product.order) ? Number(product.order) : DEFAULT_SORT_ORDER,
    image: productImageDtoOf(product.image, product.title),
  };
}

export function getNavigationCategories(productLimit = 8): NavCategoryItem[] {
  const safeProductLimit = Math.max(0, Math.min(Number(productLimit) || 8, 12));
  const allCategories = getPublishedVisibleCategories();
  const allProducts = getPublishedProducts();

  const previewProductsByCategory = new Map<string, NavProductItem[]>();
  const productCountByCategory = new Map<string, number>();

  for (const product of allProducts) {
    const categorySlug = String(product.categorySlug || "").trim();
    if (!categorySlug) continue;

    productCountByCategory.set(
      categorySlug,
      (productCountByCategory.get(categorySlug) ?? 0) + 1
    );

    const preview = previewProductsByCategory.get(categorySlug) ?? [];
    if (preview.length < safeProductLimit) {
      preview.push(toNavProductItem(product));
      previewProductsByCategory.set(categorySlug, preview);
    }
  }

  const nodes = new Map<string, NavCategoryItem>();

  for (const category of allCategories) {
    nodes.set(category.slug, {
      id: String(category.id ?? category.slug),
      slug: category.slug,
      title: category.title,
      nav: category.nav || category.title,
      path: categoryPathOf(category),
      parent: category.parent ?? null,
      order: Number.isFinite(category.order) ? Number(category.order) : DEFAULT_SORT_ORDER,
      children: [],
      products: previewProductsByCategory.get(category.slug) ?? [],
      productCount: productCountByCategory.get(category.slug) ?? 0,
    });
  }

  const roots: NavCategoryItem[] = [];

  for (const category of allCategories) {
    const current = nodes.get(category.slug);
    if (!current) continue;

    if (category.parent && nodes.has(category.parent)) {
      nodes.get(category.parent)!.children.push(current);
    } else {
      roots.push(current);
    }
  }

  const sortTree = (items: NavCategoryItem[]) => {
    items.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;

      const labelA = a.nav || a.title;
      const labelB = b.nav || b.title;

      return labelA.localeCompare(labelB, "es", {
        sensitivity: "base",
      });
    });

    for (const item of items) {
      if (item.products.length > 1) {
        item.products.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.title.localeCompare(b.title, "es", {
            sensitivity: "base",
          });
        });
      }

      sortTree(item.children);
    }
  };

  sortTree(roots);

  return roots;
}

export function getCategoryDetailByPath(
  requestedPathOrSlug: string,
  options: {
    productLimit?: number;
    childLimit?: number;
  } = {}
): CategoryDetailPageDto | null {
  const categories = getPublishedVisibleCategories();
  const requestedPath = normalizeCategoryPath(requestedPathOrSlug);

  let category =
    categories.find((item) => categoryPathOf(item) === requestedPath) ?? null;

  let redirectTo: string | undefined;

  if (!category) {
    const requestedSlug = normalizeSlug(requestedPathOrSlug).split("/").pop() || "";

    category =
      categories.find((item) => String(item.slug) === requestedSlug) ?? null;

    if (category) {
      const canonicalPath = categoryPathOf(category);
      if (canonicalPath !== requestedPath) {
        redirectTo = canonicalPath;
      }
    }
  }

  if (!category) return null;

  const canonicalPath = categoryPathOf(category);
  const trail = buildCategoryTrail(category, categories);

  return {
    slug: category.slug,
    path: canonicalPath,
    title: category.title,
    nav: category.nav || category.title,
    description: category.description || "",
    image: imageDtoOf(category.image, category.title),
    children: getDirectChildrenOf(
      category,
      categories,
      options.childLimit ?? 50
    ),
    products: getDirectProductsOfCategory(
      category,
      options.productLimit ?? 24
    ),
    tabs: getCategoryTabs(category),
    breadcrumbs: [
      { label: "Inicio", to: "/" },
      { label: "Categorías", to: "/categorias" },
      ...trail.map((item) => ({
        label: item.nav || item.title,
        to: categoryPathOf(item),
      })),
      { label: category.nav || category.title },
    ],
    seo: {
      title: category?.seo?.title || `${category.title} | Reprodisseny`,
      description:
        category?.seo?.description ||
        category?.description ||
        "",
      canonical: canonicalPath,
      image:
        category?.seo?.ogImageSrc ||
        category.image?.src ||
        undefined,
      robots: computeCategoryRobots(category),
    },
    ...(redirectTo ? { redirectTo } : {}),
  };
}

function productPathOf(product: CatalogProduct) {
  const raw = String(product.path || "").trim();
  if (!raw) return `/productos/${product.slug}`;

  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

function getCategoryBySlug(slug: string) {
  return (
    getPublishedVisibleCategories().find(
      (item) => String(item.slug) === String(slug)
    ) || null
  );
}

function computeProductRobots(product: CatalogProduct & { seo?: CatalogSeo }) {
  const override = String(product?.seo?.robotsOverride ?? "")
    .trim()
    .toUpperCase();

  const base =
    override === "NOINDEX_FOLLOW"
      ? "noindex,follow"
      : override === "NOINDEX_NOFOLLOW"
        ? "noindex,nofollow"
        : override === "INDEX_NOFOLLOW"
          ? "index,nofollow"
          : "index,follow";

  const advanced = String(product?.seo?.robotsAdvanced ?? "").trim();

  return advanced ? `${base},${advanced}` : base;
}

function normalizeQueryText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function toSafePositiveInt(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function getCategoryDescendantSlugs(
  rootSlug: string,
  categories: CatalogCategory[]
): string[] {
  const byParent = new Map<string, string[]>();

  for (const category of categories) {
    const parent = String(category.parent || "").trim();
    const slug = String(category.slug || "").trim();

    if (!parent || !slug) continue;

    const current = byParent.get(parent) ?? [];
    current.push(slug);
    byParent.set(parent, current);
  }

  const out: string[] = [];
  const queue = [rootSlug];
  const seen = new Set<string>([rootSlug]);

  while (queue.length) {
    const current = queue.shift()!;
    const children = byParent.get(current) ?? [];

    for (const childSlug of children) {
      if (seen.has(childSlug)) continue;
      seen.add(childSlug);
      out.push(childSlug);
      queue.push(childSlug);
    }
  }

  return out;
}

function sortCategoryProducts(
  items: CategoryProductsListItem[],
  sort: "order" | "title" | "price",
  direction: "ASC" | "DESC"
) {
  const dir = direction === "DESC" ? -1 : 1;

  return items.slice().sort((a, b) => {
    if (sort === "title") {
      return a.title.localeCompare(b.title, "es", { sensitivity: "base" }) * dir;
    }

    if (sort === "price") {
      const priceA = Number.isFinite(a.price) ? Number(a.price) : DEFAULT_SORT_ORDER;
      const priceB = Number.isFinite(b.price) ? Number(b.price) : DEFAULT_SORT_ORDER;

      if (priceA !== priceB) return (priceA - priceB) * dir;

      return a.title.localeCompare(b.title, "es", { sensitivity: "base" }) * dir;
    }

    if (a.order !== b.order) return (a.order - b.order) * dir;

    return a.title.localeCompare(b.title, "es", { sensitivity: "base" }) * dir;
  });
}

export function getCategoryProductsBySlug(
  categorySlug: string,
  options: CategoryProductsListOptions = {}
): CategoryProductsListDto | null {
  const normalizedSlug = String(categorySlug || "").trim();
  if (!normalizedSlug) return null;

  const categories = getPublishedVisibleCategories();
  const category =
    categories.find((item) => String(item.slug) === normalizedSlug) || null;

  if (!category) return null;

  const page = Math.max(1, toSafePositiveInt(options.page, 1));
  const limit = Math.min(100, toSafePositiveInt(options.limit, 24));
  const sort = options.sort ?? "order";
  const direction = options.direction ?? "ASC";
  const search = normalizeQueryText(options.q);
  const includeSubcategories = options.includeSubcategories ?? true;

  const allowedSlugs = new Set<string>([category.slug]);

  if (includeSubcategories) {
    for (const slug of getCategoryDescendantSlugs(category.slug, categories)) {
      allowedSlugs.add(slug);
    }
  }

  let items: CategoryProductsListItem[] = getPublishedProducts()
    .filter((product) => {
      const productCategorySlug = String(product.categorySlug || "").trim();
      return allowedSlugs.has(productCategorySlug);
    })
    .map((product) => ({
      id: String(product.id ?? product.slug),
      slug: product.slug,
      path: product.path || `/productos/${product.slug}`,
      title: product.title,
      description: product.description || "",
      image: productImageDtoOf(product.image, product.title),
      order: Number.isFinite(product.order) ? Number(product.order) : DEFAULT_SORT_ORDER,
      price: Number.isFinite(product.price) ? Number(product.price) : undefined,
      categorySlug: product.categorySlug || null,
    }));

  if (search) {
    items = items.filter((item) => {
      const haystack = `${item.title} ${item.description || ""}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  items = sortCategoryProducts(items, sort, direction);

  const total = items.length;
  const pages = total > 0 ? Math.ceil(total / limit) : 0;
  const safePage = pages > 0 ? Math.min(page, pages) : 1;
  const start = (safePage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    page: safePage,
    pages,
    total,
    limit,
  };
}


export function getProductDetailBySlug(
  requestedSlugOrPath: string
): ProductDetailDto | null {
  const raw = String(requestedSlugOrPath || "").trim();
  if (!raw) return null;

  const normalizedSlug = raw
    .replace(/^\/+|\/+$/g, "")
    .replace(/^productos\//i, "")
    .split("/")
    .filter(Boolean)
    .pop();

  if (!normalizedSlug) return null;

  const products = getPublishedProducts();

  const product =
    products.find((item) => String(item.slug) === normalizedSlug) || null;

  if (!product) return null;

  const canonicalPath = productPathOf(product);
  let redirectTo: string | undefined;

  if (raw !== normalizedSlug && raw !== canonicalPath.replace(/^\/+/, "")) {
    const normalizedRawPath = raw.startsWith("/") ? raw : `/${raw}`;
    if (normalizedRawPath !== canonicalPath) {
      redirectTo = canonicalPath;
    }
  }

  const parentCategory = product.categorySlug
    ? getCategoryBySlug(String(product.categorySlug))
    : null;

  const categoryTrail = parentCategory
    ? buildCategoryTrail(parentCategory, getPublishedVisibleCategories())
    : [];

  return {
    slug: product.slug,
    path: canonicalPath,
    title: product.title,
    description: product.description || "",
    image: productImageDtoOf(product.image, product.title),
    category: parentCategory
      ? {
          slug: parentCategory.slug,
          path: categoryPathOf(parentCategory),
          title: parentCategory.title,
          nav: parentCategory.nav || parentCategory.title,
        }
      : null,
    breadcrumbs: [
      { label: "Inicio", to: "/" },
      { label: "Categorías", to: "/categorias" },
      ...categoryTrail.map((item) => ({
        label: item.nav || item.title,
        to: categoryPathOf(item),
      })),
      ...(parentCategory
        ? [
            {
              label: parentCategory.nav || parentCategory.title,
              to: categoryPathOf(parentCategory),
            },
          ]
        : []),
      { label: product.title },
    ],
    seo: {
      title: product?.seo?.title || `${product.title} | Reprodisseny`,
      description:
        product?.seo?.description || product.description || "",
      canonical: canonicalPath,
      image:
        product?.seo?.ogImageSrc ||
        product.image?.src ||
        undefined,
      robots: computeProductRobots(product),
    },
    ...(redirectTo ? { redirectTo } : {}),
  };
}