import defaultProductDetailsMediaManifest from "../cms/product-details-media.json";

export type ProductDetailsImage = {
  src: string;
  alt?: string;
  caption?: string;
  width?: number | null;
  height?: number | null;
};

type ProductDetailsMediaField = "productDetailsMedia" | "ProductDetailsMedia";
type LegacyDetailsImageField =
  | "detailsImage"
  | "detailsImageSrc"
  | "DetailImage"
  | "DetailImageSrc"
  | "detailsMedia";
type DetailsImageField = ProductDetailsMediaField | LegacyDetailsImageField;

export type ProductDetailsImageSource = Partial<Record<DetailsImageField, unknown>> & {
  slug?: unknown;
  title?: unknown;
  imageSrc?: unknown;
  image?: { src?: unknown } | null;
};

type ProductDetailsMediaManifestEntry = {
  productSlug?: unknown;
  categoryPath?: unknown;
  blobPath?: unknown;
  mediaPath?: unknown;
  filename?: unknown;
  order?: unknown;
};

type ProductDetailsMediaManifest = {
  products?: Record<string, ProductDetailsMediaManifestEntry[]>;
};

export const PRODUCT_DETAILS_IMAGE_SLUGS = [
  "etiquetas-colgantes",
  "flyers-personalizados",
  "folletos-plegados-personalizados",
  "invitaciones-y-tarjetones-personalizados",
  "posters-personalizados",
  "puntos-de-libro-personalizados",
  "stoppers-lineal-personalizados",
  "tarjetas-rasca",
  "tarjetas-pvc-personalizadas",
  "tiras-de-lineal-personalizadas",
] as const;

const DEFAULT_PRODUCT_DETAILS_MEDIA_MANIFEST =
  defaultProductDetailsMediaManifest as ProductDetailsMediaManifest;
