import catalog from "~/cms/catalog.json";

import {
  getCategoryDetailGalleryBySlug,
  type CategoryDetailMediaItemDto,
} from "./category-detail-gallery-registry";

type CatalogSeoHreflang = {
  lang?: string;
  url?: string;
};

type CatalogSeo = {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  hreflang?: CatalogSeoHreflang[];
  schema?: Record<string, unknown>;
  ogImageSrc?: string;
  robotsOverride?: string;
  robotsAdvanced?: string;
};

type CatalogImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

type CatalogBlock =
  | {
    type: "text";
    text?: string;
    html?: boolean;
  }
  | {
    type: "bullets";
    items?: string[];
    ordered?: boolean;
  }
  | {
    type: "image";
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
  };

type CatalogTypeItem = {
  title?: string;
  description?: string;
  features?: string[];
  idealFor?: string;
};

type CatalogFormatItem = {
  title?: string;
  description?: string;
};

type CatalogFormatsData = {
  intro?: string;
  shapes?: CatalogFormatItem[];
  deliveryFormats?: CatalogFormatItem[];
};

type CatalogSection = {
  id?: string;
  key?: string;
  title?: string;
  body?: string;
  intro?: string;
  blocks?: CatalogBlock[];
  items?: CatalogTypeItem[];
  formatsData?: CatalogFormatsData;
};

type CatalogProductFormField = {
  label?: string;
  name?: string;
  type?: string;
  required?: boolean;
  options?: string[];
  readonly?: boolean;
  placeholder?: string;
  helpText?: string;
};

type CatalogFaq = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

type CatalogProductSection = {
  id?: string;
  key?: string;
  title?: string;
  body?: string;
  blocks?: CatalogBlock[];
};

type CatalogProduct = {
  id?: string | number;
  updatedAt?: string;
  type?: string;
  slug: string;
  path: string;
  title: string;
  categorySlug?: string | null;
  categorySlugs?: string[];
  isPublished?: boolean;
  order?: number;
  featured?: boolean;
  description?: string;
  shortDescription?: string;
  bodyMd?: string;
  sections?: CatalogProductSection[];
  faqs?: CatalogFaq[];
  price?: number;
  seo?: CatalogSeo;
  formFields?: CatalogProductFormField[];
  image?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  } | null;
};

