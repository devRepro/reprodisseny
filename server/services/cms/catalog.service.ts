import catalog from "~/cms/catalog.json";
import { normalizeCmsMediaSrc } from "~/utils/cmsMedia";

import {
  getCategoryDetailGalleryBySlug,
  type CategoryDetailMediaItemDto,
} from "./category-detail-gallery-registry";

export type CatalogContentFormat = "markdown" | "json";

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

type CatalogGalleryImage = {
  src?: string | null;
  url?: string | null;
  imageSrc?: string | null;
  alt?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
};

type CatalogTypeItem = {
  title?: string;
  description?: string;
  features?: string[];
  idealFor?: string;
};

type CatalogNamedContentItem = {
  title?: string;
  description?: string;
  text?: string;
  features?: unknown[];
  tags?: unknown[];
  idealFor?: unknown;
  meta?: unknown;
};

type CatalogFormatItem = CatalogNamedContentItem;

type NormalizedNamedContentItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};


type CatalogMaterialsData = {
  intro?: string;
  materials?: CatalogNamedContentItem[];
};

type CatalogBenefitsData = {
  intro?: string;
  benefits?: CatalogNamedContentItem[];
};

type CatalogApplicationsData = {
  intro?: string;
  applications?: CatalogNamedContentItem[];
};


type NormalizedMaterialsData = {
  intro?: string;
  materials: NormalizedNamedContentItem[];
};

type NormalizedFinishesData = {
  intro?: string;
  finishes: NormalizedNamedContentItem[];
};

type NormalizedFormatsData = {
  intro?: string;
  shapes?: NormalizedNamedContentItem[];
  deliveryFormats?: NormalizedNamedContentItem[];
};

type NormalizedBenefitsData = {
  intro?: string;
  benefits: NormalizedNamedContentItem[];
};

type NormalizedApplicationsData = {
  intro?: string;
  applications: NormalizedNamedContentItem[];
};

export type CatalogContentSectionKind =
  | "details"
  | "types"
  | "benefits"
  | "materials"
  | "formats"
  | "finishes"
  | "applications"
  | "technical-specs";


  type CatalogSection = {
    id?: string;
    key?: string;
    title?: string;
    kind?: CatalogContentSectionKind;
    contentFormat?: CatalogContentFormat;
    body?: string;
    intro?: string;
    items?: CatalogTypeItem[];
    benefitsData?: CatalogBenefitsData;
    materialsData?: CatalogMaterialsData;
    formatsData?: CatalogFormatsData;
    finishesData?: CatalogFinishesData;
    applicationsData?: CatalogApplicationsData;
  };
  
  type CatalogProductSection = CatalogSection;

type CatalogFinishesData = {
  intro?: string;
  finishes?: CatalogNamedContentItem[];
};

type CatalogFormatsData = {
  intro?: string;
  shapes?: CatalogFormatItem[];
  deliveryFormats?: CatalogFormatItem[];
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

  detailsMd?: string;
  benefitsMd?: string;
  materialsMd?: string;
  formatsMd?: string;
  finishesMd?: string;
  technicalSpecsMd?: string;
  applicationsMd?: string;

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
  galleryImages?: CatalogGalleryImage[];
  gallery?: CatalogGalleryImage[];
  images?: CatalogGalleryImage[];
  media?: CatalogGalleryImage[];
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
  formatsMd?: string;
  typesMd?: string;
  usesMd?: string;
  finishesMd?: string;
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
  kind: CatalogContentSectionKind;
  contentFormat: CatalogContentFormat;
  title: string;
  intro?: string;
  body?: string;
  items?: NormalizedNamedContentItem[];
  benefitsData?: NormalizedBenefitsData;
  materialsData?: NormalizedMaterialsData;
  formatsData?: NormalizedFormatsData;
  finishesData?: NormalizedFinishesData;
  applicationsData?: NormalizedApplicationsData;
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
  kind: CatalogContentSectionKind;
  contentFormat: CatalogContentFormat;
  title: string;
  intro?: string;
  body?: string;
  text?: string;
  items?: NormalizedNamedContentItem[];
  benefitsData?: NormalizedBenefitsData;
  materialsData?: NormalizedMaterialsData;
  formatsData?: NormalizedFormatsData;
  finishesData?: NormalizedFinishesData;
  applicationsData?: NormalizedApplicationsData;
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
  sections: ProductDetailSectionItem[];
  faqs: ProductDetailFaqItem[];
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  imageSrc?: string | null;
galleryImages: ProductDetailGalleryImageItem[];
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

function safeParseJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  const raw = String(value ?? "").trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function normalizeNamedContentItems(value: unknown): NormalizedNamedContentItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as CatalogNamedContentItem;

      const title = String(record.title ?? "").trim();
      const description = String(record.description ?? record.text ?? "").trim();

      if (!title || !description) return null;

      const rawFeatures = Array.isArray(record.features)
        ? record.features
        : Array.isArray(record.tags)
          ? record.tags
          : [];

      const features = rawFeatures
        .map((feature) => String(feature ?? "").trim())
        .filter(Boolean);

      const idealFor = String(record.idealFor ?? record.meta ?? "").trim();

      return {
        title,
        description,
        ...(features.length ? { features } : {}),
        ...(idealFor ? { idealFor } : {}),
      };
    })
    .filter((item): item is NormalizedNamedContentItem => Boolean(item));
}

