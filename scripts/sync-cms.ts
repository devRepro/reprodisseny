import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";

dotenv.config({ path: ".env.imports", override: true });

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue | undefined };

type GraphItem<T extends Record<string, unknown>> = {
  id?: string | number;
  lastModifiedDateTime?: string;
  fields?: T;
};

type ContentBlock =
  | { type: "text"; text: string; html: boolean; format?: "html" }
  | { type: "bullets"; items: string[]; ordered?: boolean }
  | { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number };


  type ContentTypeItem = {
    title: string;
    description: string;
    features?: string[];
    idealFor?: string;
  }; 

  type ContentFormatItem = {
    title: string;
    description: string;
  };
  
  type ContentFormatsData = {
    intro?: string;
    shapes: ContentFormatItem[];
    deliveryFormats: ContentFormatItem[];
  };

  type ContentSection = {
    id: string;
    key: string;
    title: string;
    body: string;
    blocks: ContentBlock[];
    intro?: string;
    items?: ContentTypeItem[];
    formatsData?: ContentFormatsData;
  };

type ImageDto = {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
};

type SeoDto = {
  metaTitle?: string;
  metaDescription?: string;
  canonical: string;
  hreflang: Array<{ lang: string; url: string }>;
  keywords: string[];
  searchTerms?: string[];
  schema: Record<string, JsonValue | undefined>;
  robotsOverride: string;
  robotsAdvanced?: string;
  ogImageSrc?: string;
};

type CategoryDto = {
  id: string;
  updatedAt?: string;
  type: "categoria" | "subcategoria";
  slug: string;
  path: string;
  title: string;
  nav: string;
  order: number;
  parent?: string;
  hidden: boolean;
  featured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  description?: string;
  bodyMd?: string;
  sections: ContentSection[];
  image: ImageDto;
  faqs: Array<{ question: string; answer: string }>;
  galleryImages: unknown[];
  breadcrumbs: Array<{ name: string; url: string }>;
  legacySlugs: string[];
  seo: SeoDto;
};

type ProductDto = {
  id: string;
  updatedAt?: string;
  type: "producto";
  slug: string;
  path: string;
  title: string;
  categorySlug: string;
  categorySlugs: string[];
  order: number;
  isPublished: boolean;
  publishedAt?: string;
  shortDescription?: string;
  description?: string;
  bodyMd?: string;
  sections: ContentSection[];
  faqs: Array<{ question: string; answer: string }>;
  breadcrumbs: Array<{ name: string; url: string }>;
  image: ImageDto;
  galleryImages: unknown[];
  sku?: string;
  mpn?: string;
  gtin13?: string;
  brand?: string;
  price: number;
  priceCurrency: string;
  inStock: boolean;
  ratingValue?: number;
  reviewCount?: number;
  attributes: unknown[];
  variants: unknown[];
  formFields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options: string[];
    placeholder?: string;
    helpText?: string;
    readonly: boolean;
  }>;
  legacySlugs: string[];
  seo: SeoDto;
};

type SyncCatalog = {
  generatedAt: string;
  categories: CategoryDto[];
  products: ProductDto[];
};

const DEFAULT_SORT_ORDER = 9999;

const SITE_URL = (
  process.env.NUXT_PUBLIC_SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  "https://reprodisseny.com"
)
  .trim()
  .replace(/\/+$/, "");

const BRAND_NAME = "Repro Disseny";

const TENANT_ID = process.env.TENANT_ID || process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID || process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET;

const CMS_SITE_HOSTNAME = process.env.CMS_SITE_HOSTNAME || process.env.SHAREPOINT_HOSTNAME;
const CMS_SITE_PATH = process.env.CMS_SITE_PATH || process.env.SHAREPOINT_SITE_PATH;
const SHAREPOINT_SITE_ID =
  process.env.SHAREPOINT_SITE_ID || process.env.CMS_SITE_ID || process.env.GRAPH_CMS_SITE_ID;

const SP_LIST_CATEGORIES_ID =
  process.env.SP_LIST_CATEGORIES_ID ||
  process.env.CMS_CATEGORIES_LIST_ID ||
  process.env.NUXT_SHAREPOINT_CMS_CATEGORIES_LIST_ID;

const SP_LIST_PRODUCTS_ID =
  process.env.SP_LIST_PRODUCTS_ID ||
  process.env.CMS_PRODUCTS_LIST_ID ||
  process.env.NUXT_SHAREPOINT_CMS_PRODUCTS_LIST_ID;

const REQUIRED_BASE_ENV = [
  ["TENANT_ID", TENANT_ID],
  ["CLIENT_ID", CLIENT_ID],
  ["CLIENT_SECRET", CLIENT_SECRET],
  ["SP_LIST_CATEGORIES_ID", SP_LIST_CATEGORIES_ID],
  ["SP_LIST_PRODUCTS_ID", SP_LIST_PRODUCTS_ID],
].filter(([, value]) => !value);

if (REQUIRED_BASE_ENV.length > 0) {
  console.error(
    "❌ Faltan variables de entorno:",
    REQUIRED_BASE_ENV.map(([name]) => name).join(", "),
  );
  process.exit(1);
}

if (!SHAREPOINT_SITE_ID && (!CMS_SITE_HOSTNAME || !CMS_SITE_PATH)) {
  console.error(
    "❌ Debes definir SHAREPOINT_SITE_ID o, alternativamente, CMS_SITE_HOSTNAME + CMS_SITE_PATH",
  );
  process.exit(1);
}

const warnings: string[] = [];
const warn = (message: string): void => {
  warnings.push(message);
};

const CATEGORY_FIELDS = {
  title: "Title",
  slug: "CategorySlug",
  nav: "NavLabel",
  sortOrder: "SortOrder",
  parentCategory: "ParentCategory",
  isFeatured: "IsFeatured",
  isHidden: "IsHidden",
  isPublished: "IsPublished",
  publishedAt: "PublishedAt",
  path: "Path",
  canonical: "Canonical",
  description: "Description",
  bodyMd: "BodyMd",
  detailsMd: "DetailsMd",
  typesMd: "TypesMd",
  formatsMd: "FormatsMd",
  finishesMd: "FinishesMd",
  usesMd: "UseMd", // <- aquí
  faqsJson: "FaqsJson",
  imageSrc: "ImageSrc",
  imageWidth: "ImageWidth",
  imageHeight: "ImageHeight",
  imageAlt: "ImageAlt",
  galleryImagesJson: "GalleryImagesJson",
  ogImageSrc: "OgImageSrc",
  metaTitle: "MetaTitle",
  metaDescription: "MetaDescription",
  hreflangJson: "HrefLangJson",
  keywordsJson: "KeywordsJson",
  searchTermsJson: "SearchTermsJson",
  schemaJson: "SchemaJson",
  legacySlugsJson: "LegacySlugsJson",
  robotsOverride: "RobotsOverride",
  robotsAdvanced: "RobotsAdvanced",
} as const;


const PRODUCT_FIELDS = {
  title: "Title",
  slug: "ProductSlug",
  categorySlug: "CategorySlug",
  categories: "Categories",
  isFeatured: "IsFeatured",
  isPublished: "IsPublished",
  publishedAt: "PublishedAt",
  sortOrder: "SortOrder",
  path: "Path",
  canonical: "Canonical",
  sku: "Sku",
  mpn: "Mpn",
  gtin13: "Gtin13",
  brand: "Brand",
  price: "Price",
  priceCurrency: "PriceCurrency",
  inStock: "InStock",
  ratingValue: "RatingValue",
  reviewCount: "ReviewCount",
  shortDescription: "ShortDescription",
  bodyMd: "BodyMd",
  detailsMd: "DetailsMd",
  benefitsMd: "BenefitsMd",
  applicationsMd: "ApplicationsMd",
  technicalSpecsMd: "TechnicalSpecsMd",
  materialsMd: "MaterialsMd",
  formatsMd: "FormatsMd",
  finishesMd: "FinishesMd",
  faqsJson: "FaqsJson",
  imageSrc: "ImageSrc",
  imageWidth: "ImageWidth",
  imageHeight: "ImageHeight",
  imageAlt: "ImageAlt",
  galleryImagesJson: "GalleryImagesJson",
  ogImageSrc: "OgImageSrc",
  attributesJson: "AttributesJson",
  variantsJson: "VariantsJson",
  formFieldsJson: "FormFieldsJson",
  metaTitle: "MetaTitle",
  metaDescription: "MetaDescription",
  hreflangJson: "HrefLangJson",
  keywordsJson: "KeywordsJson",
  searchTermsJson: "SearchTermsJson",
  schemaJson: "SchemaJson",
  legacySlugsJson: "LegacySlugsJson",
  noIndex: "NoIndex",
  robotsOverride: "RobotsOverride",
  robotsAdvanced: "RobotsAdvanced",
} as const;