type CatalogCategory = {
  id?: string | number;
  updatedAt?: string;
  type?: string;
  slug: string;
  path: string;
  title: string;
  nav?: string;
  order?: number;
  parent?: string | null;
  hidden?: boolean;
  featured?: boolean;
  isPublished?: boolean;
  description?: string;
  bodyMd?: string;
  detailsMd?: string;
  materialsMd?: string;
  finishesMd?: string;
  formatsMd?: string;
  typesMd?: string;
  usesMd?: string;
  howWeWork?: unknown;
  sections?: CatalogSection[];
  faqs?: CatalogFaq[];
  image?: CatalogImage | null;
  legacySlugs?: string[];
  seo?: CatalogSeo;
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

export type CategoryDetailFaqItem = {
  q: string;
  a: string;
};

type CategoryBulletCardItem = {
  title: string;
  description: string;
};

export type CategorySectionKind = "details" | "types" | "cards" | "default";

export type CategoryCardItem = {
  title: string;
  description: string;
  tags?: string[];
  meta?: string;
};

export type CategoryCardGroup = {
  id: string;
  title?: string;
  description?: string;
  items: CategoryCardItem[];
  columns?: 2 | 3 | 4;
};

export type CategoryDetailSectionItem = {
  id: string;
  key?: string;
  kind: CategorySectionKind;
  title: string;
  intro?: string;
  blocks: CatalogBlock[];
  items?: {
    title: string;
    description: string;
    features?: string[];
    idealFor?: string;
  }[];
  cardGroups?: CategoryCardGroup[];
};

export type CategoryHowWeWorkStepItem = {
  label?: string;
  title: string;
  description: string;
};

export type CategoryHowWeWorkCta = {
  title: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
};

export type CategoryHowWeWorkDto = {
  id?: string;
  key?: string;
  title?: string;
  description?: string;
  steps: CategoryHowWeWorkStepItem[];
  cta?: CategoryHowWeWorkCta | null;
};

export type CategoryDetailPageDto = {
  slug: string;
  path: string;
  title: string;
  nav?: string;
  description?: string;
  bodyMd?: string;
  howWeWork?: CategoryHowWeWorkDto | null;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  children: CategoryDetailChildItem[];
  detailGallery?: CategoryDetailMediaItemDto[];
  products: CategoryDetailProductItem[];
  sections: CategoryDetailSectionItem[];
  faqs: CategoryDetailFaqItem[];
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

export type ProductDetailHreflangItem = {
  lang: string;
  url: string;
};

export type ProductDetailFormFieldItem = {
  label: string;
  name: string;
  type: string;
  required: boolean;
  options: string[];
  readonly?: boolean;
  placeholder?: string;
  helpText?: string;
};

export type ProductDetailSectionItem = {
  id: string;
  key?: string;
  title: string;
  body?: string;
  text?: string;
  blocks: CatalogBlock[];
  items?: Array<Record<string, unknown>>;
  formatsData?: {
    intro?: string;
    shapes?: Array<{
      title: string;
      description: string;
    }>;
    deliveryFormats?: Array<{
      title: string;
      description: string;
    }>;
  };
};

export type ProductDetailFaqItem = {
  q: string;
  a: string;
};

export type ProductDetailDto = {
  slug: string;
  path: string;
  title: string;
  shortDescription?: string;
  description?: string;
  bodyMd?: string;
  sections: ProductDetailSectionItem[];
  faqs: ProductDetailFaqItem[];
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
  formFields: ProductDetailFormFieldItem[];
  breadcrumbs: BreadcrumbItem[];
  seo: {
    title?: string;
    description?: string;
    canonical: string;
    image?: string;
    robots?: string;
    hreflang: ProductDetailHreflangItem[];
    schema?: Record<string, unknown>;
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

function safeDecode(value: unknown) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

function normalizeComparable(value: unknown) {
  return safeDecode(value)
    .trim()
    .replace(/\\/g, "/")
    .replace(/^[a-z]+:\/\/[^/]+/i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/{2,}/g, "/")
    .toLowerCase();
}

function normalizeSlug(value: unknown) {
  return normalizeComparable(value).replace(/^\/+|\/+$/g, "");
}

function normalizeComparableLabel(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getLastPathSegment(value: unknown) {
  const normalized = normalizeSlug(value);
  if (!normalized) return "";
  const parts = normalized.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

function toBoundedInt(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? Math.trunc(n) : fallback;
  return Math.max(min, Math.min(safe, max));
}

function toSafePositiveInt(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function normalizeQueryText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getCatalogCategories(): CatalogCategory[] {
  const data = catalog as CatalogShape;
  return Array.isArray(data.categories) ? data.categories : [];
}

function createCategoryTextSection(
  key: string,
  title: string,
  body: unknown
): CatalogSection | null {
  const text = String(body ?? "").trim();
  if (!text) return null;

  return {
    id: key,
    key,
    title,
    body: text,
  };
}

function getMergedCategorySections(category: CatalogCategory): CatalogSection[] {
  const baseSections = Array.isArray(category.sections)
    ? category.sections.filter(Boolean)
    : [];

  const existingKeys = new Set(
    baseSections.map((section) =>
      String(section?.key || section?.id || "")
        .trim()
        .toLowerCase()
    )
  );

  const extraSections = [
    createCategoryTextSection("details", "Detalles", category.detailsMd),
    createCategoryTextSection("materials", "Materiales", category.materialsMd),
    createCategoryTextSection("types", "Tipos", category.typesMd),
    createCategoryTextSection("finishes", "Acabados", category.finishesMd),
    createCategoryTextSection("formats", "Formatos", category.formatsMd),
    createCategoryTextSection("uses", "Aplicaciones", category.usesMd),
  ].filter(
    (section): section is CatalogSection =>
      Boolean(section) &&
      !existingKeys.has(
        String(section.key || section.id || "")
          .trim()
          .toLowerCase()
      )
  );

  return [...baseSections, ...extraSections];
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

function isTopLevelCategory(category: CatalogCategory) {
  return !String(category.parent ?? "").trim();
}

function getTopLevelPublishedVisibleCategories(): CatalogCategory[] {
  return getPublishedVisibleCategories().filter(isTopLevelCategory);
}

function getPublishedProducts(): CatalogProduct[] {
  return getCatalogProducts()
    .filter((item) => item?.isPublished !== false)
    .sort(sortProducts);
}

function normalizeCategoryPath(value: unknown) {
  const raw = normalizeSlug(value);

  if (!raw || raw === "categorias") return "/categorias";

  if (raw.startsWith("categorias/")) {
    return `/${raw}`.replace(/\/{2,}/g, "/");
  }

  return `/categorias/${raw}`.replace(/\/{2,}/g, "/");
}

function normalizeProductPath(value: unknown) {
  const raw = normalizeSlug(value);

  if (!raw || raw === "productos") return "/productos";

  if (raw.startsWith("productos/")) {
    return `/${raw}`.replace(/\/{2,}/g, "/");
  }

  return `/productos/${raw}`.replace(/\/{2,}/g, "/");
}

function categoryPathOf(category: CatalogCategory) {
  return normalizeCategoryPath(category.path || category.slug);
}

function productPathOf(product: CatalogProduct) {
  return normalizeProductPath(product.path || product.slug);
}

function categoryPublicSlugOf(category: CatalogCategory) {
  return getLastPathSegment(categoryPathOf(category)) || normalizeSlug(category.slug);
}

function productPublicSlugOf(product: CatalogProduct) {
  return getLastPathSegment(productPathOf(product)) || normalizeSlug(product.slug);
}

function getCategoryLookupKeys(category: CatalogCategory) {
  const keys = new Set<string>();

  const canonicalPath = categoryPathOf(category);
  const canonicalSlug = categoryPublicSlugOf(category);
  const internalSlug = normalizeSlug(category.slug);

  if (canonicalPath) keys.add(canonicalPath);
  if (canonicalSlug) keys.add(canonicalSlug);
  if (internalSlug) keys.add(internalSlug);

  for (const legacy of Array.isArray(category.legacySlugs)
    ? category.legacySlugs
    : []) {
    const rawLegacy = String(legacy || "").trim();
    if (!rawLegacy) continue;

    const legacyPath = normalizeCategoryPath(rawLegacy);
    const legacySlug = normalizeSlug(rawLegacy);
    const legacyLastSegment = getLastPathSegment(rawLegacy);

    if (legacyPath) keys.add(legacyPath);
    if (legacySlug) keys.add(legacySlug);
    if (legacyLastSegment) keys.add(legacyLastSegment);
  }

  return keys;
}

function getProductLookupKeys(product: CatalogProduct) {
  const keys = new Set<string>();

  const canonicalPath = productPathOf(product);
  const canonicalSlug = productPublicSlugOf(product);
  const internalSlug = normalizeSlug(product.slug);
  const internalSlugAsPath = normalizeProductPath(product.slug);

  if (canonicalPath) keys.add(canonicalPath);
  if (canonicalSlug) keys.add(canonicalSlug);
  if (internalSlug) keys.add(internalSlug);
  if (internalSlugAsPath) keys.add(internalSlugAsPath);

  return keys;
}

function imageDtoOf(image: CatalogImage | null | undefined, fallbackAlt: string) {
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

function getCategoryFaqs(category: CatalogCategory): CategoryDetailFaqItem[] {
  return (Array.isArray(category?.faqs) ? category.faqs : [])
    .map((faq) => {
      const q = String(faq?.q ?? faq?.question ?? "").trim();
      const a = String(faq?.a ?? faq?.answer ?? "").trim();
      return { q, a };
    })
    .filter((faq) => faq.q && faq.a);
}

function getProductFaqs(product: CatalogProduct): ProductDetailFaqItem[] {
  return (Array.isArray(product?.faqs) ? product.faqs : [])
    .map((faq) => {
      const q = String(faq?.q ?? faq?.question ?? "").trim();
      const a = String(faq?.a ?? faq?.answer ?? "").trim();
      return { q, a };
    })
    .filter((faq) => faq.q && faq.a);
}

function computeRobotsBase(
  overrideValue: unknown,
  advancedValue: unknown,
  forceNoindex = false
) {
  if (forceNoindex) {
    const advanced = String(advancedValue ?? "").trim();
    return advanced ? `noindex,follow,${advanced}` : "noindex,follow";
  }

  const override = String(overrideValue ?? "").trim().toUpperCase();

  const base =
    override === "NOINDEX" || override === "NOINDEX_FOLLOW"
      ? "noindex,follow"
      : override === "NOINDEX_NOFOLLOW"
        ? "noindex,nofollow"
        : override === "INDEX_NOFOLLOW"
          ? "index,nofollow"
          : "index,follow";

  const advanced = String(advancedValue ?? "").trim();
  return advanced ? `${base},${advanced}` : base;
}

function computeCategoryRobots(category: CatalogCategory & { seo?: CatalogSeo }) {
  return computeRobotsBase(
    category?.seo?.robotsOverride,
    category?.seo?.robotsAdvanced,
    Boolean(category.hidden)
  );
}

function computeProductRobots(product: CatalogProduct & { seo?: CatalogSeo }) {
  return computeRobotsBase(
    product?.seo?.robotsOverride,
    product?.seo?.robotsAdvanced
  );
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
  const safeLimit = toBoundedInt(limit, 50, 1, 200);

  return categories
    .filter((item) => item.parent === parent.slug)
    .sort(sortCategories)
    .slice(0, safeLimit)
    .map((item) => ({
      slug: categoryPublicSlugOf(item),
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
  const safeLimit = toBoundedInt(limit, 24, 1, 200);

  return getPublishedProducts()
    .filter((product) => {
      const primary = String(product.categorySlug || "").trim();
      if (primary === String(category.slug)) return true;

      const extras = Array.isArray(product.categorySlugs)
        ? product.categorySlugs.map((s) => String(s || "").trim())
        : [];

      return extras.includes(String(category.slug));
    })
    .sort(sortProducts)
    .slice(0, safeLimit)
    .map((product) => ({
      slug: productPublicSlugOf(product),
      path: productPathOf(product),
      title: product.title,
      description: product.description || product.shortDescription || "",
      image: productImageDtoOf(product.image, product.title),
      order: Number.isFinite(product.order)
        ? Number(product.order)
        : DEFAULT_SORT_ORDER,
    }));
}

function stripInlineMarkdown(value: string) {
  return String(value ?? "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBulletCardItem(raw: string): CategoryBulletCardItem | null {
  const normalized = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const boldTitleWithDesc = normalized.match(/^\*\*(.+?)\*\*\s*:\s*(.+)$/);
  if (boldTitleWithDesc) {
    return {
      title: stripInlineMarkdown(boldTitleWithDesc[1]),
      description: stripInlineMarkdown(boldTitleWithDesc[2]),
    };
  }

  const plainTitleWithDesc = normalized.match(/^([^:]{1,160})\s*:\s*(.+)$/);
  if (plainTitleWithDesc) {
    return {
      title: stripInlineMarkdown(plainTitleWithDesc[1]),
      description: stripInlineMarkdown(plainTitleWithDesc[2]),
    };
  }

  return {
    title: "",
    description: stripInlineMarkdown(normalized),
  };
}

function collectRawBulletItemsFromBlocks(blocks: CatalogBlock[]): string[] {
  const fromBulletBlocks = blocks.flatMap((block) =>
    block?.type === "bullets" && Array.isArray(block.items) ? block.items : []
  );

  if (fromBulletBlocks.length) return fromBulletBlocks;

  const rawText = blocks
    .filter(
      (block): block is Extract<CatalogBlock, { type: "text" }> =>
        block?.type === "text" && !block.html && Boolean(block.text)
    )
    .map((block) => String(block.text ?? ""))
    .join("\n");

  if (!rawText.trim()) return [];

  return rawText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim());
}

function getBulletCardItemsFromBlocks(blocks: CatalogBlock[]): CategoryBulletCardItem[] {
  return collectRawBulletItemsFromBlocks(blocks)
    .map(parseBulletCardItem)
    .filter((item): item is CategoryBulletCardItem => Boolean(item));
}

function normalizeCategoryTypeItems(
  value: unknown
): {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
}[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const raw = item as CatalogTypeItem;
      const title = String(raw.title ?? "").trim();
      const description = String(raw.description ?? "").trim();

      if (!title || !description) return null;

      const features = Array.isArray(raw.features)
        ? raw.features.map((feature) => String(feature ?? "").trim()).filter(Boolean)
        : [];

      const idealFor = String(raw.idealFor ?? "").trim();

      return {
        title,
        description,
        ...(features.length ? { features } : {}),
        ...(idealFor ? { idealFor } : {}),
      };
    })
    .filter(
      (
        item
      ): item is {
        title: string;
        description: string;
        features?: string[];
        idealFor?: string;
      } => Boolean(item)
    );
}

function normalizeCategoryFormatsData(
  value: unknown
): {
  intro?: string;
  shapes?: { title: string; description: string }[];
  deliveryFormats?: { title: string; description: string }[];
} | undefined {
  if (!value || typeof value !== "object") return undefined;

  const raw = value as CatalogFormatsData;

  const normalizeItems = (items: unknown) => {
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const record = item as CatalogFormatItem;
        const title = String(record.title ?? "").trim();
        const description = String(record.description ?? "").trim();

        if (!title || !description) return null;

        return { title, description };
      })
      .filter(
        (item): item is { title: string; description: string } => Boolean(item)
      );
  };

  const intro = String(raw.intro ?? "").trim();
  const shapes = normalizeItems(raw.shapes);
  const deliveryFormats = normalizeItems(raw.deliveryFormats);

  if (!intro && !shapes.length && !deliveryFormats.length) return undefined;

  return {
    ...(intro ? { intro } : {}),
    ...(shapes.length ? { shapes } : {}),
    ...(deliveryFormats.length ? { deliveryFormats } : {}),
  };
}



function buildCardGroupsFromBulletItems(
  groupId: string,
  items: CategoryBulletCardItem[],
  options?: {
    groupTitle?: string;
    groupDescription?: string;
    columns?: 2 | 3 | 4;
    metaPrefix?: string;
  }
): CategoryCardGroup[] {
  if (!items.length) return [];

  return [
    {
      id: groupId,
      ...(options?.groupTitle ? { title: options.groupTitle } : {}),
      ...(options?.groupDescription
        ? { description: options.groupDescription }
        : {}),
      columns: options?.columns ?? 2,
      items: items.map((item, index) => ({
        title: item.title || `Elemento ${index + 1}`,
        description: item.description,
        ...(options?.metaPrefix
          ? {
              meta: `${options.metaPrefix} ${String(index + 1).padStart(2, "0")}`,
            }
          : {}),
      })),
    },
  ];
}

type CategorySectionRole =
  | "details"
  | "types"
  | "formats"
  | "finishes"
  | "uses"
  | "default";

function resolveCategorySectionRole(section: {
  key?: string;
  id?: string;
  title?: string;
}): CategorySectionRole {
  const key = normalizeComparableLabel(section.key);
  const id = normalizeComparableLabel(section.id);
  const title = normalizeComparableLabel(section.title);

  if (
    key === "details" ||
    key === "detalle" ||
    key === "detalles" ||
    id === "details" ||
    id === "detalle" ||
    id === "detalles" ||
    title === "detalles" ||
    title === "detalle" ||
    title === "detalles y caracteristicas" ||
    title.startsWith("detalles")
  ) {
    return "details";
  }

  if (
    key === "types" ||
    key === "type" ||
    key === "tipos" ||
    key === "tipo" ||
    title === "tipos" ||
    title === "tipo"
  ) {
    return "types";
  }

  if (
    key === "formats" ||
    key === "format" ||
    key === "formatos" ||
    key === "formato" ||
    title.startsWith("format")
  ) {
    return "formats";
  }

  if (
    key === "finishes" ||
    key === "finish" ||
    key === "acabados" ||
    key === "acabado" ||
    title.startsWith("acab")
  ) {
    return "finishes";
  }

  if (
    key === "uses" ||
    key === "use" ||
    key === "aplicaciones" ||
    key === "aplicacion" ||
    title.startsWith("aplic")
  ) {
    return "uses";
  }

  return "default";
}

function buildCardGroupsFromFormatsData(
  formatsData:
    | {
      intro?: string;
      shapes?: { title: string; description: string }[];
      deliveryFormats?: { title: string; description: string }[];
    }
    | undefined
): CategoryCardGroup[] {
  if (!formatsData) return [];

  const groups: CategoryCardGroup[] = [];

  if (Array.isArray(formatsData.shapes) && formatsData.shapes.length) {
    groups.push({
      id: "shapes",
      title: "Formas disponibles",
      description:
        "Opciones de forma y corte según el tipo de pieza y el uso previsto.",
      items: formatsData.shapes.map((item) => ({
        title: item.title,
        description: item.description,
      })),
      columns: 2,
    });
  }

  if (
    Array.isArray(formatsData.deliveryFormats) &&
    formatsData.deliveryFormats.length
  ) {
    groups.push({
      id: "delivery",
      title: "Formatos y presentación",
      description:
        "Formatos habituales de presentación, suministro o entrega del material.",
      items: formatsData.deliveryFormats.map((item) => ({
        title: item.title,
        description: item.description,
      })),
      columns: 2,
    });
  }

  return groups;
}



function resolveCategorySectionKind(section: {
  role: CategorySectionRole;
  items?: unknown[];
  cardGroups?: unknown[];
}): CategorySectionKind {
  if (section.role === "details") {
    return "details";
  }

  if (
    section.role === "types" &&
    Array.isArray(section.items) &&
    section.items.length > 0
  ) {
    return "types";
  }

  if (
    (section.role === "formats" ||
      section.role === "finishes" ||
      section.role === "uses") &&
    Array.isArray(section.cardGroups) &&
    section.cardGroups.length > 0
  ) {
    return "cards";
  }

  return "default";
}

function getCategorySections(category: CatalogCategory): CategoryDetailSectionItem[] {
  return getMergedCategorySections(category)
    .map((section, index) => {
      const id = String(section?.id || `section-${index + 1}`).trim();
      const key = String(section?.key || "").trim() || undefined;
      const title = String(section?.title || `Sección ${index + 1}`).trim();
      const intro = String(section?.intro || "").trim() || undefined;
      const text = String(section?.body || "").trim();

      const role = resolveCategorySectionRole({ key, id, title });
      const items = normalizeCategoryTypeItems(section?.items);
      const formatsData = normalizeCategoryFormatsData(section?.formatsData);

      const rawBlocks = Array.isArray(section?.blocks)
        ? section.blocks.filter(Boolean)
        : [];

      const fallbackBlocks: CatalogBlock[] = text
        ? [{ type: "text", text, html: false }]
        : intro && (role === "default" || role === "details") && !items.length
          ? [{ type: "text", text: intro, html: false }]
          : [];

      const blocks = rawBlocks.length ? rawBlocks : fallbackBlocks;
      const bulletItems = getBulletCardItemsFromBlocks(blocks);

      let cardGroups: CategoryCardGroup[] = [];

      if (role === "formats") {
        if (formatsData) {
          cardGroups = buildCardGroupsFromFormatsData(formatsData);
        } else if (bulletItems.length) {
          cardGroups = buildCardGroupsFromBulletItems("formats", bulletItems, {
            columns: 2,
          });
        }
      } else if (role === "finishes") {
        cardGroups = buildCardGroupsFromBulletItems("finishes", bulletItems, {
          columns: 2,
          metaPrefix: "Acabado",
        });
      } else if (role === "uses") {
        cardGroups = buildCardGroupsFromBulletItems("uses", bulletItems, {
          columns: 2,
        });
      }

      const kind = resolveCategorySectionKind({
        role,
        items,
        cardGroups,
      });

      const hasContent =
        blocks.length > 0 || items.length > 0 || cardGroups.length > 0;

      if (!id || !title || !hasContent) return null;

      return {
        id,
        ...(key ? { key } : {}),
        kind,
        title,
        ...(intro ? { intro } : {}),
        blocks,
        ...(items.length ? { items } : {}),
        ...(cardGroups.length ? { cardGroups } : {}),
      };
    })
    .filter((section): section is CategoryDetailSectionItem => Boolean(section));
}

function getProductSections(product: CatalogProduct): ProductDetailSectionItem[] {
  return (Array.isArray(product?.sections) ? product.sections : [])
    .map((section, index) => {
      const title = String(section?.title || `Sección ${index + 1}`).trim();
      const body = String(section?.body || "").trim();
      const key = String(section?.key || "").trim();

      const rawBlocks = Array.isArray(section?.blocks)
        ? section.blocks.filter(Boolean)
        : [];

      const fallbackBlocks: CatalogBlock[] = body
        ? [{ type: "text", text: body, html: false }]
        : [];

      const blocks = rawBlocks.length ? rawBlocks : fallbackBlocks;

      const items = Array.isArray(section?.items)
        ? section.items.filter(Boolean)
        : [];

      const hasFormatsData =
        section?.formatsData &&
        typeof section.formatsData === "object";

      const hasContent =
        blocks.length > 0 ||
        items.length > 0 ||
        hasFormatsData;

      return {
        id: String(section?.id || `section-${index + 1}`),
        ...(key ? { key } : {}),
        title,
        blocks,
        ...(body ? { body, text: body } : {}),
        ...(items.length ? { items } : {}),
        ...(hasFormatsData ? { formatsData: section.formatsData } : {}),
      };
    })
    .filter((section) => section.title && (
      section.blocks.length > 0 ||
      Boolean(section.items?.length) ||
      Boolean(section.formatsData)
    ));
}

export function getHomeCategories(limit = 8): HomeCategoryCardItem[] {
  const safeLimit = toBoundedInt(limit, 8, 1, 12);
  const all = getTopLevelPublishedVisibleCategories();

  const featured = all.filter((item) => item.featured);
  const rest = all.filter((item) => !item.featured);

  return [...featured, ...rest].slice(0, safeLimit).map((category) => ({
    id: String(category.id ?? category.slug),
    title: category.title,
    slug: categoryPublicSlugOf(category),
    href: categoryPathOf(category),
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
    slug: productPublicSlugOf(product),
    title: product.title,
    path: productPathOf(product),
    order: Number.isFinite(product.order) ? Number(product.order) : DEFAULT_SORT_ORDER,
    image: productImageDtoOf(product.image, product.title),
  };
}

type GetNavigationCategoriesOptions = {
  includeProducts?: boolean;
  productLimit?: number;
};

export function getNavigationCategories(
  options: GetNavigationCategoriesOptions = {}
): NavCategoryItem[] {
  const includeProducts = options.includeProducts ?? true;
  const safeProductLimit = toBoundedInt(options.productLimit, 8, 0, 12);

  const allCategories = getPublishedVisibleCategories();
  const allProducts = getPublishedProducts();

  const categoryByInternalSlug = new Map(
    allCategories.map((category) => [String(category.slug), category] as const)
  );

  const previewProductsByCategory = new Map<string, NavProductItem[]>();
  const productCountByCategory = new Map<string, number>();

  if (includeProducts) {
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
  }

  const nodes = new Map<string, NavCategoryItem>();

  for (const category of allCategories) {
    const parentCategory = category.parent
      ? categoryByInternalSlug.get(String(category.parent))
      : null;

    nodes.set(category.slug, {
      id: String(category.id ?? category.slug),
      slug: categoryPublicSlugOf(category),
      title: category.title,
      nav: category.nav || category.title,
      path: categoryPathOf(category),
      parent: parentCategory ? categoryPublicSlugOf(parentCategory) : null,
      order: Number.isFinite(category.order) ? Number(category.order) : DEFAULT_SORT_ORDER,
      children: [],
      products: includeProducts
        ? previewProductsByCategory.get(category.slug) ?? []
        : [],
      productCount: includeProducts
        ? productCountByCategory.get(category.slug) ?? 0
        : 0,
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

function resolveCategoryByPathOrSlug(
  requestedPathOrSlug: string,
  categories: CatalogCategory[]
): { category: CatalogCategory | null; redirectTo?: string } {
  const raw = String(requestedPathOrSlug || "").trim();
  if (!raw) return { category: null };

  const requestedPath = normalizeCategoryPath(raw);
  const requestedSlug = getLastPathSegment(raw);
  const requestedRawSlug = normalizeSlug(raw);

  const category =
    categories.find((item) => {
      const keys = getCategoryLookupKeys(item);
      return (
        keys.has(requestedPath) ||
        keys.has(requestedSlug) ||
        keys.has(requestedRawSlug)
      );
    }) || null;

  if (!category) return { category: null };

  const canonicalPath = categoryPathOf(category);
  const redirectTo = requestedPath !== canonicalPath ? canonicalPath : undefined;

  return { category, ...(redirectTo ? { redirectTo } : {}) };
}

function getCategoryHowWeWork(
  category: CatalogCategory
): CategoryHowWeWorkDto | null {
  const dedicated = parseCategoryHowWeWork(category.howWeWork);
  if (dedicated) return dedicated;

  const legacyBody = String(category.bodyMd ?? "").trim();
  if (!legacyBody.startsWith("{")) return null;

  return parseCategoryHowWeWork(legacyBody);
}

export function getCategoryDetailByPath(
  requestedPathOrSlug: string,
  options: {
    productLimit?: number;
    childLimit?: number;
  } = {}
): CategoryDetailPageDto | null {
  const categories = getPublishedVisibleCategories();
  const resolved = resolveCategoryByPathOrSlug(requestedPathOrSlug, categories);
  const category = resolved.category;

  if (!category) return null;

  const canonicalPath = categoryPathOf(category);
  const trail = buildCategoryTrail(category, categories);

  return {
    slug: categoryPublicSlugOf(category),
    path: canonicalPath,
    title: category.title,
    nav: category.nav || category.title,
    description: category.description || "",
    bodyMd: category.bodyMd || "",
    howWeWork: getCategoryHowWeWork(category),
    image: imageDtoOf(category.image, category.title),
    children: getDirectChildrenOf(category, categories, options.childLimit ?? 50),
    products: getDirectProductsOfCategory(category, options.productLimit ?? 24),
    sections: getCategorySections(category),
    faqs: getCategoryFaqs(category),
    detailGallery: getCategoryDetailGalleryBySlug(categoryPublicSlugOf(category)),
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
      title:
        category?.seo?.metaTitle ||
        category?.seo?.title ||
        `${category.title} | Reprodisseny`,
      description:
        category?.seo?.metaDescription ||
        category?.seo?.description ||
        category?.description ||
        "",
      canonical: category?.seo?.canonical || canonicalPath,
      image: category?.seo?.ogImageSrc || category.image?.src || undefined,
      robots: computeCategoryRobots(category),
    },
    ...(resolved.redirectTo ? { redirectTo: resolved.redirectTo } : {}),
  };
}

function getCategoryBySlug(slug: string) {
  return (
    getPublishedVisibleCategories().find(
      (item) => String(item.slug) === String(slug)
    ) || null
  );
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

function parseCategoryHowWeWork(value: unknown): CategoryHowWeWorkDto | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const steps = Array.isArray(parsed.steps)
      ? parsed.steps
        .map((step) => {
          const item = step as Record<string, unknown>;
          const title = String(item.title ?? "").trim();
          const description = String(item.description ?? "").trim();
          const label = String(item.label ?? "").trim();

          if (!title || !description) return null;

          return {
            ...(label ? { label } : {}),
            title,
            description,
          };
        })
        .filter(Boolean) as CategoryHowWeWorkStepItem[]
      : [];

    const ctaRaw =
      parsed.cta && typeof parsed.cta === "object"
        ? (parsed.cta as Record<string, unknown>)
        : null;

    const cta =
      ctaRaw &&
        (String(ctaRaw.title ?? "").trim() ||
          String(ctaRaw.description ?? "").trim() ||
          String(ctaRaw.buttonLabel ?? "").trim() ||
          String(ctaRaw.href ?? "").trim())
        ? {
          title: String(ctaRaw.title ?? "").trim(),
          ...(String(ctaRaw.description ?? "").trim()
            ? { description: String(ctaRaw.description).trim() }
            : {}),
          ...(String(ctaRaw.buttonLabel ?? "").trim()
            ? { buttonLabel: String(ctaRaw.buttonLabel).trim() }
            : {}),
          ...(String(ctaRaw.href ?? "").trim()
            ? { href: String(ctaRaw.href).trim() }
            : {}),
        }
        : null;

    if (!steps.length) return null;

    return {
      ...(String(parsed.id ?? "").trim() ? { id: String(parsed.id).trim() } : {}),
      ...(String(parsed.key ?? "").trim() ? { key: String(parsed.key).trim() } : {}),
      ...(String(parsed.title ?? "").trim()
        ? { title: String(parsed.title).trim() }
        : {}),
      ...(String(parsed.description ?? "").trim()
        ? { description: String(parsed.description).trim() }
        : {}),
      steps,
      cta,
    };
  } catch {
    return null;
  }
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
      const primary = String(product.categorySlug || "").trim();
      if (allowedSlugs.has(primary)) return true;

      const extras = Array.isArray(product.categorySlugs)
        ? product.categorySlugs.map((s) => String(s || "").trim())
        : [];

      return extras.some((s) => allowedSlugs.has(s));
    })
    .map((product) => ({
      id: String(product.id ?? product.slug),
      slug: productPublicSlugOf(product),
      path: productPathOf(product),
      title: product.title,
      description: product.description || product.shortDescription || "",
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

function resolveProductBySlugOrPath(
  requestedSlugOrPath: string,
  products: CatalogProduct[]
): { product: CatalogProduct | null; redirectTo?: string } {
  const raw = String(requestedSlugOrPath || "").trim();
  if (!raw) return { product: null };

  const requestedPath = normalizeProductPath(raw);
  const requestedSlug = getLastPathSegment(raw);
  const requestedRawSlug = normalizeSlug(raw);

  const product =
    products.find((item) => {
      const keys = getProductLookupKeys(item);
      return (
        keys.has(requestedPath) ||
        keys.has(requestedSlug) ||
        keys.has(requestedRawSlug)
      );
    }) || null;

  if (!product) return { product: null };

  const canonicalPath = productPathOf(product);
  const redirectTo = requestedPath !== canonicalPath ? canonicalPath : undefined;

  return { product, ...(redirectTo ? { redirectTo } : {}) };
}

export function getProductDetailBySlug(
  requestedSlugOrPath: string
): ProductDetailDto | null {
  const products = getPublishedProducts();
  const resolved = resolveProductBySlugOrPath(requestedSlugOrPath, products);
  const product = resolved.product;

  if (!product) return null;

  const canonicalPath = productPathOf(product);

  const parentCategory = product.categorySlug
    ? getCategoryBySlug(String(product.categorySlug))
    : null;

  const categoryTrail = parentCategory
    ? buildCategoryTrail(parentCategory, getPublishedVisibleCategories())
    : [];

  const hreflang = Array.isArray(product?.seo?.hreflang)
    ? product.seo.hreflang
      .filter((item): item is ProductDetailHreflangItem => Boolean(item?.lang && item?.url))
      .map((item) => ({
        lang: String(item.lang),
        url: String(item.url),
      }))
    : [];

  const formFields = Array.isArray(product.formFields)
    ? product.formFields.map((field) => ({
      label: String(field?.label || ""),
      name: String(field?.name || ""),
      type: String(field?.type || "text"),
      required: Boolean(field?.required),
      options: Array.isArray(field?.options)
        ? field.options.map((opt) => String(opt))
        : [],
      readonly: Boolean(field?.readonly),
      placeholder: field?.placeholder ? String(field.placeholder) : undefined,
      helpText: field?.helpText ? String(field.helpText) : undefined,
    }))
    : [];
    const sections = getProductSections(product);

console.log("[PRODUCT DETAIL]", {
  slug: product.slug,
  title: product.title,
  rawSections: product.sections?.length ?? 0,
  mappedSections: sections.length,
  sectionKeys: sections.map((section) => ({
    id: section.id,
    key: section.key,
    title: section.title,
    blocks: section.blocks?.length ?? 0,
    items: section.items?.length ?? 0,
    hasFormatsData: Boolean(section.formatsData),
  })),
});
  return {
    slug: productPublicSlugOf(product),
    path: canonicalPath,
    title: product.title,
    shortDescription: product.shortDescription || "",
    description: product.description || product.shortDescription || "",
    bodyMd: product.bodyMd || "",
    sections: getProductSections(product),
    faqs: getProductFaqs(product),
    image: productImageDtoOf(product.image, product.title),
    category: parentCategory
      ? {
        slug: categoryPublicSlugOf(parentCategory),
        path: categoryPathOf(parentCategory),
        title: parentCategory.title,
        nav: parentCategory.nav || parentCategory.title,
      }
      : null,
    formFields,
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
      title:
        product?.seo?.metaTitle ||
        product?.seo?.title ||
        `${product.title} | Reprodisseny`,
      description:
        product?.seo?.metaDescription ||
        product?.seo?.description ||
        product.shortDescription ||
        product.description ||
        "",
      canonical: product?.seo?.canonical || canonicalPath,
      image: product?.seo?.ogImageSrc || product.image?.src || undefined,
      robots: computeProductRobots(product),
      hreflang,
      schema: product?.seo?.schema,
    },
    ...(resolved.redirectTo ? { redirectTo: resolved.redirectTo } : {}),
  };
}