function normalizeMaterialsData(value: unknown): NormalizedMaterialsData | undefined {
  const raw = safeParseJsonObject(value);
  if (!raw) return undefined;

  const intro = String(raw.intro ?? "").trim();
  const materials = normalizeNamedContentItems(raw.materials);

  if (!materials.length) return undefined;

  return {
    ...(intro ? { intro } : {}),
    materials,
  };
}

function normalizeFinishesData(value: unknown): NormalizedFinishesData | undefined {
  const raw = safeParseJsonObject(value);
  if (!raw) return undefined;

  const intro = String(raw.intro ?? "").trim();
  const finishes = normalizeNamedContentItems(raw.finishes);

  if (!finishes.length) return undefined;

  return {
    ...(intro ? { intro } : {}),
    finishes,
  };
}

function normalizeFormatsData(value: unknown): NormalizedFormatsData | undefined {
  const raw = safeParseJsonObject(value);
  if (!raw) return undefined;

  const intro = String(raw.intro ?? "").trim();
  const shapes = normalizeNamedContentItems(raw.shapes);
  const deliveryFormats = normalizeNamedContentItems(raw.deliveryFormats);

  if (!intro && !shapes.length && !deliveryFormats.length) return undefined;

  return {
    ...(intro ? { intro } : {}),
    ...(shapes.length ? { shapes } : {}),
    ...(deliveryFormats.length ? { deliveryFormats } : {}),
  };
}

function normalizeBenefitsData(value: unknown): NormalizedBenefitsData | undefined {
  const raw = safeParseJsonObject(value);
  if (!raw) return undefined;

  const intro = String(raw.intro ?? "").trim();
  const benefits = normalizeNamedContentItems(raw.benefits);

  if (!benefits.length) return undefined;

  return {
    ...(intro ? { intro } : {}),
    benefits,
  };
}

function normalizeApplicationsData(
  value: unknown
): NormalizedApplicationsData | undefined {
  const raw = safeParseJsonObject(value);
  if (!raw) return undefined;

  const intro = String(raw.intro ?? "").trim();
  const applications = normalizeNamedContentItems(raw.applications);

  if (!applications.length) return undefined;

  return {
    ...(intro ? { intro } : {}),
    applications,
  };
}

function normalizeSlug(value: unknown) {
  return normalizeComparable(value).replace(/^\/+|\/+$/g, "");
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
  key: CatalogContentSectionKind,
  title: string,
  body: unknown
): CatalogSection | null {
  const text = String(body ?? "").trim();
  if (!text) return null;

  return {
    id: key,
    key,
    title,
    kind: key,
    contentFormat: "markdown",
    body: text,
  };
}

function createCategoryFormatsSection(body: unknown): CatalogSection | null {
  const formatsData = normalizeFormatsData(body)

  if (formatsData) {
    return {
      id: "formats",
      key: "formats",
      title: "Formatos y soportes",
      kind: "formats",
      contentFormat: "json",
      formatsData,
    }
  }

  return createCategoryTextSection("formats", "Formatos y soportes", body)
}

function createCategoryFinishesSection(body: unknown): CatalogSection | null {
  const finishesData = normalizeFinishesData(body)

  if (finishesData) {
    return {
      id: "finishes",
      key: "finishes",
      title: "Acabados",
      kind: "finishes",
      contentFormat: "json",
      finishesData,
    }
  }

  return createCategoryTextSection("finishes", "Acabados", body)
}