const CATEGORY_SELECT = [...new Set(Object.values(CATEGORY_FIELDS))];
const PRODUCT_SELECT = [...new Set(Object.values(PRODUCT_FIELDS))];

const CATEGORY_SECTION_TITLES: Record<string, string> = {
  details: "Detalles y características",
  types: "Tipos",
  formats: "Formatos y soportes",
  finishes: "Acabados",
  applications: "Aplicaciones",
};

const PRODUCT_SECTION_TITLES: Record<string, string> = {
  details: "Detalles",
  benefits: "Beneficios",
  materials: "Materiales",
  formats: "Formatos y soportes",
  finishes: "Acabados",
  "technical-specs": "Características técnicas",
  applications: "Aplicaciones",
};

const CATEGORY_SECTION_ALIASES: Record<string, keyof typeof CATEGORY_SECTION_TITLES> = {
  detalle: "details",
  detalles: "details",

  tipo: "types",
  tipos: "types",

  formato: "formats",
  formatos: "formats",
  soportes: "formats",
  "formatos-y-soportes": "formats",

  acabado: "finishes",
  acabados: "finishes",

  uso: "applications",
  usos: "applications",
  aplicacion: "applications",
  aplicaciones: "applications",
  "usos-habituales": "applications",
};

const PRODUCT_SECTION_ALIASES: Record<string, keyof typeof PRODUCT_SECTION_TITLES> = {
  detalle: "details",
  detalles: "details",

  
  beneficio: "benefits",
  beneficios: "benefits",

  material: "materials",
  materiales: "materials",

  formato: "formats",
  formatos: "formats",
  soportes: "formats",

  acabado: "finishes",
  acabados: "finishes",

  caracteristicas: "technical-specs",
  "caracteristicas-tecnicas": "technical-specs",
  especificaciones: "technical-specs",
  specs: "technical-specs",

  aplicacion: "applications",
  aplicaciones: "applications",
};

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).replace(/\u00A0/g, " ").trim();
  return text || undefined;
}

function num(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;

  const raw = String(value).trim();
  if (!raw) return undefined;

  const normalized = raw
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(/,(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePositiveInt(value: unknown): number | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const normalized = raw
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(/,(?=\d{3}(?:\D|$))/g, "")
    .replace(/[^\d]/g, "");

  if (!normalized) return undefined;

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseImageDimension(value: unknown): number | undefined {
  const parsed = parsePositiveInt(value);
  return parsed && parsed > 0 ? parsed : undefined;
}

function bool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const raw = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "verdadero", "yes", "si", "sí", "y", "on", "checked"].includes(raw);
}

function parsePrice(value: unknown): number {
  const raw = str(value);
  if (!raw) return 0;

  let normalized = raw.replace(/[^\d,.-]/g, "");
  if (!normalized) return 0;

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized =
      normalized.lastIndexOf(",") > normalized.lastIndexOf(".")
        ? normalized.replace(/\./g, "").replace(",", ".")
        : normalized.replace(/,/g, "");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(/,/g, ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items.filter(Boolean))];
}

function safeLocaleCompare(a: unknown, b: unknown, locale = "es"): number {
  return String(a ?? "").localeCompare(String(b ?? ""), locale);
}

function slugify(input: string): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/-]/g, "")
    .replace(/[\/\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSmartQuotes(value: string): string {
  return value
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function normalizeMarkdown(value: unknown): string {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\/n/g, "\n")
    .replace(/\/r/g, "\r")
    .replace(/([^\n])\s*(#{2,6})([^\s#])/g, "$1\n$2 $3")
    .replace(/(^|\n)(#{2,6})([^\s#])/g, "$1$2 $3")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripMdInline(value: string): string {
  return String(value ?? "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

function extractJsonFragment(value: string): string {
  const match = value.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  return match?.[1] || value;
}

function escapeControlChars(value: string): string {
  return value.replace(/[\u0000-\u0019]/g, (char) => {
    if (char === "\n") return "\\n";
    if (char === "\r") return "\\r";
    if (char === "\t") return "\\t";
    return "";
  });
}


function pickField(fields: Record<string, unknown>, names: string[]): unknown {
  for (const name of names) {
    if (name in fields && fields[name] != null && String(fields[name]).trim() !== "") {
      return fields[name];
    }
  }
  return undefined;
}
function parseJsonLoose<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;

  let text = str(value);
  if (!text) return fallback;

  text = extractJsonFragment(normalizeSmartQuotes(text));

  try {
    return JSON.parse(text) as T;
  } catch {
    try {
      return JSON.parse(escapeControlChars(text)) as T;
    } catch {
      return fallback;
    }
  }
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => str(item))
      .filter((item): item is string => Boolean(item) && !["[]", "{}", "[ ]"].includes(item));
  }

  const raw = str(value);
  if (!raw) return [];

  const normalizedRaw = normalizeSmartQuotes(raw).trim();
  if (["[]", "{}", "[ ]", '[""]', "['']"].includes(normalizedRaw)) return [];

  if (/^\s*\[/.test(normalizedRaw)) {
    const parsed = parseJsonLoose<unknown[]>(normalizedRaw, []);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => str(item))
        .filter((item): item is string => Boolean(item) && !["[]", "{}", "[ ]"].includes(item));
    }
  }

  return normalizedRaw
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter((item) => item && !["[]", "{}", "[ ]"].includes(item));
}

function normalizeKeywordList(value: unknown): string[] {
  return uniq(
    parseStringList(value)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function pathFromUrlLike(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  if (raw.startsWith("/")) return raw.replace(/\/+$/, "") || "/";

  try {
    const url = new URL(raw);
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return undefined;
  }
}

function toAbsoluteUrl(value: unknown, fallbackPath: string): string {
  const raw = str(value);
  if (!raw) return `${SITE_URL}${fallbackPath}`;

  if (raw.startsWith("/")) return `${SITE_URL}${raw.replace(/\/+$/, "") || "/"}`;

  try {
    const url = new URL(raw);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
      return `${SITE_URL}${pathname}`;
    }
    return `${url.origin}${pathname}`;
  } catch {
    return `${SITE_URL}${fallbackPath}`;
  }
}

function normalizePublicPath(
  rawPath: unknown,
  rawCanonical: unknown,
  fallbackPath: string,
  expectedPrefix: "/categorias" | "/productos",
): string {
  const fromPath = pathFromUrlLike(rawPath);
  const fromCanonical = pathFromUrlLike(rawCanonical);
  const candidate = fromPath || fromCanonical || fallbackPath;
  const clean = candidate.replace(/\/+$/, "") || "/";
  return clean.startsWith(expectedPrefix) ? clean : fallbackPath;
}

function sanitizeImageSrc(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const match = raw.match(
    /(https?:\/\/[^\s,]+?\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s,]+)?|\/[^,\s]+?\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s,]+)?)/i,
  );
  const cleaned = match?.[1] || raw.split(",")[0]?.trim() || raw;
  return /^(https?:\/\/|\/)/i.test(cleaned) ? cleaned : undefined;
}

function sanitizeLink(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const clean = raw.split(",")[0]?.trim() || raw;
  if (clean.startsWith("/")) return clean.replace(/\/+$/, "") || "/";

  try {
    const url = new URL(clean);
    if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
      return url.pathname.replace(/\/+$/, "") || "/";
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, "") || "/"}`;
  } catch {
    return clean;
  }
}

function slugFromPath(pathname: string | undefined, prefix: "/categorias" | "/productos"): string | undefined {
  if (!pathname) return undefined;
  const clean = pathname.replace(/\/+$/, "");
  if (!clean.startsWith(prefix)) return undefined;
  const rest = clean.slice(prefix.length).replace(/^\/+/, "");
  return rest.split("/").filter(Boolean).at(-1);
}

function normalizeSlug(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const asPath = pathFromUrlLike(raw) || raw;
  const clean = asPath
    .replace(/^\/+|\/+$/g, "")
    .replace(/^categorias\//i, "")
    .replace(/^productos\//i, "");

  return slugify(clean);
}

function leafSlug(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const asPath = pathFromUrlLike(raw) || raw;
  const clean = asPath
    .replace(/^\/+|\/+$/g, "")
    .replace(/^categorias\//i, "")
    .replace(/^productos\//i, "");

  const leaf = clean.split("/").filter(Boolean).at(-1);
  return leaf ? slugify(leaf) : undefined;
}

function firstSentence(value: string): string | undefined {
  const sentence = normalizeMarkdown(value).match(/^[^.!?]*[.!?]/)?.[0]?.trim();
  return sentence && sentence.length > 10 ? sentence : undefined;
}

function dedupeBreadcrumbs(
  breadcrumbs: Array<{ name: string; url: string }>,
): Array<{ name: string; url: string }> {
  const seen = new Set<string>();
  const result: Array<{ name: string; url: string }> = [];

  for (const breadcrumb of breadcrumbs) {
    const name = str(breadcrumb.name) || "";
    const url = sanitizeLink(breadcrumb.url) || "/";
    if (!name) continue;

    const key = `${name}::${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name, url });
  }

  return result;
}