const LEGACY_DETAILS_SLUGS = new Set<string>(PRODUCT_DETAILS_IMAGE_SLUGS);
const PRODUCT_DETAILS_MEDIA_FIELDS: ProductDetailsMediaField[] = [
  "productDetailsMedia",
  "ProductDetailsMedia",
];
const LEGACY_DETAIL_FIELDS: LegacyDetailsImageField[] = [
  "detailsImage",
  "detailsImageSrc",
  "DetailImage",
  "DetailImageSrc",
  "detailsMedia",
];
const MEDIA_ORIGINS = new Set([
  "https://media.reprodisseny.com",
  "https://webcms.blob.core.windows.net",
]);
const PRODUCT_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE_EXTENSION_RE = /\.[a-z0-9]+$/i;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function decodePath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeProductDetailsImageSlug(value: unknown): string {
  const slug = text(value);
  if (!slug || /[\\/?#:]/.test(slug) || slug.includes("..")) return "";
  return PRODUCT_SLUG_RE.test(slug) ? slug : "";
}

function getManifestEntries(
  productSlug: unknown,
  manifest: ProductDetailsMediaManifest = DEFAULT_PRODUCT_DETAILS_MEDIA_MANIFEST
): ProductDetailsMediaManifestEntry[] {
  const slug = normalizeProductDetailsImageSlug(productSlug);
  if (!slug) return [];

  const entries = manifest.products?.[slug];
  return Array.isArray(entries) ? entries : [];
}

export function hasProductDetailsImage(
  productSlug: unknown,
  manifest: ProductDetailsMediaManifest = DEFAULT_PRODUCT_DETAILS_MEDIA_MANIFEST
): boolean {
  const slug = normalizeProductDetailsImageSlug(productSlug);
  return Boolean(
    slug && (getManifestEntries(slug, manifest).length || LEGACY_DETAILS_SLUGS.has(slug))
  );
}

function normalizeMediaPathname(value: unknown): string {
  const raw = text(value);
  if (!raw || raw.includes("\\")) return "";

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return MEDIA_ORIGINS.has(url.origin) ? decodePath(url.pathname) : "";
    } catch {
      return "";
    }
  }

  const pathname = decodePath(raw.split(/[?#]/, 1)[0] || "").replace(/^\.?\//, "/");
  if (pathname.startsWith("/media/")) return pathname;
  return pathname.startsWith("media/") ? `/${pathname}` : "";
}

function getProductMediaDirectory(imageSrc: unknown): string {
  const pathname = normalizeMediaPathname(imageSrc)
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");
  if (!pathname.startsWith("/media/product/")) return "";

  const lastSlash = pathname.lastIndexOf("/");
  const filename = pathname.slice(lastSlash + 1);
  if (lastSlash <= "/media/product".length || !FILE_EXTENSION_RE.test(filename)) return "";

  return pathname.slice(0, lastSlash);
}

export function deriveProductDetailsImageSrc({
  slug: rawSlug,
  imageSrc,
}: {
  slug?: unknown;
  imageSrc?: unknown;
}): string {
  const slug = normalizeProductDetailsImageSlug(rawSlug);
  if (!slug || !LEGACY_DETAILS_SLUGS.has(slug)) return "";

  const directory = getProductMediaDirectory(imageSrc);
  return directory ? `${directory}/details/${slug}/${slug}.webp` : "";
}

function readDetailsImageSource(value: unknown): ProductDetailsImage | null {
  if (typeof value === "string") {
    const src = text(value);
    return src ? { src } : null;
  }

  const record = asRecord(value);
  const nestedImage = asRecord(record?.image);
  const src = text(
    record?.src ||
      record?.url ||
      record?.imageSrc ||
      record?.detailImageSrc ||
      nestedImage?.src ||
      nestedImage?.url ||
      nestedImage?.imageSrc ||
      nestedImage?.detailImageSrc
  );
  if (!src) return null;

  const alt = text(record?.alt || nestedImage?.alt);
  const caption = text(record?.caption || nestedImage?.caption);
  return {
    src,
    ...(alt ? { alt } : {}),
    ...(caption ? { caption } : {}),
    width: typeof record?.width === "number" ? record.width : null,
    height: typeof record?.height === "number" ? record.height : null,
  };
}

function readDetailsImageSources(value: unknown): ProductDetailsImage[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => readDetailsImageSource(item))
      .filter((item): item is ProductDetailsImage => Boolean(item?.src));
  }

  const direct = readDetailsImageSource(value);
  if (direct?.src) return [direct];

  const record = asRecord(value);
  if (!record) return [];

  for (const key of ["images", "items", "media"] as const) {
    const images = readDetailsImageSources(record[key]);
    if (images.length) return images;
  }

  return [];
}

function getExplicitImagesFromFields(
  product: ProductDetailsImageSource,
  fields: DetailsImageField[]
): ProductDetailsImage[] {
  for (const field of fields) {
    const images = readDetailsImageSources(product[field]);
    if (images.length) return images;
  }
  return [];
}

export function getExplicitProductDetailsImages(
  product: ProductDetailsImageSource
): ProductDetailsImage[] {
  return [
    ...getExplicitImagesFromFields(product, PRODUCT_DETAILS_MEDIA_FIELDS),
    ...getExplicitImagesFromFields(product, LEGACY_DETAIL_FIELDS),
  ];
}

export function getExplicitProductDetailsImage(
  product: ProductDetailsImageSource
): ProductDetailsImage | null {
  return getExplicitProductDetailsImages(product)[0] || null;
}

function getManifestProductDetailsImages(
  product: ProductDetailsImageSource,
  manifest: ProductDetailsMediaManifest = DEFAULT_PRODUCT_DETAILS_MEDIA_MANIFEST
): ProductDetailsImage[] {
  return getManifestEntries(product.slug, manifest)
    .map((entry) => ({
      src: text(entry.mediaPath) || (text(entry.blobPath) ? `/media/${text(entry.blobPath)}` : ""),
    }))
    .filter((image): image is ProductDetailsImage => Boolean(image.src));
}

function withProductDetailsImageDefaults(
  image: ProductDetailsImage,
  title: string
): ProductDetailsImage {
  return {
    ...image,
    alt: image.alt || (title ? `Detalle de ${title}` : "Detalle del producto"),
    caption: image.caption || undefined,
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

export function resolveProductDetailsImages(
  product: ProductDetailsImageSource,
  manifest: ProductDetailsMediaManifest = DEFAULT_PRODUCT_DETAILS_MEDIA_MANIFEST
): ProductDetailsImage[] {
  const title = text(product.title);
  const productDetailsMedia = getExplicitImagesFromFields(
    product,
    PRODUCT_DETAILS_MEDIA_FIELDS
  );

  if (productDetailsMedia.length) {
    return productDetailsMedia.map((image) => withProductDetailsImageDefaults(image, title));
  }

  const manifestImages = getManifestProductDetailsImages(product, manifest);
  if (manifestImages.length) {
    return manifestImages.map((image) => withProductDetailsImageDefaults(image, title));
  }

  const legacyExplicit = getExplicitImagesFromFields(product, LEGACY_DETAIL_FIELDS);
  if (legacyExplicit.length) {
    return legacyExplicit.map((image) => withProductDetailsImageDefaults(image, title));
  }

  const legacySrc = deriveProductDetailsImageSrc({
    slug: product.slug,
    imageSrc: product.image?.src || product.imageSrc,
  });

  return legacySrc ? [withProductDetailsImageDefaults({ src: legacySrc }, title)] : [];
}

export function resolveProductDetailsImage(
  product: ProductDetailsImageSource,
  manifest: ProductDetailsMediaManifest = DEFAULT_PRODUCT_DETAILS_MEDIA_MANIFEST
): ProductDetailsImage | null {
  return resolveProductDetailsImages(product, manifest)[0] || null;
}