function createCategoryApplicationsSection(
  body: unknown
): CatalogSection | null {
  const applicationsData = normalizeApplicationsData(body)

  if (applicationsData) {
    return {
      id: "applications",
      key: "applications",
      title: "Aplicaciones",
      kind: "applications",
      contentFormat: "json",
      applicationsData,
    }
  }

  return createCategoryTextSection("applications", "Aplicaciones", body)
}

function getSectionKey(section: { key?: string; id?: string }) {
  return String(section?.key || section?.id || "")
    .trim()
    .toLowerCase();
}
function getMergedCategorySections(category: CatalogCategory): CatalogSection[] {
  const baseSections = Array.isArray(category.sections)
    ? category.sections.filter(Boolean).filter(hasSectionContent)
    : [];

  const existingKeys = new Set(baseSections.map(getSectionKey));

  const extraSections = [
    createCategoryTextSection("details", "Detalles", category.detailsMd),
    createCategoryTextSection("types", "Tipos", category.typesMd),
    createCategoryFormatsSection(category.formatsMd),
    createCategoryFinishesSection(category.finishesMd),
    createCategoryApplicationsSection(category.usesMd),
  ].filter((section): section is CatalogSection => {
    if (!section) return false;
    return !existingKeys.has(getSectionKey(section));
  });

  return sortCatalogSections([...baseSections, ...extraSections]);
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


const GALLERY_MEDIA_URL_KEYS = new Set([
  "src",
  "url",
  "imageSrc",
  "thumbnailSrc",
  "thumbSrc",
  "posterSrc",
  "mobileSrc",
  "desktopSrc",
]);

function normalizeGalleryMediaObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeGalleryMediaObject(item)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const out: Record<string, unknown> = { ...record };

  for (const [key, currentValue] of Object.entries(record)) {
    if (typeof currentValue === "string" && GALLERY_MEDIA_URL_KEYS.has(key)) {
      out[key] = normalizeCmsMediaSrc(currentValue);
      continue;
    }

    if (currentValue && typeof currentValue === "object") {
      out[key] = normalizeGalleryMediaObject(currentValue);
    }
  }

  return out as T;
}

function normalizeDetailGalleryItems(
  items: CategoryDetailMediaItemDto[] | undefined
): CategoryDetailMediaItemDto[] {
  return (Array.isArray(items) ? items : []).map((item) =>
    normalizeGalleryMediaObject(item)
  );
}