function looksLikeJsonContainer(value: unknown): boolean {
  const raw = str(value);
  if (!raw) return false;
  const text = normalizeSmartQuotes(raw).trim();
  return (
    (text.startsWith("[") && text.endsWith("]")) ||
    (text.startsWith("{") && text.endsWith("}"))
  );
}

function objectToMarkdown(obj: Record<string, unknown>): string {
  const title = str(obj.title ?? obj.name ?? obj.label ?? obj.heading ?? obj.kicker);
  const text = normalizeMarkdown(obj.text ?? obj.description ?? obj.body ?? obj.content ?? obj.copy ?? "");
  const bullets = Array.isArray(obj.items)
    ? (obj.items.map((item) => str(item)).filter(Boolean) as string[])
    : Array.isArray(obj.bullets)
      ? (obj.bullets.map((item) => str(item)).filter(Boolean) as string[])
      : Array.isArray(obj.points)
        ? (obj.points.map((item) => str(item)).filter(Boolean) as string[])
        : [];

  const nestedArray =
    !text &&
    bullets.length === 0 &&
    Array.isArray(obj.items) &&
    obj.items.some((item) => typeof item === "object" && item !== null)
      ? obj.items
      : null;

  const imageRecord =
    typeof obj.image === "object" && obj.image !== null ? (obj.image as Record<string, unknown>) : undefined;

  const imageSrc = sanitizeImageSrc(obj.src ?? imageRecord?.src);
  const imageAlt = str(obj.alt ?? imageRecord?.alt ?? title ?? "");

  const parts: string[] = [];

  if (title && (text || bullets.length > 0 || imageSrc || nestedArray)) {
    parts.push(`### ${title}`);
  } else if (title && !text && bullets.length === 0 && !nestedArray && !imageSrc) {
    parts.push(title);
  }

  if (text) parts.push(text);

  if (bullets.length > 0) {
    parts.push(bullets.map((item) => `- ${item}`).join("\n"));
  }

  if (nestedArray) {
    const nested = structuredSectionToMarkdown(nestedArray);
    if (nested) parts.push(nested);
  }

  if (imageSrc) {
    parts.push(`![${imageAlt || ""}](${imageSrc})`);
  }

  return parts.join("\n\n").trim();
}

function structuredSectionToMarkdown(value: unknown): string {
  if (typeof value === "string") {
    const raw = normalizeMarkdown(value);
    if (!raw) return "";

    if (!looksLikeJsonContainer(raw)) return raw;

    const parsed = parseJsonLoose<unknown>(raw, null);
    if (parsed == null || typeof parsed === "string") return raw;
    return structuredSectionToMarkdown(parsed);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string") return normalizeMarkdown(item);
        if (typeof item === "object" && item !== null) return objectToMarkdown(item as Record<string, unknown>);
        return "";
      })
      .filter(Boolean);

    return parts.join("\n\n").trim();
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;

    if (
      !str(obj.title ?? obj.name ?? obj.label ?? obj.heading) &&
      !str(obj.text ?? obj.description ?? obj.body ?? obj.content) &&
      Array.isArray(obj.items) &&
      obj.items.every((item) => typeof item === "string" || typeof item === "number")
    ) {
      return (obj.items as unknown[])
        .map((item) => str(item))
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join("\n");
    }

    return objectToMarkdown(obj);
  }

  return "";
}

function buildGraphClient(): Client {
  const credential = new ClientSecretCredential(TENANT_ID!, CLIENT_ID!, CLIENT_SECRET!);

  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken("https://graph.microsoft.com/.default");
        done(null, token?.token ?? null);
      } catch (error) {
        done(error as Error, null);
      }
    },
  });
}

const graph = buildGraphClient();
let siteIdPromise: Promise<string> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGraphError(error: unknown): boolean {
  const statusCode = Number(
    (error as { statusCode?: number; status?: number })?.statusCode ||
      (error as { statusCode?: number; status?: number })?.status ||
      0,
  );
  return [429, 500, 502, 503, 504].includes(statusCode);
}

async function graphGet<T = unknown>(url: string, maxRetries = 4): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await graph.api(url).header("Prefer", "apiversion=2.1").get();
    } catch (error) {
      attempt += 1;
      if (!isRetryableGraphError(error) || attempt > maxRetries) throw error;
      warn(`Graph retry ${attempt}/${maxRetries} para ${url}`);
      await sleep(500 * 2 ** (attempt - 1));
    }
  }
}

async function resolveSiteId(): Promise<string> {
  if (SHAREPOINT_SITE_ID) return SHAREPOINT_SITE_ID;

  if (!siteIdPromise) {
    siteIdPromise = (async () => {
      const safePath = CMS_SITE_PATH!.startsWith("/") ? CMS_SITE_PATH! : `/${CMS_SITE_PATH!}`;
      const site = await graphGet<{ id?: string }>(`/sites/${CMS_SITE_HOSTNAME}:${safePath}`);
      if (!site?.id) {
        throw new Error(`No se pudo resolver el site de SharePoint: ${CMS_SITE_HOSTNAME}${safePath}`);
      }
      return String(site.id);
    })();
  }

  return siteIdPromise;
}

async function fetchAllItems<T extends Record<string, unknown>>(
  listId: string,
  fields: readonly string[],
): Promise<Array<GraphItem<T>>> {
  const siteId = await resolveSiteId();
  const expand = fields.length ? `fields($select=${fields.join(",")})` : "fields";

  const items: Array<GraphItem<T>> = [];
  let next: string | null = `/sites/${siteId}/lists/${listId}/items?$top=999&$expand=${expand}`;

  while (next) {
    const response = await graphGet<{ value?: Array<GraphItem<T>>; "@odata.nextLink"?: string }>(next);
    for (const item of response.value || []) items.push(item);
    next = response["@odata.nextLink"] || null;
  }

  return items;
}