function imageDtoOf(image: CatalogImage | null | undefined, fallbackAlt: string) {
  const src = normalizeCmsMediaSrc(image?.src);

  if (!src) return null;

  return {
    src,
    alt: String(image?.alt || fallbackAlt || "").trim(),
    width: image?.width,
    height: image?.height,
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
  const src = normalizeCmsMediaSrc(image?.src);

  if (!src) return null;

  return {
    src,
    alt: String(image?.alt || fallbackAlt || "").trim(),
    width: image?.width,
    height: image?.height,
  };
}


function toCatalogGalleryArray(value: unknown): CatalogGalleryImage[] {
  return Array.isArray(value) ? (value as CatalogGalleryImage[]) : [];
}

function normalizeProductGalleryImages(
  product: CatalogProduct,
  primaryImageSrc?: string | null
): ProductDetailGalleryImageItem[] {
  const rawItems = [
    ...toCatalogGalleryArray(product.galleryImages),
    ...toCatalogGalleryArray(product.gallery),
    ...toCatalogGalleryArray(product.images),
    ...toCatalogGalleryArray(product.media),
  ];

  const seen = new Set<string>();

  if (primaryImageSrc) {
    seen.add(primaryImageSrc);
  }

  return rawItems
    .map((item) => {
      const src = normalizeCmsMediaSrc(
        item?.src || item?.url || item?.imageSrc || ""
      );

      if (!src || seen.has(src)) {
        return null;
      }

      seen.add(src);

      return {
        src,
        alt: String(item?.alt || product.title || "Producto").trim(),
        ...(String(item?.caption || "").trim()
          ? { caption: String(item.caption).trim() }
          : {}),
        ...(typeof item?.width === "number" ? { width: item.width } : {}),
        ...(typeof item?.height === "number" ? { height: item.height } : {}),
      };
    })
    .filter((item): item is ProductDetailGalleryImageItem => Boolean(item));
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

function isCatalogSectionKind(value: string): value is CatalogContentSectionKind {
  return [
    "details",
    "types",
    "benefits",
    "materials",
    "formats",
    "finishes",
    "applications",
    "technical-specs",
  ].includes(value);
}

function resolveCatalogSectionKind(section: {
  kind?: string;
  key?: string;
  id?: string;
}): CatalogContentSectionKind {
  const kind = String(section.kind || "").trim();

  if (isCatalogSectionKind(kind)) {
    return kind;
  }

  const key = String(section.key || section.id || "").trim();

  if (isCatalogSectionKind(key)) {
    return key;
  }

  return "details";
}

const CATALOG_SECTION_ORDER: Record<CatalogContentSectionKind, number> = {
  details: 10,
  benefits: 20,
  types: 30,
  formats: 40,
  materials: 50,
  finishes: 60,
  applications: 70,
  "technical-specs": 80,
};

function getCatalogSectionOrder(section: {
  kind?: string;
  key?: string;
  id?: string;
}) {
  const raw = String(section.kind || section.key || section.id || "").trim();

  return isCatalogSectionKind(raw)
    ? CATALOG_SECTION_ORDER[raw]
    : 999;
}

function sortCatalogSections<T extends { kind?: string; key?: string; id?: string }>(
  sections: T[]
): T[] {
  return sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => {
      const diff = getCatalogSectionOrder(a.section) - getCatalogSectionOrder(b.section);
      return diff || a.index - b.index;
    })
    .map(({ section }) => section);
}


function createProductTextSection(
  key: CatalogContentSectionKind,
  title: string,
  body: unknown
): CatalogProductSection | null {
  const text = String(body ?? "").trim();
  if (!text) return null;

  return {
    id: key,
    key,
    title,
    kind: key,
    contentFormat: "markdown",
    body: text,
  };
}

function createProductBenefitsSection(
  body: unknown
): CatalogProductSection | null {
  const benefitsData = normalizeBenefitsData(body)

  if (benefitsData) {
    return {
      id: "benefits",
      key: "benefits",
      title: "Beneficios",
      kind: "benefits",
      contentFormat: "json",
      benefitsData,
    }
  }

  return createProductTextSection("benefits", "Beneficios", body)
}

function createProductMaterialsSection(
  body: unknown
): CatalogProductSection | null {
  const materialsData = normalizeMaterialsData(body)

  if (materialsData) {
    return {
      id: "materials",
      key: "materials",
      title: "Materiales",
      kind: "materials",
      contentFormat: "json",
      materialsData,
    }
  }

  return createProductTextSection("materials", "Materiales", body)
}

function createProductFormatsSection(
  body: unknown
): CatalogProductSection | null {
  const formatsData = normalizeFormatsData(body)

  if (formatsData) {
    return {
      id: "formats",
      key: "formats",
      title: "Formatos y soportes",
      kind: "formats",
      contentFormat: "json",
      formatsData,
    }
  }

  return createProductTextSection("formats", "Formatos y soportes", body)
}

function createProductFinishesSection(
  body: unknown
): CatalogProductSection | null {
  const finishesData = normalizeFinishesData(body)

  if (finishesData) {
    return {
      id: "finishes",
      key: "finishes",
      title: "Acabados",
      kind: "finishes",
      contentFormat: "json",
      finishesData,
    }
  }

  return createProductTextSection("finishes", "Acabados", body)
}

function createProductApplicationsSection(
  body: unknown
): CatalogProductSection | null {
  const applicationsData = normalizeApplicationsData(body)

  if (applicationsData) {
    return {
      id: "applications",
      key: "applications",
      title: "Aplicaciones",
      kind: "applications",
      contentFormat: "json",
      applicationsData,
    }
  }

  return createProductTextSection("applications", "Aplicaciones", body)
}

function hasSectionContent(section: CatalogSection | CatalogProductSection) {
  const body = String(section?.body ?? "").trim();
  const intro = String(section?.intro ?? "").trim();

  return Boolean(
    body ||
      intro ||
      (Array.isArray(section.items) && section.items.length > 0) ||
      section.benefitsData ||
      section.materialsData ||
      section.formatsData ||
      section.finishesData ||
      section.applicationsData
  );
}

function getMergedProductSections(product: CatalogProduct): CatalogProductSection[] {
  const baseSections = Array.isArray(product.sections)
    ? product.sections.filter(Boolean).filter(hasSectionContent)
    : [];

  const existingKeys = new Set(baseSections.map(getSectionKey));

  const extraSections = [
    createProductTextSection("details", "Detalles", product.detailsMd || product.bodyMd),
    createProductBenefitsSection(product.benefitsMd),
    createProductMaterialsSection(product.materialsMd),
    createProductFormatsSection(product.formatsMd),
    createProductFinishesSection(product.finishesMd),
    createProductTextSection(
      "technical-specs",
      "Características técnicas",
      product.technicalSpecsMd
    ),
    createProductApplicationsSection(product.applicationsMd),
  ].filter((section): section is CatalogProductSection => {
    if (!section) return false;
    return !existingKeys.has(getSectionKey(section));
  });

  return sortCatalogSections([...baseSections, ...extraSections]);
}

function resolveSectionContentFormat(section: {
  contentFormat?: string;
  items?: unknown;
  benefitsData?: unknown;
  materialsData?: unknown;
  formatsData?: unknown;
  finishesData?: unknown;
  applicationsData?: unknown;
}): CatalogContentFormat {
  if (section.contentFormat === "json" || section.contentFormat === "markdown") {
    return section.contentFormat;
  }

  if (
    section.items ||
    section.benefitsData ||
    section.materialsData ||
    section.formatsData ||
    section.finishesData ||
    section.applicationsData
  ) {
    return "json";
  }

  return "markdown";
}


function getCategorySections(category: CatalogCategory): CategoryDetailSectionItem[] {
  return getMergedCategorySections(category)
    .map<CategoryDetailSectionItem | null>((section, index) => {
      const id = String(section?.id || section?.key || `section-${index + 1}`).trim();
      const key = String(section?.key || id).trim();
      const title = String(section?.title || `Sección ${index + 1}`).trim();
      const intro = String(section?.intro || "").trim() || undefined;
      const body = String(section?.body || "").trim();

      const items = normalizeCategoryTypeItems(section?.items);
      const kind = resolveCatalogSectionKind(section);

      const benefitsData =
        section?.benefitsData && typeof section.benefitsData === "object"
          ? normalizeBenefitsData(section.benefitsData)
          : undefined;

      const materialsData =
        section?.materialsData && typeof section.materialsData === "object"
          ? normalizeMaterialsData(section.materialsData)
          : undefined;

      const formatsData =
        section?.formatsData && typeof section.formatsData === "object"
          ? normalizeFormatsData(section.formatsData)
          : undefined;

      const finishesData =
        section?.finishesData && typeof section.finishesData === "object"
          ? normalizeFinishesData(section.finishesData)
          : undefined;

      const applicationsData =
        section?.applicationsData && typeof section.applicationsData === "object"
          ? normalizeApplicationsData(section.applicationsData)
          : undefined;

      const contentFormat = resolveSectionContentFormat({
        contentFormat: section?.contentFormat,
        items: items.length ? items : undefined,
        benefitsData,
        materialsData,
        formatsData,
        finishesData,
        applicationsData,
      });

      const hasContent =
        Boolean(body) ||
        Boolean(intro) ||
        items.length > 0 ||
        Boolean(benefitsData?.benefits.length) ||
        Boolean(materialsData?.materials.length) ||
        Boolean(formatsData) ||
        Boolean(finishesData?.finishes.length) ||
        Boolean(applicationsData?.applications.length);

      if (!id || !title || !hasContent) return null;

      return {
        id,
        key,
        kind,
        contentFormat,
        title,
        ...(intro ? { intro } : {}),
        ...(body ? { body } : {}),
        ...(items.length ? { items } : {}),
        ...(benefitsData ? { benefitsData } : {}),
        ...(materialsData ? { materialsData } : {}),
        ...(formatsData ? { formatsData } : {}),
        ...(finishesData ? { finishesData } : {}),
        ...(applicationsData ? { applicationsData } : {}),
      };
    })
    .filter((section): section is CategoryDetailSectionItem => section !== null);
}


export function getHomeCategories(limit = 8): HomeCategoryCardItem[] {
  const safeLimit = toBoundedInt(limit, 8, 1, 12);
  const all = getTopLevelPublishedVisibleCategories();

  const featured = all.filter((item) => item.featured);
  const rest = all.filter((item) => !item.featured);

  return [...featured, ...rest].slice(0, safeLimit).map((category) => {
    const image = imageDtoOf(category.image, category.title);

    return {
      id: String(category.id ?? category.slug),
      title: category.title,
      slug: categoryPublicSlugOf(category),
      href: categoryPathOf(category),
      image: image
        ? {
            src: image.src,
            alt: image.alt,
            width: Number(image.width) || FALLBACK_CARD_WIDTH,
            height: Number(image.height) || FALLBACK_CARD_HEIGHT,
          }
        : null,
    };
  });
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
    bodyMd: category.detailsMd || "",
    howWeWork: getCategoryHowWeWork(category),
    image: imageDtoOf(category.image, category.title),
    children: getDirectChildrenOf(category, categories, options.childLimit ?? 50),
    products: getDirectProductsOfCategory(category, options.productLimit ?? 24),
    sections: getCategorySections(category),
    faqs: getCategoryFaqs(category),
    detailGallery: normalizeDetailGalleryItems(
      getCategoryDetailGalleryBySlug(categoryPublicSlugOf(category))
    ),
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
      image:
        normalizeCmsMediaSrc(category?.seo?.ogImageSrc) ||
        normalizeCmsMediaSrc(category.image?.src) ||
        undefined,
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


function getProductSections(product: CatalogProduct): ProductDetailSectionItem[] {
  return getMergedProductSections(product)
    .map<ProductDetailSectionItem | null>((section, index) => {
      const id = String(section?.id || section?.key || `section-${index + 1}`).trim();
      const key = String(section?.key || id).trim();
      const title = String(section?.title || `Sección ${index + 1}`).trim();
      const intro = String(section?.intro || "").trim() || undefined;
      const body = String(section?.body || "").trim();

      const items = normalizeCategoryTypeItems(section?.items);
      const kind = resolveCatalogSectionKind(section);

      const benefitsData =
        section?.benefitsData && typeof section.benefitsData === "object"
          ? normalizeBenefitsData(section.benefitsData)
          : undefined;

      const materialsData =
        section?.materialsData && typeof section.materialsData === "object"
          ? normalizeMaterialsData(section.materialsData)
          : undefined;

      const formatsData =
        section?.formatsData && typeof section.formatsData === "object"
          ? normalizeFormatsData(section.formatsData)
          : undefined;

      const finishesData =
        section?.finishesData && typeof section.finishesData === "object"
          ? normalizeFinishesData(section.finishesData)
          : undefined;

      const applicationsData =
        section?.applicationsData && typeof section.applicationsData === "object"
          ? normalizeApplicationsData(section.applicationsData)
          : undefined;

      const contentFormat = resolveSectionContentFormat({
        contentFormat: section?.contentFormat,
        items: items.length ? items : undefined,
        benefitsData,
        materialsData,
        formatsData,
        finishesData,
        applicationsData,
      });

      const hasContent =
        Boolean(body) ||
        Boolean(intro) ||
        items.length > 0 ||
        Boolean(benefitsData?.benefits.length) ||
        Boolean(materialsData?.materials.length) ||
        Boolean(formatsData) ||
        Boolean(finishesData?.finishes.length) ||
        Boolean(applicationsData?.applications.length);

      if (!id || !title || !hasContent) return null;

      return {
        id,
        key,
        kind,
        contentFormat,
        title,
        ...(intro ? { intro } : {}),
        ...(body ? { body, text: body } : {}),
        ...(items.length ? { items } : {}),
        ...(benefitsData ? { benefitsData } : {}),
        ...(materialsData ? { materialsData } : {}),
        ...(formatsData ? { formatsData } : {}),
        ...(finishesData ? { finishesData } : {}),
        ...(applicationsData ? { applicationsData } : {}),
      };
    })
    .filter((section): section is ProductDetailSectionItem => section !== null);
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
        .filter((item): item is ProductDetailHreflangItem =>
          Boolean(item?.lang && item?.url)
        )
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
  const productImage = productImageDtoOf(product.image, product.title);
  const galleryImages = normalizeProductGalleryImages(product, productImage?.src);

  return {
    slug: productPublicSlugOf(product),
    path: canonicalPath,
    title: product.title,
    shortDescription: product.shortDescription || "",
    description: product.description || product.shortDescription || "",
    sections,
    faqs: getProductFaqs(product),
    image: productImage,
    imageSrc: productImage?.src || null,
    galleryImages,
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
      image:
        normalizeCmsMediaSrc(product?.seo?.ogImageSrc) ||
        normalizeCmsMediaSrc(product.image?.src) ||
        undefined,
      robots: computeProductRobots(product),
      hreflang,
      schema: product?.seo?.schema,
    },
    ...(resolved.redirectTo ? { redirectTo: resolved.redirectTo } : {}),
  };
}