function parseFaqs(value: unknown): Array<{ question: string; answer: string }> {
  const raw = str(value);
  if (!raw) return [];

  let cleaned = normalizeSmartQuotes(raw)
    .replace(/^Preguntas frecuentes\s*/i, "")
    .trim();

  cleaned = extractJsonFragment(cleaned);

  // Intento 1: JSON normal
  let parsed = parseJsonLoose<Array<Record<string, unknown>>>(cleaned, []);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed
      .map((item) => ({
        question: str(item?.question ?? item?.q ?? item?.pregunta ?? item?.title) || "",
        answer: normalizeMarkdown(
          item?.answer ?? item?.a ?? item?.respuesta ?? item?.text ?? ""
        ),
      }))
      .filter((item) => item.question && item.answer);
  }

  // Reparaciones frecuentes del contenido pegado desde SharePoint
  cleaned = cleaned
    // comillas tipográficas -> normales
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // falta de coma entre question y answer
    .replace(/"\s*[\r\n]+\s*"answer"/g, '", "answer"')
    .replace(/"\s*"answer"/g, '", "answer"')
    // falta de coma entre answer y siguiente objeto
    .replace(/"}\s*[\r\n]+\s*{/g, '"}, {')
    .replace(/"}\s*{/g, '"}, {')
    // posibles saltos raros
    .replace(/\r\n/g, "\n")
    .trim();

  // Intento 2: JSON reparado
  parsed = parseJsonLoose<Array<Record<string, unknown>>>(cleaned, []);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed
      .map((item) => ({
        question: str(item?.question ?? item?.q ?? item?.pregunta ?? item?.title) || "",
        answer: normalizeMarkdown(
          item?.answer ?? item?.a ?? item?.respuesta ?? item?.text ?? ""
        ),
      }))
      .filter((item) => item.question && item.answer);
  }

  // Intento 3: rescate por regex
  const results: Array<{ question: string; answer: string }> = [];
  const pairRegex =
    /"question"\s*:\s*"([\s\S]*?)"\s*,?\s*"answer"\s*:\s*"([\s\S]*?)"/gi;

  for (const match of cleaned.matchAll(pairRegex)) {
    const question = str(match[1]) || "";
    const answer = normalizeMarkdown(match[2] || "");
    if (question && answer) results.push({ question, answer });
  }

  return results;
}

function parseFormFields(value: unknown): ProductDto["formFields"] {
  const parsed = parseJsonLoose<Record<string, unknown>[]>(value, []);
  if (!Array.isArray(parsed)) return [];

  const fields = parsed.map((field, index) => {
    const options = Array.isArray(field?.options)
      ? (field.options.map((option: unknown) => str(option)).filter(Boolean) as string[])
      : [];

    return {
      name: str(field?.name || field?.id) || `field_${index + 1}`,
      label: str(field?.label || field?.title) || str(field?.name) || `Campo ${index + 1}`,
      type: (str(field?.type) || "text").toLowerCase(),
      required: bool(field?.required),
      options,
      placeholder: str(field?.placeholder),
      helpText: str(field?.helpText || field?.description),
      readonly:
        bool(field?.readonly ?? field?.readOnly) ||
        (options.length === 1 && (str(field?.type) || "").toLowerCase() === "select"),
    };
  });

  const seen = new Set<string>();
  return fields.filter((field) => {
    const key = field.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canonicalSectionId(value: string, aliases: Record<string, string>): string {
  const normalized = slugify(value);
  return aliases[normalized] || normalized;
}

function splitMarkdownByHeading(
  value: string,
  aliases: Record<string, string>,
  allowedIds: Set<string>,
): { lead: string; extracted: Array<{ id: string; body: string }> } {
  const md = normalizeMarkdown(value);
  if (!md) return { lead: "", extracted: [] };

  const headingRegex = /^#{2,6}\s*(.+?)\s*$/gm;
  const matches = [...md.matchAll(headingRegex)];
  if (matches.length === 0) return { lead: md, extracted: [] };

  const extracted: Array<{ id: string; body: string }> = [];
  const preamble = md.slice(0, matches[0]?.index ?? 0).trim();

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index]!;
    const next = matches[index + 1];
    const title = stripMdInline(current[1] || "");
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? md.length;
    const body = md.slice(start, end).trim();
    const id = canonicalSectionId(title, aliases);

    if (body && allowedIds.has(id)) {
      extracted.push({ id, body });
    }
  }

  return {
    lead: extracted.length > 0 ? preamble : md,
    extracted,
  };
}

function mergeSectionSources(
  entries: Array<{ target: string; value?: string }>,
  aliases: Record<string, string>,
  allowedIds: Set<string>,
): Record<string, string[]> {
  const buckets: Record<string, string[]> = {};

  for (const entry of entries) {
    const normalizedValue = structuredSectionToMarkdown(entry.value);
    if (!normalizedValue) continue;

    const split = splitMarkdownByHeading(normalizedValue, aliases, allowedIds);

    if (split.lead) {
      buckets[entry.target] ||= [];
      buckets[entry.target].push(split.lead);
    }

    for (const chunk of split.extracted) {
      buckets[chunk.id] ||= [];
      buckets[chunk.id].push(chunk.body);
    }
  }

  return buckets;
}

function mdToBlocks(md: string): ContentBlock[] {
  const text = normalizeMarkdown(md);
  if (!text) return [];

  const lines = text.split("\n");
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let ordered = false;

  const flushParagraph = (): void => {
    if (paragraph.length === 0) return;
    const textBlock = paragraph.join("\n").trim();
    if (textBlock) blocks.push({ type: "text", text: textBlock, html: false });
    paragraph = [];
  };

  const flushBullets = (): void => {
    if (bullets.length === 0) return;
    blocks.push({ type: "bullets", items: bullets.map((item) => item.trim()).filter(Boolean), ordered });
    bullets = [];
    ordered = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushBullets();
      continue;
    }

    if (/^!\[.*?\]\((.+?)\)$/.test(trimmed)) {
      const match = trimmed.match(/^!\[(.*?)\]\((.+?)\)$/);
      if (match) {
        flushParagraph();
        flushBullets();
        const src = sanitizeImageSrc(match[2]);
        if (src) blocks.push({ type: "image", src, alt: match[1] || "" });
        continue;
      }
    }

    if (/^##\s+/.test(trimmed) && !/^###/.test(trimmed)) {
      flushParagraph();
      flushBullets();
      const heading = trimmed.replace(/^##\s+/, "").trim();
      blocks.push({ type: "text", text: `<h2>${stripMdInline(heading)}</h2>`, html: true, format: "html" });
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      flushBullets();
      const heading = trimmed.replace(/^###\s+/, "").trim();
      blocks.push({ type: "text", text: `<h3>${stripMdInline(heading)}</h3>`, html: true, format: "html" });
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      if (bullets.length > 0 && !ordered) flushBullets();
      ordered = true;
      bullets.push(trimmed.replace(/^\d+[.)]\s+/, ""));
      continue;
    }

    if (/^[-*•·]\s+/.test(trimmed)) {
      flushParagraph();
      if (bullets.length > 0 && ordered) flushBullets();
      ordered = false;
      bullets.push(trimmed.replace(/^[-*•·]\s+/, ""));
      continue;
    }

    flushBullets();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushBullets();
  return blocks;
}

function extractTypesData(value: unknown): { introMd: string; items: ContentTypeItem[] } {
  const md = normalizeMarkdown(value);
  if (!md) return { introMd: "", items: [] };

  const matches = [...md.matchAll(/^###\s+(.+?)\s*$/gm)];
  if (!matches.length) return { introMd: md, items: [] };

  const items: ContentTypeItem[] = [];
  const introMd = md.slice(0, matches[0].index).trim();

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index]!;
    const next = matches[index + 1];

    const title = stripMdInline(current[1] || "").trim();
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? md.length;

    const description = md
      .slice(start, end)
      .trim()
      .replace(/\n{2,}/g, "\n")
      .replace(/\n/g, " ")
      .trim();

    if (title && description) {
      items.push({ title, description });
    }
  }

  return { introMd, items };
}

function buildCategorySections(
  fields: Record<string, unknown>,
  detailsMd?: string,
  bodyMd?: string,
  description?: string,
): ContentSection[] {
  const editorialSectionEntries: Array<{ target: string; value?: string }> = [
    { target: "details", value: detailsMd || description },
    { target: "finishes", value: str(fields[CATEGORY_FIELDS.finishesMd]) },
    { target: "applications", value: str(fields[CATEGORY_FIELDS.usesMd]) },
  ];

  const editorialSectionOrder = [
    "details",
    "finishes",
    "applications",
  ] as const;

  const fullCategorySectionOrder = [
    "details",
    "types",
    "formats",
    "finishes",
    "applications",
  ] as const;

  const editorialSectionSources = mergeSectionSources(
    editorialSectionEntries,
    CATEGORY_SECTION_ALIASES,
    new Set<string>(editorialSectionOrder),
  );

  const editorialSections = buildSections(
    editorialSectionSources,
    CATEGORY_SECTION_TITLES,
    [...editorialSectionOrder],
  );

  const editorialSectionsById = new Map(
    editorialSections.map((section) => [section.id, section] as const),
  );

  const typeItems = parseTypesMd(fields[CATEGORY_FIELDS.typesMd]);
  const formatsData = parseFormatsMd(fields[CATEGORY_FIELDS.formatsMd]);

  const sections: ContentSection[] = [];

  for (const id of fullCategorySectionOrder) {
    if (id === "types") {
      if (typeItems.length > 0) {
        sections.push({
          id: "types",
          key: "types",
          title: CATEGORY_SECTION_TITLES.types || "Tipos",
          body: "",
          blocks: [],
          items: typeItems,
        });
      }
      continue;
    }

    if (id === "formats") {
      if (formatsData) {
        sections.push({
          id: "formats",
          key: "formats",
          title: CATEGORY_SECTION_TITLES.formats || "Formatos y soportes",
          body: "",
          blocks: [],
          formatsData,
        });
      }
      continue;
    }

    const section = editorialSectionsById.get(id);
    if (section) sections.push(section);
  }

  return sections;
}

function parseFormatsMd(value: unknown): ContentFormatsData | undefined {
  const parsed = parseJsonLoose<Record<string, unknown>>(value, {});
  if (!parsed || typeof parsed !== "object") return undefined;

  const toItems = (input: unknown): ContentFormatItem[] => {
    if (!Array.isArray(input)) return [];

    return input
      .map((item) => {
        const record = (item ?? {}) as Record<string, unknown>;
        return {
          title: str(record.title) || "",
          description: str(record.description) || "",
        };
      })
      .filter((item) => item.title && item.description);
  };

  const intro = str(parsed.intro);
  const shapes = toItems(parsed.shapes);
  const deliveryFormats = toItems(parsed.deliveryFormats);

  if (!intro && !shapes.length && !deliveryFormats.length) return undefined;

  return {
    intro,
    shapes,
    deliveryFormats,
  };
}

function buildSections(
  sources: Record<string, string[]>,
  titles: Record<string, string>,
  order: string[],
  extraContent?: Record<string, { items?: ContentTypeItem[] }>
): ContentSection[] {
  const sections: ContentSection[] = [];

  for (const id of order) {
    const parts = (sources[id] || []).map((part) => normalizeMarkdown(part)).filter(Boolean);
    const body = parts.join("\n\n").trim();
    const blocks = mdToBlocks(body);
    const items = extraContent?.[id]?.items;

    // Crea la sección si tiene bloques normales o si tiene cards estructuradas
    if (blocks.length === 0 && (!items || items.length === 0)) continue;

    const section: ContentSection = { id, key: id, title: titles[id] || id, body, blocks };
    
    if (items && items.length > 0) {
      section.items = items;
    }
    
    sections.push(section);
  }

  return sections;
}

function buildBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
): Record<string, JsonValue | undefined> | undefined {
  if (!breadcrumbs.length) return undefined;

  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: toAbsoluteUrl(breadcrumb.url, breadcrumb.url),
    })),
  };
}

function buildFaqSchema(
  faqs: Array<{ question: string; answer: string }>,
): Record<string, JsonValue | undefined> | undefined {
  if (!faqs.length) return undefined;

  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

function schemaOverrideShape(value: Record<string, JsonValue | undefined>): Record<string, JsonValue | undefined> {
  const override = { ...(value || {}) };
  delete override["@context"];
  delete override["@graph"];
  delete override.url;
  delete override.image;
  delete override.mainEntity;
  delete override.itemListElement;
  delete override.offers;
  delete override.aggregateRating;
  delete override.brand;
  delete override.sku;
  delete override.mpn;
  delete override.gtin13;
  return override;
}

function normalizeHreflang(
  entries: Array<{ lang: string; url: string }> | undefined,
  canonical: string,
): Array<{ lang: string; url: string }> {
  const map = new Map<string, { lang: string; url: string }>();
  const canonicalPath = pathFromUrlLike(canonical) || "/";

  for (const entry of entries || []) {
    const lang = str(entry.lang) || "es-ES";
    const url = toAbsoluteUrl(entry.url, canonicalPath);
    map.set(lang.toLowerCase(), { lang, url });
  }

  map.set("es-es", { lang: "es-ES", url: canonical });
  return [...map.values()];
}

function buildCategorySeo(
  fields: Record<string, unknown>,
  title: string,
  publicPath: string,
  imageSrc?: string,
): SeoDto {
  const canonical = `${SITE_URL}${publicPath}`;
  const metaTitle = str(fields[CATEGORY_FIELDS.metaTitle]) || title;
  const metaDescription =
    str(fields[CATEGORY_FIELDS.metaDescription]) ||
    str(fields[CATEGORY_FIELDS.description]) ||
    firstSentence(str(fields[CATEGORY_FIELDS.detailsMd]) || "") ||
    firstSentence(str(fields[CATEGORY_FIELDS.bodyMd]) || "");

  const hreflang = parseJsonLoose<Array<{ lang?: unknown; url?: unknown }>>(
    fields[CATEGORY_FIELDS.hreflangJson],
    [],
  )
    .map((item) => ({
      lang: str(item?.lang) || "es-ES",
      url: toAbsoluteUrl(item?.url, publicPath),
    }))
    .filter((item) => item.url);

  return {
    metaTitle,
    metaDescription,
    canonical,
    hreflang: hreflang.length ? hreflang : [{ lang: "es-ES", url: canonical }],
    keywords: normalizeKeywordList(fields[CATEGORY_FIELDS.keywordsJson]),
    searchTerms: normalizeKeywordList(fields[CATEGORY_FIELDS.searchTermsJson]),
    schema: parseJsonLoose<Record<string, JsonValue>>(fields[CATEGORY_FIELDS.schemaJson], {}),
    robotsOverride: str(fields[CATEGORY_FIELDS.robotsOverride]) || "INHERIT",
    robotsAdvanced: str(fields[CATEGORY_FIELDS.robotsAdvanced]),
    ogImageSrc: sanitizeImageSrc(fields[CATEGORY_FIELDS.ogImageSrc]) || imageSrc,
  };
}

function buildProductSeo(
  fields: Record<string, unknown>,
  title: string,
  publicPath: string,
  imageSrc?: string,
): SeoDto {
  const canonical = `${SITE_URL}${publicPath}`;
  const metaTitle = str(fields[PRODUCT_FIELDS.metaTitle]) || title;
  const metaDescription =
    str(fields[PRODUCT_FIELDS.metaDescription]) ||
    str(fields[PRODUCT_FIELDS.shortDescription]) ||
    firstSentence(str(fields[PRODUCT_FIELDS.detailsMd]) || "") ||
    firstSentence(str(fields[PRODUCT_FIELDS.bodyMd]) || "");

  const hreflang = parseJsonLoose<Array<{ lang?: unknown; url?: unknown }>>(
    fields[PRODUCT_FIELDS.hreflangJson],
    [],
  )
    .map((item) => ({
      lang: str(item?.lang) || "es-ES",
      url: toAbsoluteUrl(item?.url, publicPath),
    }))
    .filter((item) => item.url);

  return {
    metaTitle,
    metaDescription,
    canonical,
    hreflang: hreflang.length ? hreflang : [{ lang: "es-ES", url: canonical }],
    keywords: normalizeKeywordList(fields[PRODUCT_FIELDS.keywordsJson]),
    searchTerms: normalizeKeywordList(fields[PRODUCT_FIELDS.searchTermsJson]),
    schema: parseJsonLoose<Record<string, JsonValue>>(fields[PRODUCT_FIELDS.schemaJson], {}),
    robotsOverride: bool(fields[PRODUCT_FIELDS.noIndex])
      ? "NOINDEX"
      : str(fields[PRODUCT_FIELDS.robotsOverride]) || "INHERIT",
    robotsAdvanced: str(fields[PRODUCT_FIELDS.robotsAdvanced]),
    ogImageSrc: sanitizeImageSrc(fields[PRODUCT_FIELDS.ogImageSrc]) || imageSrc,
  };
}

function buildCategorySchemaGraph(category: CategoryDto): Record<string, JsonValue | undefined> {
  const primary: Record<string, JsonValue | undefined> = {
    "@type": "CollectionPage",
    name: category.title,
    description:
      category.seo.metaDescription ||
      category.description ||
      firstSentence(category.sections[0]?.body || "") ||
      undefined,
    url: category.seo.canonical,
    image: category.seo.ogImageSrc || category.image.src,
    inLanguage: "es-ES",
    publisher: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
    ...schemaOverrideShape(category.seo.schema),
  };

  const graphItems: Array<Record<string, JsonValue | undefined>> = [primary];
  const breadcrumbSchema = buildBreadcrumbSchema(category.breadcrumbs);
  const faqSchema = buildFaqSchema(category.faqs);
  if (breadcrumbSchema) graphItems.push(breadcrumbSchema);
  if (faqSchema) graphItems.push(faqSchema);

  return { "@context": "https://schema.org", "@graph": graphItems };
}

function buildProductSchemaGraph(product: ProductDto): Record<string, JsonValue | undefined> {
  const primary: Record<string, JsonValue | undefined> = {
    "@type": "Product",
    name: product.title,
    description:
      product.seo.metaDescription ||
      product.shortDescription ||
      product.description ||
      firstSentence(product.sections[0]?.body || "") ||
      undefined,
    image: product.seo.ogImageSrc || product.image.src,
    url: product.seo.canonical,
    brand: { "@type": "Organization", name: product.brand || BRAND_NAME },
    sku: product.sku,
    mpn: product.mpn,
    gtin13: product.gtin13,
    ...schemaOverrideShape(product.seo.schema),
  };

  if (product.price > 0) {
    primary.offers = {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.priceCurrency || "EUR",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: product.seo.canonical,
    };
  }

  if (
    typeof product.ratingValue === "number" &&
    typeof product.reviewCount === "number" &&
    product.reviewCount > 0
  ) {
    primary.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
    };
  }

  const graphItems: Array<Record<string, JsonValue | undefined>> = [primary];
  const breadcrumbSchema = buildBreadcrumbSchema(product.breadcrumbs);
  const faqSchema = buildFaqSchema(product.faqs);
  if (breadcrumbSchema) graphItems.push(breadcrumbSchema);
  if (faqSchema) graphItems.push(faqSchema);

  return { "@context": "https://schema.org", "@graph": graphItems };
}

function parseTypesMd(value: unknown): ContentTypeItem[] {
  const parsed = parseJsonLoose<unknown[]>(value, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;

      const title = str(record.title) || "";
      const description = str(record.description) || "";

      const features = Array.isArray(record.features)
        ? record.features.map((feature) => str(feature)).filter(Boolean) as string[]
        : [];

      const idealFor = str(record.idealFor);

      return {
        title,
        description,
        features,
        idealFor,
      };
    })
    .filter((item) => item.title && item.description);
}

function buildCategory(item: GraphItem<Record<string, unknown>>): CategoryDto | null {
  const fields = item.fields || {};


  const slug =
    normalizeSlug(fields[CATEGORY_FIELDS.slug]) ||
    slugFromPath(pathFromUrlLike(fields[CATEGORY_FIELDS.path]), "/categorias") ||
    slugFromPath(pathFromUrlLike(fields[CATEGORY_FIELDS.canonical]), "/categorias");

  if (!slug) {
    warn(`Categoría descartada: item ${String(item.id ?? "sin-id")} sin slug válido.`);
    return null;
  }

  const publicPath = normalizePublicPath(
    fields[CATEGORY_FIELDS.path],
    fields[CATEGORY_FIELDS.canonical],
    `/categorias/${slug}`,
    "/categorias",
  );

  const title = str(fields[CATEGORY_FIELDS.title]) || slug;
  const nav = str(fields[CATEGORY_FIELDS.nav]) || title;
  const imageSrc = sanitizeImageSrc(fields[CATEGORY_FIELDS.imageSrc]);
  const detailsMd = str(fields[CATEGORY_FIELDS.detailsMd]);
  const bodyMd = str(fields[CATEGORY_FIELDS.bodyMd]);
  const description = str(fields[CATEGORY_FIELDS.description]);

  const sections = buildCategorySections(fields, detailsMd, bodyMd, description);

  const pathSegments = publicPath.split("/").filter(Boolean);
  const inferredParent = pathSegments.length > 2 ? pathSegments.slice(-2, -1)[0] : undefined;

  const parent = normalizeSlug(fields[CATEGORY_FIELDS.parentCategory]) || inferredParent;
  const seo = buildCategorySeo(fields, title, publicPath, imageSrc);

  return {
    id: String(item.id || slug),
    updatedAt: str(item.lastModifiedDateTime),
    type: parent ? "subcategoria" : "categoria",
    slug,
    path: publicPath,
    title,
    nav,
    order: num(fields[CATEGORY_FIELDS.sortOrder]) ?? DEFAULT_SORT_ORDER,
    parent,
    hidden: bool(fields[CATEGORY_FIELDS.isHidden]),
    featured: bool(fields[CATEGORY_FIELDS.isFeatured]),
    isPublished: bool(fields[CATEGORY_FIELDS.isPublished]),
    publishedAt: str(fields[CATEGORY_FIELDS.publishedAt]),
    description,
    bodyMd: bodyMd || detailsMd || description,
    sections,
    image: {
      src: imageSrc,
      width: parseImageDimension(fields[CATEGORY_FIELDS.imageWidth]),
      height: parseImageDimension(fields[CATEGORY_FIELDS.imageHeight]),
      alt: str(fields[CATEGORY_FIELDS.imageAlt]) || title,
    },
    faqs: parseFaqs(fields[CATEGORY_FIELDS.faqsJson]),
    galleryImages: parseJsonLoose<unknown[]>(fields[CATEGORY_FIELDS.galleryImagesJson], []),
    breadcrumbs: [],
    legacySlugs: uniq(
      parseStringList(fields[CATEGORY_FIELDS.legacySlugsJson])
        .map((value) => normalizeSlug(value))
        .filter(Boolean) as string[],
    ),
    seo,
  };
}


function buildProduct(item: GraphItem<Record<string, unknown>>): ProductDto | null {
  const fields = item.fields || {};

  const rawSlug =
    pickField(fields, ["ProductSlug", "Slug"]) ??
    fields[PRODUCT_FIELDS.slug];

  const rawPrimaryCategory =
    pickField(fields, ["CategorySlug", "PrimaryCategory"]) ??
    fields[PRODUCT_FIELDS.categorySlug];

  const rawCategories =
    pickField(fields, ["Categories"]) ??
    fields[PRODUCT_FIELDS.categories];

  const slug =
    normalizeSlug(rawSlug) ||
    slugFromPath(pathFromUrlLike(fields[PRODUCT_FIELDS.path]), "/productos") ||
    slugFromPath(pathFromUrlLike(fields[PRODUCT_FIELDS.canonical]), "/productos");

  if (!slug) {
    warn(`Producto descartado: item ${String(item.id ?? "sin-id")} sin slug válido.`);
    return null;
  }

  const publicPath = normalizePublicPath(
    fields[PRODUCT_FIELDS.path],
    fields[PRODUCT_FIELDS.canonical],
    `/productos/${slug}`,
    "/productos",
  );

  const title = str(fields[PRODUCT_FIELDS.title]) || slug;

  const additionalCategories = parseStringList(rawCategories)
    .map((value) => leafSlug(value))
    .filter(Boolean) as string[];

  const primaryCategorySlug = leafSlug(rawPrimaryCategory) || "";
  const categorySlug = primaryCategorySlug || additionalCategories[0] || "";
  const categorySlugs = uniq([categorySlug, ...additionalCategories].filter(Boolean)) as string[];

  const imageSrc = sanitizeImageSrc(fields[PRODUCT_FIELDS.imageSrc]);
  const detailsMd = str(fields[PRODUCT_FIELDS.detailsMd]);
  const bodyMd = str(fields[PRODUCT_FIELDS.bodyMd]);

  const shortDescription =
    str(fields[PRODUCT_FIELDS.shortDescription]) ||
    firstSentence(detailsMd || "") ||
    firstSentence(bodyMd || "");

  const brand = str(fields[PRODUCT_FIELDS.brand]);
  const priceValue = parsePrice(fields[PRODUCT_FIELDS.price]);
  const currency = str(fields[PRODUCT_FIELDS.priceCurrency]) || "EUR";
  const inStock = bool(fields[PRODUCT_FIELDS.inStock]);

  const sectionEntries: Array<{ target: string; value?: string }> = [
  { target: "details", value: detailsMd || shortDescription },
  { target: "benefits", value: str(fields[PRODUCT_FIELDS.benefitsMd]) },
  { target: "materials", value: str(fields[PRODUCT_FIELDS.materialsMd]) },
  { target: "formats", value: str(fields[PRODUCT_FIELDS.formatsMd]) },
  { target: "finishes", value: str(fields[PRODUCT_FIELDS.finishesMd]) },
  { target: "technical-specs", value: str(fields[PRODUCT_FIELDS.technicalSpecsMd]) },
  { target: "applications", value: str(fields[PRODUCT_FIELDS.applicationsMd]) },
];

const productSectionOrder = [
  "details",
  "benefits",
  "materials",
  "formats",
  "finishes",
  "technical-specs",
  "applications",
];
  const sectionSources = mergeSectionSources(
    sectionEntries,
    PRODUCT_SECTION_ALIASES,
    new Set(productSectionOrder),
  );
  const sections = buildSections(sectionSources, PRODUCT_SECTION_TITLES, productSectionOrder);

  const seo = buildProductSeo(fields, title, publicPath, imageSrc);
  console.log("PRODUCT", slug);
  console.log("FAQ RAW", fields[PRODUCT_FIELDS.faqsJson]);
  console.log("FAQ PARSED", parseFaqs(fields[PRODUCT_FIELDS.faqsJson]));
  return {
    id: String(item.id || slug),
    updatedAt: str(item.lastModifiedDateTime),
    type: "producto",
    slug,
    path: publicPath,
    title,
    categorySlug,
    categorySlugs,
    order: num(fields[PRODUCT_FIELDS.sortOrder]) ?? DEFAULT_SORT_ORDER,
    isPublished: bool(fields[PRODUCT_FIELDS.isPublished]),
    publishedAt: str(fields[PRODUCT_FIELDS.publishedAt]),
    shortDescription,
    description: shortDescription,
    bodyMd: bodyMd || detailsMd || shortDescription,
    sections,
    faqs: parseFaqs(fields[PRODUCT_FIELDS.faqsJson]),
    breadcrumbs: [],
    image: {
      src: imageSrc,
      width: parseImageDimension(fields[PRODUCT_FIELDS.imageWidth]),
      height: parseImageDimension(fields[PRODUCT_FIELDS.imageHeight]),
      alt: str(fields[PRODUCT_FIELDS.imageAlt]) || title,
    },
    galleryImages: parseJsonLoose<unknown[]>(fields[PRODUCT_FIELDS.galleryImagesJson], []),
    sku: str(fields[PRODUCT_FIELDS.sku]),
    mpn: str(fields[PRODUCT_FIELDS.mpn]),
    gtin13: str(fields[PRODUCT_FIELDS.gtin13]),
    brand,
    price: priceValue,
    priceCurrency: currency,
    inStock,
    ratingValue: num(fields[PRODUCT_FIELDS.ratingValue]),
    reviewCount: num(fields[PRODUCT_FIELDS.reviewCount]),
    attributes: parseJsonLoose<unknown[]>(fields[PRODUCT_FIELDS.attributesJson], []),
    variants: parseJsonLoose<unknown[]>(fields[PRODUCT_FIELDS.variantsJson], []),
    formFields: parseFormFields(fields[PRODUCT_FIELDS.formFieldsJson]),
    legacySlugs: uniq(
      parseStringList(fields[PRODUCT_FIELDS.legacySlugsJson])
        .map((value) => normalizeSlug(value))
        .filter(Boolean) as string[],
    ),
    seo,
  };
}

function buildCategoryBreadcrumbs(
  category: CategoryDto,
  categoriesBySlug: Map<string, CategoryDto>,
): Array<{ name: string; url: string }> {
  const trail: CategoryDto[] = [];
  const seen = new Set<string>();
  let current = category.parent ? categoriesBySlug.get(category.parent) : undefined;

  while (current && !seen.has(current.slug)) {
    trail.unshift(current);
    seen.add(current.slug);
    current = current.parent ? categoriesBySlug.get(current.parent) : undefined;
  }

  return dedupeBreadcrumbs([
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/categorias" },
    ...trail.map((item) => ({ name: item.nav || item.title, url: item.path })),
    { name: category.nav || category.title, url: category.path },
  ]);
}

function buildProductBreadcrumbs(
  product: ProductDto,
  categoriesBySlug: Map<string, CategoryDto>,
): Array<{ name: string; url: string }> {
  const primaryCategory =
    categoriesBySlug.get(product.categorySlug) ||
    product.categorySlugs.map((slug) => categoriesBySlug.get(slug)).find(Boolean);

  if (!primaryCategory) {
    return dedupeBreadcrumbs([
      { name: "Inicio", url: "/" },
      { name: "Productos", url: "/productos" },
      { name: product.title, url: product.path },
    ]);
  }

  return dedupeBreadcrumbs([...primaryCategory.breadcrumbs, { name: product.title, url: product.path }]);
}

function finalizeCatalog(categories: CategoryDto[], products: ProductDto[]): void {
  const categoriesBySlug = new Map<string, CategoryDto>();
  for (const category of categories) categoriesBySlug.set(category.slug, category);

  for (const category of categories) {
    category.breadcrumbs = buildCategoryBreadcrumbs(category, categoriesBySlug);
    category.seo.hreflang = normalizeHreflang(category.seo.hreflang, category.seo.canonical);
    category.seo.schema = buildCategorySchemaGraph(category);
  }

  for (const product of products) {
    if (!product.categorySlug && product.categorySlugs.length > 0) {
      product.categorySlug = product.categorySlugs[0] || "";
    }
    product.breadcrumbs = buildProductBreadcrumbs(product, categoriesBySlug);
    product.seo.hreflang = normalizeHreflang(product.seo.hreflang, product.seo.canonical);
    product.seo.schema = buildProductSchemaGraph(product);
  }
}

function assertUniqueOrThrow(items: Array<{ key: string; label: string }>, message: string): void {
  const seen = new Map<string, string>();
  for (const item of items) {
    const owner = seen.get(item.key);
    if (owner) throw new Error(`${message}: "${item.key}" repetido entre ${owner} y ${item.label}`);
    seen.set(item.key, item.label);
  }
}

function validateCatalog(categories: CategoryDto[], products: ProductDto[]): void {
  assertUniqueOrThrow(
    categories.map((item) => ({ key: item.slug, label: `categoría:${item.slug}` })),
    "Slug de categoría duplicado",
  );

  assertUniqueOrThrow(
    products.map((item) => ({ key: item.slug, label: `producto:${item.slug}` })),
    "Slug de producto duplicado",
  );

  assertUniqueOrThrow(
    [
      ...categories.map((item) => ({ key: item.path, label: `categoría:${item.slug}` })),
      ...products.map((item) => ({ key: item.path, label: `producto:${item.slug}` })),
    ],
    "Ruta pública duplicada",
  );

  const categorySlugSet = new Set(categories.map((category) => category.slug));

  for (const category of categories) {
    if (!category.path.startsWith("/categorias")) {
      warn(`Categoría ${category.slug}: path inválido (${category.path}).`);
    }
    if (category.image.src && !/^(https?:\/\/|\/)/i.test(category.image.src)) {
      warn(`Categoría ${category.slug}: image.src no parece una URL válida (${category.image.src}).`);
    }
    const canonicalPath = pathFromUrlLike(category.seo.canonical);
    if (canonicalPath && canonicalPath !== category.path) {
      warn(`Categoría ${category.slug}: canonical y path no coinciden (${canonicalPath} !== ${category.path}).`);
    }
    if (category.parent && !categorySlugSet.has(category.parent)) {
      warn(`Categoría ${category.slug}: parent (${category.parent}) no existe entre categorías publicadas.`);
    }
  }

  for (const product of products) {
    if (!product.path.startsWith("/productos")) {
      warn(`Producto ${product.slug}: path inválido (${product.path}).`);
    }
    if (!product.categorySlug) {
      warn(`Producto ${product.slug}: CategorySlug vacío.`);
    }
    if (product.image.src && !/^(https?:\/\/|\/)/i.test(product.image.src)) {
      warn(`Producto ${product.slug}: image.src no parece una URL válida (${product.image.src}).`);
    }
    const canonicalPath = pathFromUrlLike(product.seo.canonical);
    if (canonicalPath && canonicalPath !== product.path) {
      warn(`Producto ${product.slug}: canonical y path no coinciden (${canonicalPath} !== ${product.path}).`);
    }
    if (product.categorySlug && !categorySlugSet.has(product.categorySlug)) {
      warn(`Producto ${product.slug}: CategorySlug (${product.categorySlug}) no existe en categorías publicadas.`);
    }
    if (product.breadcrumbs.length === 0) {
      warn(`Producto ${product.slug}: breadcrumbs vacíos.`);
    }
  }
}


function countItemsWithField(
  items: Array<GraphItem<Record<string, unknown>>>,
  fieldName: string,
): number {
  return items.reduce((count, item) => {
    const value = item.fields?.[fieldName];
    return str(value) ? count + 1 : count;
  }, 0);
}

function assertRawProductFieldCoverage(
  productItems: Array<GraphItem<Record<string, unknown>>>,
): void {
  const titleCount = countItemsWithField(productItems, PRODUCT_FIELDS.title);
  const slugCount = countItemsWithField(productItems, PRODUCT_FIELDS.slug);
  const pathCount = countItemsWithField(productItems, PRODUCT_FIELDS.path);
  const primaryCategoryCount = countItemsWithField(productItems, PRODUCT_FIELDS.categorySlug);
  const categoriesCount = countItemsWithField(productItems, PRODUCT_FIELDS.categories);

  console.log(
    `🧪 Cobertura campos producto: title=${titleCount}/${productItems.length}, slug=${slugCount}/${productItems.length}, path=${pathCount}/${productItems.length}, primaryCategory=${primaryCategoryCount}/${productItems.length}, categories=${categoriesCount}/${productItems.length}`,
  );

  if (productItems.length === 0) return;

  if (primaryCategoryCount === 0) {
    throw new Error(
      `El campo "${PRODUCT_FIELDS.categorySlug}" no está llegando desde SharePoint. Revisa el $select de productos y el nombre interno de la columna.`,
    );
  }

  if (slugCount === 0 && pathCount === 0) {
    throw new Error(
      `Ni "${PRODUCT_FIELDS.slug}" ni "${PRODUCT_FIELDS.path}" están llegando desde SharePoint. No se puede construir un catálogo fiable.`,
    );
  }
}

function assertPublishedProductsHaveCategories(products: ProductDto[]): void {
  const missing = products.filter((product) => !product.categorySlug);

  if (missing.length === 0) return;

  const preview = missing
    .slice(0, 10)
    .map((product) => product.slug)
    .join(", ");

  throw new Error(
    `Hay ${missing.length} productos publicados sin categoría asignada. Primeros casos: ${preview}. Se aborta para evitar generar un catalog.json incoherente.`,
  );
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tempPath = path.join(dir, `${base}.tmp`);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

async function debugProductColumns(): Promise<void> {
  const siteId = await resolveSiteId();
  const response = await graphGet<{
    value?: Array<{
      name?: string;
      displayName?: string;
      hidden?: boolean;
    }>;
  }>(`/sites/${siteId}/lists/${SP_LIST_PRODUCTS_ID}/columns?$top=999&$select=name,displayName,hidden`);

  console.log("\n🧱 Columnas reales de la lista de productos:");
  for (const col of response.value || []) {
    console.log(`- displayName="${col.displayName}" | internal="${col.name}" | hidden=${col.hidden}`);
  }
}

async function run(): Promise<void> {
  console.log("🔄 Sincronizando SharePoint -> cms/catalog.json\n");
  await debugProductColumns();
  const [categoryItems, productItems] = await Promise.all([
    fetchAllItems<Record<string, unknown>>(SP_LIST_CATEGORIES_ID!, CATEGORY_SELECT),
    fetchAllItems<Record<string, unknown>>(SP_LIST_PRODUCTS_ID!, PRODUCT_SELECT),
  ]);

  console.log(`📦 SharePoint: ${categoryItems.length} categorías, ${productItems.length} productos`);
  assertRawProductFieldCoverage(productItems);

  const builtCategories = categoryItems.map(buildCategory).filter((item): item is CategoryDto => Boolean(item));
  const builtProducts = productItems.map(buildProduct).filter((item): item is ProductDto => Boolean(item));

  const categories = builtCategories
    .filter((item) => item.isPublished && !item.hidden)
    .sort((a, b) => (a.order !== b.order ? a.order - b.order : safeLocaleCompare(a.title, b.title)));

  const products = builtProducts
    .filter((item) => item.isPublished)
    .sort((a, b) => (a.order !== b.order ? a.order - b.order : safeLocaleCompare(a.title, b.title)));

  finalizeCatalog(categories, products);
  validateCatalog(categories, products);
  assertPublishedProductsHaveCategories(products);

  const catalog: SyncCatalog = {
    generatedAt: new Date().toISOString(),
    categories,
    products,
  };

  const routes = uniq([...categories.map((item) => item.path), ...products.map((item) => item.path)]).sort((a, b) =>
    safeLocaleCompare(a, b),
  );

  const searchIndex = [
    ...categories.map((item) => ({
      type: "categoria",
      slug: item.slug,
      title: item.title,
      path: item.path,
      keywords: normalizeKeywordList(item.seo.keywords),
      searchTerms: normalizeKeywordList(item.seo.searchTerms || []),
    })),
    ...products.map((item) => ({
      type: "producto",
      slug: item.slug,
      title: item.title,
      path: item.path,
      keywords: normalizeKeywordList(item.seo.keywords),
      searchTerms: normalizeKeywordList(item.seo.searchTerms || []),
    })),
  ];

  await writeJsonAtomic(path.resolve("cms/catalog.json"), catalog);
  await writeJsonAtomic(path.resolve("cms/routes.json"), routes);
  await writeJsonAtomic(path.resolve("cms/search-index.json"), searchIndex);

  console.log("\n✅ Generados:");
  console.log("   cms/catalog.json");
  console.log("   cms/routes.json");
  console.log("   cms/search-index.json");

  if (warnings.length > 0) {
    console.log(`\n⚠️ Validaciones (${warnings.length}):`);
    for (const message of warnings) console.log(`   - ${message}`);
  } else {
    console.log("\n✅ Sin warnings de validación");
  }
}



run().catch((error) => {
  console.error("❌ Error durante la sincronización:");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});