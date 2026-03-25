import fs from "node:fs/promises";
import dotenv from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";

dotenv.config({ path: ".env.imports", override: true });

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type GraphItem<TFields extends Record<string, unknown>> = {
  id?: string | number;
  lastModifiedDateTime?: string;
  fields?: TFields;
};

type SharePointCategoryFields = {
  Title?: unknown;
  CategorySlug?: unknown;
  NavLabel?: unknown;
  SortOrder?: unknown;
  ParentCategory?: unknown;
  ParentSlug?: unknown;
  IsFeatured?: unknown;
  IsHidden?: unknown;
  IsPublished?: unknown;
  PublishedAt?: unknown;

  Description?: unknown;
  BodyMd?: unknown;
  DetailsMd?: unknown;
  TypesMd?: unknown;
  FormatsMd?: unknown;
  UsesMd?: unknown;
  FinishesMd?: unknown;

  ImageSrc?: unknown;
  ImageWidth?: unknown;
  ImageHeight?: unknown;
  ImageAlt?: unknown;
  GalleryImagesJson?: unknown;
  BreadcrumbsJson?: unknown;
  CtaText?: unknown;
  CtaLink?: unknown;
  Path?: unknown;
  LegacySlugsJson?: unknown;
  LegacySlugs?: unknown;
  MetaTitle?: unknown;
  SeoTitle?: unknown;
  MetaDescription?: unknown;
  SeoDescription?: unknown;
  Canonical?: unknown;
  HrefLangJson?: unknown;
  HreflangJson?: unknown;
  KeywordsJson?: unknown;
  Keywords?: unknown;
  SearchTermsJson?: unknown;
  SearchTerms?: unknown;
  SchemaJson?: unknown;
  Schema?: unknown;
  FaqsJson?: unknown;
  RobotsOverride?: unknown;
  Robots?: unknown;
  RobotsAdvanced?: unknown;
  OgImageSrc?: unknown;
  OgImage?: unknown;
};

type SharePointProductFields = {
  Title?: unknown;
  ProductTitle?: unknown;
  Slug?: unknown;
  ProductSlug?: unknown;
  PrimarySlug?: unknown;
  UrlSlug?: unknown;
  Handle?: unknown;
  Path?: unknown;
  ProductPath?: unknown;
  UrlPath?: unknown;
  PrimaryCategory?: unknown;
  CategorySlug?: unknown;
  Category?: unknown;
  PrimaryCategorySlug?: unknown;
  Categories?: unknown;
  SecondaryCategories?: unknown;
  SortOrder?: unknown;
  Order?: unknown;
  IsPublished?: unknown;
  Published?: unknown;
  Visible?: unknown;
  PublishedAt?: unknown;
  PublishDate?: unknown;

  ShortDescription?: unknown;
  Excerpt?: unknown;
  Summary?: unknown;
  Description?: unknown;

  BodyMd?: unknown;
  Body?: unknown;
  Markdown?: unknown;
  DescriptionMd?: unknown;

  DetailsMd?: unknown;
  BenefitsMd?: unknown;
  MaterialsMd?: unknown;
  FinishesMd?: unknown;
  TechnicalSpecsMd?: unknown;
  ApplicationsMd?: unknown;
  FormatsMd?: unknown;

  FaqsJson?: unknown;
  FaqJson?: unknown;
  FAQsJson?: unknown;
  ImageSrc?: unknown;
  Image?: unknown;
  FeaturedImage?: unknown;
  ImageWidth?: unknown;
  Width?: unknown;
  ImageHeight?: unknown;
  Height?: unknown;
  ImageAlt?: unknown;
  Alt?: unknown;
  GalleryImagesJson?: unknown;
  GalleryJson?: unknown;
  Sku?: unknown;
  SKU?: unknown;
  Mpn?: unknown;
  MPN?: unknown;
  Gtin13?: unknown;
  GTIN13?: unknown;
  Ean13?: unknown;
  Brand?: unknown;
  Marca?: unknown;
  Price?: unknown;
  BasePrice?: unknown;
  PriceCurrency?: unknown;
  Currency?: unknown;
  InStock?: unknown;
  Stock?: unknown;
  Available?: unknown;
  RatingValue?: unknown;
  Rating?: unknown;
  ReviewCount?: unknown;
  Reviews?: unknown;
  AttributesJson?: unknown;
  Attributes?: unknown;
  VariantsJson?: unknown;
  Variants?: unknown;
  FormFieldsJson?: unknown;
  FormFields?: unknown;
  MetaTitle?: unknown;
  SeoTitle?: unknown;
  MetaDescription?: unknown;
  SeoDescription?: unknown;
  Canonical?: unknown;
  CanonicalUrl?: unknown;
  SeoCanonical?: unknown;
  HrefLangJson?: unknown;
  HreflangJson?: unknown;
  KeywordsJson?: unknown;
  Keywords?: unknown;
  SearchTermsJson?: unknown;
  SearchTerms?: unknown;
  SchemaJson?: unknown;
  Schema?: unknown;
  LegacySlugsJson?: unknown;
  LegacySlugs?: unknown;
  NoIndex?: unknown;
  Noindex?: unknown;
  RobotsOverride?: unknown;
  Robots?: unknown;
  RobotsAdvanced?: unknown;
  OgImageSrc?: unknown;
  OgImage?: unknown;
};

type ContentBlock =
  | {
      type: "text";
      text: string;
      html: boolean;
      format?: "html";
    }
  | {
      type: "bullets";
      items: string[];
      ordered?: boolean;
    }
  | {
      type: "image";
      src: string;
      alt?: string;
      caption?: string;
      width?: number;
      height?: number;
    };

type ContentSection = {
  id: string;
  key: string;
  title: string;
  body: string;
  blocks: ContentBlock[];
};

type FaqItem = {
  question: string;
  answer: string;
};

type ImageDto = {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
};

type HreflangDto = {
  lang: string;
  url: string;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

type SeoDto = {
  metaTitle?: string;
  metaDescription?: string;
  canonical: string;
  hreflang: HreflangDto[];
  keywords: string[];
  searchTerms?: string[];
  schema: Record<string, JsonValue | undefined>;
  robotsOverride: string;
  robotsAdvanced?: string;
  ogImageSrc?: string;
};

type FormFieldDto = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  placeholder?: string;
  helpText?: string;
  readonly: boolean;
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
  cta: {
    text?: string;
    link?: string;
  };
  faqs: FaqItem[];
  galleryImages: unknown[];
  breadcrumbs: BreadcrumbItem[];
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
  faqs: FaqItem[];
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
  formFields: FormFieldDto[];
  legacySlugs: string[];
  seo: SeoDto;
};

type SyncCatalog = {
  generatedAt: string;
  categories: CategoryDto[];
  products: ProductDto[];
};

const CATEGORY_SECTION_ORDER = [
  "details",
  "types",
  "formats",
  "finishes",
  "uses",
] as const;

const PRODUCT_SECTION_ORDER = [
  "details",
  "benefits",
  "materials",
  "formats",
  "finishes",
  "technical-specs",
  "applications",
] as const;

const SECTION_TITLE_MAP: Record<string, string> = {
  details: "Detalles",
  types: "Tipos",
  formats: "Formatos y soportes",
  finishes: "Acabados",
  uses: "Usos habituales",
  benefits: "Beneficios",
  materials: "Materiales",
  "technical-specs": "Características técnicas",
  applications: "Aplicaciones",
};

const SECTION_ALIAS_MAP: Record<string, string> = {
  descripcion: "details",
  detalle: "details",
  detalles: "details",

  tipo: "types",
  tipos: "types",

  formato: "formats",
  formatos: "formats",
  "formatos-y-soportes": "formats",
  "formatos-soportes": "formats",
  "formatos-y-presentacion": "formats",
  "formatos-y-cortes": "formats",

  acabado: "finishes",
  acabados: "finishes",

  uso: "uses",
  usos: "uses",
  "usos-habituales": "uses",
  "casos-de-uso": "uses",

  beneficio: "benefits",
  beneficios: "benefits",

  material: "materials",
  materiales: "materials",

  "caracteristicas-tecnicas": "technical-specs",
  caracteristicas: "technical-specs",
  especificaciones: "technical-specs",
  "technical-specs": "technical-specs",

  aplicacion: "applications",
  aplicaciones: "applications",
};

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

const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "https://reprodisseny.com")
  .trim()
  .replace(/\/+$/, "");

const missing = [
  ["TENANT_ID", TENANT_ID],
  ["CLIENT_ID", CLIENT_ID],
  ["CLIENT_SECRET", CLIENT_SECRET],
  ["CMS_SITE_HOSTNAME", CMS_SITE_HOSTNAME],
  ["CMS_SITE_PATH", CMS_SITE_PATH],
  ["SP_LIST_CATEGORIES_ID", SP_LIST_CATEGORIES_ID],
  ["SP_LIST_PRODUCTS_ID", SP_LIST_PRODUCTS_ID],
].filter(([, value]) => !value);

if (missing.length) {
  console.error("Missing env vars for sync:", missing.map(([name]) => name).join(", "));
  process.exit(1);
}

function buildGraphClient() {
  const credential = new ClientSecretCredential(TENANT_ID!, CLIENT_ID!, CLIENT_SECRET!);
  const scope = "https://graph.microsoft.com/.default";

  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken(scope);
        done(null, token?.token ?? null);
      } catch (error) {
        done(error as Error, null);
      }
    },
  });
}

const graph = buildGraphClient();

async function resolveSiteId(): Promise<string> {
  if (SHAREPOINT_SITE_ID) return SHAREPOINT_SITE_ID;

  const path = String(CMS_SITE_PATH || "").startsWith("/")
    ? String(CMS_SITE_PATH)
    : `/${String(CMS_SITE_PATH || "")}`;

  const site = await withRetry<{ id?: string }>(() =>
    graph.api(`/sites/${CMS_SITE_HOSTNAME}:${path}`).header("Prefer", "apiversion=2.1").get()
  );

  if (!site?.id) {
    throw new Error(`No se pudo resolver el site id para ${CMS_SITE_HOSTNAME}${path}`);
  }

  return String(site.id);
}

async function withRetry<T>(fn: () => Promise<T>, { tries = 6 }: { tries?: number } = {}): Promise<T> {
  let lastErr: unknown;

  for (let i = 0; i < tries; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastErr = error;
      const err = error as {
        statusCode?: number;
        status?: number;
        response?: { headers?: { get?: (name: string) => string | null | undefined } };
      };
      const status = err?.statusCode || err?.status;
      const retryAfter = Number(err?.response?.headers?.get?.("retry-after") || 0);
      const waitMs = retryAfter ? retryAfter * 1000 : 500 * Math.pow(2, i);

      if (status === 429 || status === 503) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      break;
    }
  }

  throw lastErr;
}

function toStr(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
}

function firstNonEmpty<T = unknown>(obj: Record<string, unknown>, keys: string[], fallback?: T): unknown | T {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback as T;
}

function toBool(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;

  const s = String(value).trim().toLowerCase();
  if (!s) return false;

  if (["1", "true", "yes", "y", "si", "sí", "verdadero"].includes(s)) return true;
  if (["0", "false", "no", "n", "falso"].includes(s)) return false;

  return Boolean(value);
}

function toNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;

  const raw = String(value).trim();
  if (!raw) return undefined;

  if (/^-?\d+$/.test(raw)) return Number(raw);

  const digits = raw.replace(/[^\d-]/g, "");
  if (!digits || digits === "-") return undefined;

  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPrice(value: unknown): number {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  let raw = String(value).trim();
  if (!raw) return 0;

  raw = raw.replace(/[^\d,.-]/g, "");

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) {
      raw = raw.replace(/\./g, "").replace(/,/g, ".");
    } else {
      raw = raw.replace(/,/g, "");
    }
  } else if (hasComma) {
    raw = raw.replace(/,/g, ".");
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeLooseJsonString(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n");
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;

  const s = toStr(value);
  if (!s) return fallback;

  try {
    return JSON.parse(s) as T;
  } catch {
    try {
      return JSON.parse(normalizeLooseJsonString(s)) as T;
    } catch {
      return fallback;
    }
  }
}

function parseStringList(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(toStr).filter(Boolean) as string[];

  const s = toStr(value);
  if (!s) return [];

  const parsed = parseJson<unknown[] | null>(s, null);
  if (Array.isArray(parsed)) return parsed.map(toStr).filter(Boolean) as string[];

  return s
    .split(/[;,\n]/)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items.filter(Boolean))];
}

function urlValue(value: unknown): string | undefined {
  if (!value) return undefined;

  let rawUrl = "";
  if (typeof value === "string") rawUrl = value;
  else if (typeof value === "object") {
    const candidate = value as { Url?: unknown; url?: unknown };
    rawUrl = String(candidate.Url || candidate.url || "");
  }

  const clean = rawUrl.split(",")[0]?.trim();
  return clean || undefined;
}

function urlPathValue(value: unknown): string | undefined {
  const s = toStr(value);
  if (!s) return undefined;
  if (s.startsWith("/")) return s;

  try {
    return new URL(s).pathname || undefined;
  } catch {
    return undefined;
  }
}

function normalizeSlug(value: unknown): string | undefined {
  let s = toStr(value) || "";
  if (!s) return undefined;

  if (s.includes("://")) {
    try {
      s = new URL(s).pathname || s;
    } catch {
      // noop
    }
  }

  s = s.split("?")[0]!.split("#")[0]!;
  s = s.replace(/^\/+|\/+$/g, "");
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^categorias\//i, "");
  s = s.replace(/^\/?productos\//i, "");
  s = s.replace(/^productos\//i, "");

  return s || undefined;
}

function slugLeaf(value: unknown): string | undefined {
  const s = normalizeSlug(value);
  if (!s) return undefined;

  const parts = s.split("/").filter(Boolean);
  return parts[parts.length - 1] || undefined;
}

function normalizeParentSlug(parent: unknown, slug?: string): string | undefined {
  const p = slugLeaf(parent);
  if (!p) return undefined;
  if (p === "categorias") return undefined;
  if (slug && p === slug) return undefined;
  return p;
}

function inferParentFromPath(pathValue: unknown, slug?: string): string | undefined {
  const p = urlPathValue(pathValue) || toStr(pathValue);
  if (!p || !slug) return undefined;

  const clean = p.split("?")[0]!.split("#")[0]!.replace(/\/{2,}/g, "/");
  const segs = clean.split("/").filter(Boolean);
  const idx = segs.findIndex((segment) => segment.toLowerCase() === "categorias");
  if (idx < 0) return undefined;

  const after = segs.slice(idx + 1);
  if (after.length < 2) return undefined;

  const last = after[after.length - 1];
  if (normalizeSlug(last) !== normalizeSlug(slug)) return undefined;

  return after[after.length - 2];
}

function normalizeCategoryPath(pathValue: unknown, slug: string, parent?: string): string {
  let p = toStr(pathValue) || "";

  if (p) {
    if (p.includes("://")) {
      try {
        p = new URL(p).pathname || p;
      } catch {
        // noop
      }
    }

    p = p.replace(/\/{2,}/g, "/").trim();
    if (!p.startsWith("/")) p = `/${p}`;
    if (!p.startsWith("/categorias/")) {
      p = `/categorias/${p.replace(/^\/+/, "")}`;
    }

    return p.replace(/\/+$/, "");
  }

  return parent ? `/categorias/${parent}/${slug}` : `/categorias/${slug}`;
}

function normalizeProductPath(pathValue: unknown, canonicalValue: unknown, slug: string): string {
  const directPath = urlPathValue(pathValue) || urlPathValue(canonicalValue) || toStr(pathValue);
  if (directPath) {
    let p = directPath;
    if (p.includes("://")) {
      try {
        p = new URL(p).pathname || p;
      } catch {
        // noop
      }
    }
    p = p.replace(/\/{2,}/g, "/").trim();
    if (!p.startsWith("/")) p = `/${p}`;
    return p.replace(/\/+$/, "");
  }

  return `/productos/${slug}`;
}

function sanitizeInternalLink(value: unknown): string | undefined {
  const raw = urlValue(value) || toStr(value);
  if (!raw) return undefined;

  if (raw.startsWith("/")) return raw.replace(/\/+$/, "") || "/";

  try {
    const url = new URL(raw);
    if (/^localhost$/i.test(url.hostname) || /^127\.0\.0\.1$/i.test(url.hostname)) {
      return url.pathname.replace(/\/+$/, "") || "/";
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function toAbsoluteSiteUrl(value: unknown, fallbackPath?: string): string {
  const raw = urlValue(value) || toStr(value);

  if (!raw) {
    return `${SITE_URL}${fallbackPath || ""}`;
  }

  if (raw.startsWith("/")) {
    return `${SITE_URL}${raw.replace(/\/+$/, "")}`;
  }

  try {
    const url = new URL(raw);
    if (/^localhost$/i.test(url.hostname) || /^127\.0\.0\.1$/i.test(url.hostname)) {
      return `${SITE_URL}${(url.pathname || fallbackPath || "").replace(/\/+$/, "")}`;
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return `${SITE_URL}${fallbackPath || ""}`;
  }
}

function normalizeHreflang(value: unknown, canonicalUrl: string): HreflangDto[] {
  const parsed = parseJson<unknown[]>(value, []);
  if (!Array.isArray(parsed)) return [{ lang: "es-ES", url: canonicalUrl }];

  const safe = parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const lang = toStr(source.lang || source.locale || source.hreflang);
      const rawUrl = source.url || source.href;
      if (!lang || !rawUrl) return null;
      return {
        lang,
        url: toAbsoluteSiteUrl(rawUrl),
      } satisfies HreflangDto;
    })
    .filter(Boolean) as HreflangDto[];

  return safe.length ? safe : [{ lang: "es-ES", url: canonicalUrl }];
}

function normalizeBreadcrumbs(value: unknown): BreadcrumbItem[] {
  const parsed = parseJson<unknown[]>(value, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const name = toStr(source.name || source.title || source.label);
      const url = source.url || source.href || source.link;
      if (!name || !url) return null;
      return {
        name,
        url: toAbsoluteSiteUrl(url),
      } satisfies BreadcrumbItem;
    })
    .filter(Boolean) as BreadcrumbItem[];
}

async function fetchAllItems<TFields extends Record<string, unknown>>(
  listId: string,
  selectFields: string[]
): Promise<Array<GraphItem<TFields>>> {
  const hasSelect = Array.isArray(selectFields) && selectFields.length > 0;
  const expand = hasSelect ? `fields($select=${selectFields.join(",")})` : "fields";

  const siteId = await resolveSiteId();
  const base = `/sites/${siteId}/lists/${listId}/items?$top=999&$expand=${expand}`;

  const items: Array<GraphItem<TFields>> = [];
  let next: string | null = base;

  while (next) {
    const res = await withRetry<{ value?: Array<GraphItem<TFields>>; [key: string]: unknown }>(() =>
      graph.api(next!).header("Prefer", "apiversion=2.1").get()
    );

    for (const item of res.value || []) items.push(item);
    next = typeof res["@odata.nextLink"] === "string" ? (res["@odata.nextLink"] as string) : null;
  }

  return items;
}

function escapeHtml(value: string): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });
}

function normalizeMdText(value: unknown): string {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\.\s*\/n/g, "\n")
    .replace(/\/n/g, "\n")
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

function slugifyId(value: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function canonicalSectionId(value: unknown): string {
  const normalized = slugifyId(String(value ?? ""));
  return SECTION_ALIAS_MAP[normalized] || normalized || "details";
}

function canonicalSectionTitle(id: string, fallback?: string): string {
  return SECTION_TITLE_MAP[id] || fallback || "Contenido";
}

function sortSections(
  sections: ContentSection[],
  preferredOrder: readonly string[]
): ContentSection[] {
  const orderMap = new Map(preferredOrder.map((id, index) => [id, index]));

  return [...sections].sort((a, b) => {
    const ai = orderMap.get(a.id) ?? 999;
    const bi = orderMap.get(b.id) ?? 999;
    if (ai !== bi) return ai - bi;
    return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
  });
}

function mdChunkToBlocks(md: string): ContentBlock[] {
  const text = normalizeMdText(md);
  if (!text) return [];

  const lines = text.split("\n");
  const blocks: ContentBlock[] = [];

  let paragraph: string[] = [];
  let bullets: string[] = [];
  let orderedBullets = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const t = paragraph.join("\n").trim();
    if (t) blocks.push({ type: "text", text: t, html: false });
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push({
      type: "bullets",
      ordered: orderedBullets,
      items: bullets.map((item) => item.trim()).filter(Boolean),
    });
    bullets = [];
    orderedBullets = false;
  };

  const pushHeading = (level: 3 | 4, title: string) => {
    const safe = escapeHtml(stripMdInline(title));
    const tag = level === 4 ? "h4" : "h3";
    blocks.push({
      type: "text",
      html: true,
      format: "html",
      text: `<${tag}>${safe}</${tag}>`,
    });
  };

  for (const rawLine of lines) {
    const line = String(rawLine ?? "");
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushBullets();
      continue;
    }

    const mH3 = trimmed.match(/^###\s*(.+?)\s*$/);
    if (mH3) {
      flushParagraph();
      flushBullets();
      pushHeading(3, mH3[1]!);
      continue;
    }

    const mH4 = trimmed.match(/^####\s*(.+?)\s*$/);
    if (mH4) {
      flushParagraph();
      flushBullets();
      pushHeading(4, mH4[1]!);
      continue;
    }

    const mImg = trimmed.match(/^!\[(.*?)\]\((\S+?)(?:\s+"(.*?)")?\)$/);
    if (mImg) {
      flushParagraph();
      flushBullets();
      blocks.push({
        type: "image",
        src: mImg[2]!,
        alt: mImg[1] || "",
        caption: mImg[3] || undefined,
      });
      continue;
    }

    const mOrdered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (mOrdered) {
      flushParagraph();
      if (bullets.length && !orderedBullets) flushBullets();
      orderedBullets = true;
      bullets.push(mOrdered[2]!.trim());
      continue;
    }

    const mBullet = trimmed.match(/^(?:[-*•·]\s*)(.+)$/);
    if (mBullet) {
      flushParagraph();
      if (bullets.length && orderedBullets) flushBullets();
      orderedBullets = false;
      bullets.push(mBullet[1]!.trim());
      continue;
    }

    flushBullets();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushBullets();

  return blocks;
}

function splitBodyMdSections(bodyMd: string): {
  introMd: string;
  sections: Array<{ title: string; md: string }>;
} {
  const md = normalizeMdText(bodyMd);
  if (!md) return { introMd: "", sections: [] };

  const lines = md.split("\n");
  const introLines: string[] = [];
  const sections: Array<{ title: string; lines: string[] }> = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const rawLine of lines) {
    const line = String(rawLine ?? "");
    const trimmed = line.trim();

    const mH2 = trimmed.match(/^##\s*(.+?)\s*$/);
    if (mH2) {
      current = { title: stripMdInline(mH2[1]!), lines: [] };
      sections.push(current);
      continue;
    }

    if (current) current.lines.push(line);
    else introLines.push(line);
  }

  return {
    introMd: introLines.join("\n").trim(),
    sections: sections.map((section) => ({
      title: section.title,
      md: section.lines.join("\n").trim(),
    })),
  };
}

function createSection(idLike: string, titleLike: string, body: unknown): ContentSection | null {
  let cleanBody = normalizeMdText(body);
  if (!cleanBody) return null;

  cleanBody = cleanBody.replace(/^##+\s*[^\n]+\n*/i, "").trim();
  if (!cleanBody) return null;

  const id = canonicalSectionId(idLike || titleLike);
  const title = canonicalSectionTitle(id, stripMdInline(titleLike));
  const blocks = mdChunkToBlocks(cleanBody);

  if (!blocks.length) return null;

  return {
    id,
    key: id,
    title,
    body: cleanBody,
    blocks,
  };
}

function buildSectionsFromBodyMd(bodyMd: string | undefined): ContentSection[] {
  const md = normalizeMdText(bodyMd);
  if (!md) return [];

  const { introMd, sections } = splitBodyMdSections(md);
  const out = new Map<string, ContentSection>();

  const upsert = (section: ContentSection | null) => {
    if (!section) return;
    if (!out.has(section.id)) {
      out.set(section.id, section);
      return;
    }

    const existing = out.get(section.id)!;
    const nextBody = [existing.body, section.body].filter(Boolean).join("\n\n").trim();

    out.set(section.id, {
      ...existing,
      body: nextBody,
      blocks: [...existing.blocks, ...section.blocks],
    });
  };

  if (introMd) {
    upsert(createSection("details", "Detalles", introMd));
  }

  for (const section of sections) {
    upsert(createSection(section.title, section.title, section.md));
  }

  if (!out.size) {
    upsert(createSection("details", "Detalles", md));
  }

  return [...out.values()];
}

function buildStructuredSections(
  input: Array<{
    id: string;
    title: string;
    body: unknown;
  }>,
  preferredOrder: readonly string[]
): ContentSection[] {
  const sections = input
    .map((item) => createSection(item.id, item.title, item.body))
    .filter(Boolean) as ContentSection[];

  return sortSections(sections, preferredOrder);
}

function buildSectionsStructuredFirst(
  structuredSections: ContentSection[],
  preferredOrder: readonly string[],
  bodyMd?: string,
  fallbackDescription?: string
): ContentSection[] {
  if (structuredSections.length > 0) {
    return sortSections(structuredSections, preferredOrder);
  }

  const fallbackSections = buildSectionsFromBodyMd(bodyMd);
  if (fallbackSections.length > 0) {
    return sortSections(fallbackSections, preferredOrder);
  }

  const fallback = normalizeMdText(fallbackDescription);
  if (!fallback) return [];

  const firstId = preferredOrder[0] || "details";
  const section = createSection(firstId, canonicalSectionTitle(firstId), fallback);

  return section ? [section] : [];
}

function buildCategorySections(fields: SharePointCategoryFields): ContentSection[] {
  return buildStructuredSections(
    [
      { id: "details", title: "Detalles", body: fields.DetailsMd },
      { id: "types", title: "Tipos", body: fields.TypesMd },
      { id: "formats", title: "Formatos y soportes", body: fields.FormatsMd },
      { id: "finishes", title: "Acabados", body: fields.FinishesMd },
      { id: "uses", title: "Usos habituales", body: fields.UsesMd },
    ],
    CATEGORY_SECTION_ORDER
  );
}

function buildProductSections(fields: Record<string, unknown>): ContentSection[] {
  return buildStructuredSections(
    [
      { id: "details", title: "Detalles", body: fields.DetailsMd },
      { id: "benefits", title: "Beneficios", body: fields.BenefitsMd },
      { id: "materials", title: "Materiales", body: fields.MaterialsMd },
      { id: "formats", title: "Formatos y soportes", body: fields.FormatsMd },
      { id: "finishes", title: "Acabados", body: fields.FinishesMd },
      { id: "technical-specs", title: "Características técnicas", body: fields.TechnicalSpecsMd },
      { id: "applications", title: "Aplicaciones", body: fields.ApplicationsMd },
    ],
    PRODUCT_SECTION_ORDER
  );
}

function normalizeFormFields(raw: unknown): FormFieldDto[] {
  const parsed = parseJson<unknown[]>(raw, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const field = item as Record<string, unknown>;

      const name = toStr(field.name) || toStr(field.id) || `field_${index + 1}`;
      const label = toStr(field.label) || toStr(field.title) || name;
      const type = (toStr(field.type) || "text").toLowerCase();

      const options = Array.isArray(field.options)
        ? (field.options.map(toStr).filter(Boolean) as string[])
        : [];

      return {
        name,
        label,
        type,
        required: toBool(field.required),
        options,
        placeholder: toStr(field.placeholder),
        helpText: toStr(field.helpText || field.description),
        readonly: type === "select" && options.length <= 1,
      } satisfies FormFieldDto;
    })
    .filter(Boolean) as FormFieldDto[];
}

function parseFaqsJson(rawFaqs: unknown): FaqItem[] {
  if (Array.isArray(rawFaqs)) {
    return buildFaqs(rawFaqs);
  }

  let raw = normalizeLooseJsonString(rawFaqs);
  if (!raw) return [];

  raw = raw.replace(/^Preguntas frecuentes\s*/i, "").trim();
  raw = raw.replace(/^FAQS?\s*/i, "").trim();
  raw = raw.replace(/\n{2,}/g, "\n");
  raw = raw.replace(/“answer"/g, '"answer"');
  raw = raw.replace(/“question"/g, '"question"');
  raw = raw.replace(/"\s*(?="answer"\s*:)/g, '", ');
  raw = raw.replace(/"\s*(?="question"\s*:)/g, '", ');
  raw = raw.replace(/\}\s*\{/g, '},{');

  const parsed = parseJson<unknown[]>(raw, []);
  if (Array.isArray(parsed) && parsed.length) {
    const built = buildFaqs(parsed);
    if (built.length) return built;
  }

  const extracted: FaqItem[] = [];
  const pairRegex =
    /"question"\s*:\s*"([^"]+?)"\s*,?\s*"answer"\s*:\s*"([\s\S]*?)"\s*(?=\}\s*,?\s*\{|\}\s*\]?$)/g;

  for (const match of raw.matchAll(pairRegex)) {
    const question = cleanFaqText(match[1]);
    const answer = cleanFaqText(match[2]);
    if (question && answer) extracted.push({ question, answer });
  }

  return dedupeFaqs(extracted);
}

function cleanFaqText(value: unknown): string | undefined {
  const normalized = normalizeLooseJsonString(value)
    .replace(/\\"/g, '"')
    .replace(/^"+|"+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || undefined;
}

function buildFaqs(rawFaqs: unknown[]): FaqItem[] {
  return dedupeFaqs(
    rawFaqs
      .map((faq) => {
        const item = faq as {
          question?: unknown;
          q?: unknown;
          answer?: unknown;
          a?: unknown;
          pregunta?: unknown;
          respuesta?: unknown;
        };
        const question = cleanFaqText(item?.question || item?.q || item?.pregunta);
        const answer = cleanFaqText(item?.answer || item?.a || item?.respuesta);
        if (!question || !answer) return null;
        return { question, answer };
      })
      .filter(Boolean) as FaqItem[]
  );
}

function dedupeFaqs(items: FaqItem[]): FaqItem[] {
  const seen = new Set<string>();
  const output: FaqItem[] = [];

  for (const item of items) {
    const key = `${item.question}__${item.answer}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function validateCategory(category: CategoryDto): string[] {
  const issues: string[] = [];

  if (!category.slug) issues.push("missing slug");
  if (!category.path?.startsWith("/categorias/")) issues.push("invalid path");
  if (!category.seo?.canonical?.startsWith(SITE_URL)) issues.push("invalid canonical");
  if (!Array.isArray(category.sections)) issues.push("sections not array");
  if (!Array.isArray(category.seo?.hreflang) || category.seo.hreflang.length === 0) {
    issues.push("missing hreflang");
  }

  return issues;
}

function validateProduct(product: ProductDto): string[] {
  const issues: string[] = [];

  if (!product.slug) issues.push("missing slug");
  if (!product.path?.startsWith("/productos/")) issues.push("invalid path");
  if (!product.seo?.canonical?.startsWith(SITE_URL)) issues.push("invalid canonical");
  if (!Array.isArray(product.sections)) issues.push("sections not array");
  if (!product.categorySlug) issues.push("missing categorySlug");
  if (!Array.isArray(product.seo?.hreflang) || product.seo.hreflang.length === 0) {
    issues.push("missing hreflang");
  }

  return issues;
}

function compareByOrderThenTitle<T extends { order: number; title: string }>(a: T, b: T): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
}

function buildCategory(item: GraphItem<SharePointCategoryFields>): CategoryDto | null {
  const fields = item.fields || {};

  const pathHint = urlPathValue(fields.Path) || urlPathValue(fields.Canonical);
  let slug = slugLeaf(fields.CategorySlug) || slugLeaf(pathHint) || slugLeaf(fields.Canonical);

  if (!slug) {
    const schema = parseJson<Record<string, unknown> | null>(fields.SchemaJson, null);
    slug = slugLeaf(schema?.url);
  }

  if (!slug) return null;

  const title = toStr(fields.Title) || slug;
  const parentRaw = fields.ParentCategory ?? fields.ParentSlug;
  let parent = normalizeParentSlug(parentRaw, slug);

  if (!parent) {
    const inferred = inferParentFromPath(pathHint || fields.Canonical, slug);
    parent = normalizeParentSlug(inferred, slug);
  }

  const path = normalizeCategoryPath(pathHint, slug, parent);
  const canonicalUrl = toAbsoluteSiteUrl(fields.Canonical, path);
  const imageSrc =
    urlValue(fields.ImageSrc) ||
    urlValue(firstNonEmpty(fields as Record<string, unknown>, ["OgImageSrc", "OgImage"]));

  const description = toStr(fields.Description);
  const bodyMd = toStr(fields.BodyMd);

  const sections = buildSectionsStructuredFirst(
    buildCategorySections(fields),
    CATEGORY_SECTION_ORDER,
    bodyMd,
    description
  );

  const faqs = parseFaqsJson(fields.FaqsJson);
  const searchTerms = parseStringList(
    firstNonEmpty(fields as Record<string, unknown>, ["SearchTermsJson", "SearchTerms"])
  );

  const manualSchema: Record<string, JsonValue | undefined> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonicalUrl,
    image: imageSrc,
    publisher: {
      "@type": "Organization",
      name: "Repro Disseny",
    },
  };

  const spSchema = parseJson<Record<string, JsonValue | undefined>>(
    firstNonEmpty(fields as Record<string, unknown>, ["SchemaJson", "Schema"]),
    {}
  );

  return {
    id: String(item.id ?? slug),
    updatedAt: toStr(item.lastModifiedDateTime),
    type: parent ? "subcategoria" : "categoria",
    slug,
    path,
    title,
    nav: toStr(fields.NavLabel) || title,
    order: toNumber(firstNonEmpty(fields as Record<string, unknown>, ["SortOrder", "Order"])) ?? 0,
    parent,
    hidden: toBool(fields.IsHidden),
    featured: toBool(fields.IsFeatured),
    isPublished: toBool(firstNonEmpty(fields as Record<string, unknown>, ["IsPublished", "Published", "Visible"])),
    publishedAt: toStr(firstNonEmpty(fields as Record<string, unknown>, ["PublishedAt", "PublishDate"])),
    description,
    bodyMd,
    sections,
    image: {
      src: imageSrc,
      width: toNumber(firstNonEmpty(fields as Record<string, unknown>, ["ImageWidth", "Width"])),
      height: toNumber(firstNonEmpty(fields as Record<string, unknown>, ["ImageHeight", "Height"])),
      alt: toStr(firstNonEmpty(fields as Record<string, unknown>, ["ImageAlt", "Alt"])) || title,
    },
    cta: {
      text: toStr(fields.CtaText),
      link: sanitizeInternalLink(fields.CtaLink),
    },
    faqs,
    galleryImages: parseJson<unknown[]>(
      firstNonEmpty(fields as Record<string, unknown>, ["GalleryImagesJson", "GalleryJson"]),
      []
    ),
    breadcrumbs: normalizeBreadcrumbs(fields.BreadcrumbsJson),
    legacySlugs: uniq(
      parseStringList(firstNonEmpty(fields as Record<string, unknown>, ["LegacySlugsJson", "LegacySlugs"]))
        .map(normalizeSlug)
        .filter(Boolean) as string[]
    ),
    seo: {
      metaTitle: toStr(firstNonEmpty(fields as Record<string, unknown>, ["MetaTitle", "SeoTitle"])) || title,
      metaDescription:
        toStr(firstNonEmpty(fields as Record<string, unknown>, ["MetaDescription", "SeoDescription"])) || description,
      canonical: canonicalUrl,
      hreflang: normalizeHreflang(
        firstNonEmpty(fields as Record<string, unknown>, ["HrefLangJson", "HreflangJson"]),
        canonicalUrl
      ),
      keywords: parseStringList(firstNonEmpty(fields as Record<string, unknown>, ["KeywordsJson", "Keywords"])),
      searchTerms,
      schema: { ...manualSchema, ...spSchema },
      robotsOverride:
        toStr(firstNonEmpty(fields as Record<string, unknown>, ["RobotsOverride", "Robots"])) || "INHERIT",
      robotsAdvanced: toStr(firstNonEmpty(fields as Record<string, unknown>, ["RobotsAdvanced"])),
      ogImageSrc: urlValue(firstNonEmpty(fields as Record<string, unknown>, ["OgImageSrc", "OgImage"])) || imageSrc,
    },
  };
}

function buildProduct(item: GraphItem<SharePointProductFields>): ProductDto | null {
  const fields = (item.fields || {}) as Record<string, unknown>;

  const slugRaw = firstNonEmpty(fields, ["Slug", "ProductSlug", "PrimarySlug", "UrlSlug", "Handle"]);
  const slug = slugLeaf(slugRaw) || normalizeSlug(slugRaw);
  if (!slug) return null;

  const title = toStr(firstNonEmpty(fields, ["Title", "ProductTitle"], slug)) || slug;
  const canonicalSource = firstNonEmpty(fields, ["Canonical", "CanonicalUrl", "SeoCanonical"]);
  const pathSource = firstNonEmpty(fields, ["Path", "ProductPath", "UrlPath"]);
  const path = normalizeProductPath(pathSource, canonicalSource, slug);
  const canonicalUrl = toAbsoluteSiteUrl(canonicalSource, path);

  const imageSrc =
    urlValue(firstNonEmpty(fields, ["ImageSrc", "Image", "FeaturedImage"])) ||
    urlValue(firstNonEmpty(fields, ["OgImageSrc", "OgImage"]));

  const price = toPrice(firstNonEmpty(fields, ["Price", "BasePrice"]));
  const inStock = toBool(firstNonEmpty(fields, ["InStock", "Stock", "Available"]));

  const shortDescription =
    toStr(firstNonEmpty(fields, ["ShortDescription", "Excerpt", "Summary"])) || undefined;

  const bodyMd =
    toStr(firstNonEmpty(fields, ["BodyMd", "Body", "Markdown", "DescriptionMd"])) || undefined;

  const sections = buildSectionsStructuredFirst(
    buildProductSections(fields),
    PRODUCT_SECTION_ORDER,
    bodyMd,
    shortDescription ||
      toStr(firstNonEmpty(fields, ["MetaDescription", "SeoDescription"])) ||
      toStr(firstNonEmpty(fields, ["Description"]))
  );

  const description =
    shortDescription ||
    toStr(firstNonEmpty(fields, ["MetaDescription", "SeoDescription"])) ||
    toStr(firstNonEmpty(fields, ["Description"])) ||
    (sections[0]?.body ? String(sections[0].body).split("\n")[0]?.trim() : undefined);

  const faqs = parseFaqsJson(firstNonEmpty(fields, ["FaqsJson", "FaqJson", "FAQsJson"]));

  const primaryCategoryRaw = firstNonEmpty(fields, [
    "PrimaryCategory",
    "CategorySlug",
    "Category",
    "PrimaryCategorySlug",
  ]);

  const primaryCategory = slugLeaf(primaryCategoryRaw) || normalizeSlug(primaryCategoryRaw) || "";

  const extraCategories = parseStringList(firstNonEmpty(fields, ["Categories", "SecondaryCategories"]))
    .map((value) => slugLeaf(value) || normalizeSlug(value))
    .filter(Boolean) as string[];

  const categorySlugs = uniq([primaryCategory, ...extraCategories].filter(Boolean));
  const categorySlug = primaryCategory || categorySlugs[0] || "";

  const searchTerms = parseStringList(firstNonEmpty(fields, ["SearchTermsJson", "SearchTerms"]));

  const baseSchema: Record<string, JsonValue | undefined> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: imageSrc,
    url: canonicalUrl,
    sku: toStr(firstNonEmpty(fields, ["Sku", "SKU"])),
    brand: {
      "@type": "Organization",
      name: toStr(firstNonEmpty(fields, ["Brand", "Marca"])) || "Reprodisseny",
    },
  };

  if (price > 0) {
    baseSchema.offers = {
      "@type": "Offer",
      price,
      priceCurrency: toStr(firstNonEmpty(fields, ["PriceCurrency", "Currency"])) || "EUR",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    };
  }

  const ratingValue = toPrice(firstNonEmpty(fields, ["RatingValue", "Rating"]));
  const reviewCount = toNumber(firstNonEmpty(fields, ["ReviewCount", "Reviews"]));

  if (ratingValue > 0 && reviewCount && reviewCount > 0) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    };
  }

  const spSchema = parseJson<Record<string, JsonValue | undefined>>(
    firstNonEmpty(fields, ["SchemaJson", "Schema"]),
    {}
  );

  const noIndex = toBool(firstNonEmpty(fields, ["NoIndex", "Noindex"]));

  return {
    id: String(item.id ?? slug),
    updatedAt: toStr(item.lastModifiedDateTime),
    type: "producto",
    slug,
    path,
    title,
    categorySlug,
    categorySlugs,
    order: toNumber(firstNonEmpty(fields, ["SortOrder", "Order"])) ?? 0,
    isPublished: toBool(firstNonEmpty(fields, ["IsPublished", "Published", "Visible"])),
    publishedAt: toStr(firstNonEmpty(fields, ["PublishedAt", "PublishDate"])),
    shortDescription,
    description,
    bodyMd,
    sections,
    faqs,
    image: {
      src: imageSrc,
      width: toNumber(firstNonEmpty(fields, ["ImageWidth", "Width"])),
      height: toNumber(firstNonEmpty(fields, ["ImageHeight", "Height"])),
      alt: toStr(firstNonEmpty(fields, ["ImageAlt", "Alt"])) || title,
    },
    galleryImages: parseJson<unknown[]>(firstNonEmpty(fields, ["GalleryImagesJson", "GalleryJson"]), []),
    sku: toStr(firstNonEmpty(fields, ["Sku", "SKU"])),
    mpn: toStr(firstNonEmpty(fields, ["Mpn", "MPN"])),
    gtin13: toStr(firstNonEmpty(fields, ["Gtin13", "GTIN13", "Ean13"])),
    brand: toStr(firstNonEmpty(fields, ["Brand", "Marca"])),
    price,
    priceCurrency: toStr(firstNonEmpty(fields, ["PriceCurrency", "Currency"])) || "EUR",
    inStock,
    ratingValue: ratingValue > 0 ? ratingValue : undefined,
    reviewCount: reviewCount && reviewCount > 0 ? reviewCount : undefined,
    attributes: parseJson<unknown[]>(firstNonEmpty(fields, ["AttributesJson", "Attributes"]), []),
    variants: parseJson<unknown[]>(firstNonEmpty(fields, ["VariantsJson", "Variants"]), []),
    formFields: normalizeFormFields(firstNonEmpty(fields, ["FormFieldsJson", "FormFields"])),
    legacySlugs: uniq(
      parseStringList(firstNonEmpty(fields, ["LegacySlugsJson", "LegacySlugs"]))
        .map(normalizeSlug)
        .filter(Boolean) as string[]
    ),
    seo: {
      metaTitle: toStr(firstNonEmpty(fields, ["MetaTitle", "SeoTitle"])) || title,
      metaDescription:
        toStr(firstNonEmpty(fields, ["MetaDescription", "SeoDescription"])) || description,
      canonical: canonicalUrl,
      hreflang: normalizeHreflang(firstNonEmpty(fields, ["HrefLangJson", "HreflangJson"]), canonicalUrl),
      keywords: parseStringList(firstNonEmpty(fields, ["KeywordsJson", "Keywords"])),
      searchTerms,
      schema: { ...baseSchema, ...spSchema },
      robotsOverride: noIndex ? "NOINDEX" : toStr(firstNonEmpty(fields, ["RobotsOverride", "Robots"])) || "INHERIT",
      robotsAdvanced: toStr(firstNonEmpty(fields, ["RobotsAdvanced"])),
      ogImageSrc: urlValue(firstNonEmpty(fields, ["OgImageSrc", "OgImage"])) || imageSrc,
    },
  };
}

function findDuplicates(items: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();

  for (const item of items) {
    if (!item) continue;
    if (seen.has(item)) dup.add(item);
    else seen.add(item);
  }

  return [...dup];
}

async function run(): Promise<void> {
  console.log("Starting CMS sync...");

  const categoryFields = [
    "Title",
    "CategorySlug",
    "NavLabel",
    "SortOrder",
    "ParentCategory",
    "ParentSlug",
    "IsFeatured",
    "IsHidden",
    "IsPublished",
    "PublishedAt",

    "Description",
    "BodyMd",
    "DetailsMd",
    "TypesMd",
    "FormatsMd",
    "UsesMd",
    "FinishesMd",

    "ImageSrc",
    "ImageWidth",
    "ImageHeight",
    "ImageAlt",
    "GalleryImagesJson",
    "BreadcrumbsJson",
    "CtaText",
    "CtaLink",
    "Path",
    "LegacySlugsJson",
    "LegacySlugs",
    "MetaTitle",
    "SeoTitle",
    "MetaDescription",
    "SeoDescription",
    "Canonical",
    "HrefLangJson",
    "HreflangJson",
    "KeywordsJson",
    "Keywords",
    "SearchTermsJson",
    "SearchTerms",
    "FaqsJson",
    "SchemaJson",
    "Schema",
    "RobotsOverride",
    "Robots",
    "RobotsAdvanced",
    "OgImageSrc",
    "OgImage",
  ];

  const productFields = [
    "Title",
    "ProductTitle",
    "Slug",
    "ProductSlug",
    "PrimarySlug",
    "UrlSlug",
    "Handle",
    "Path",
    "ProductPath",
    "UrlPath",
    "PrimaryCategory",
    "CategorySlug",
    "Category",
    "PrimaryCategorySlug",
    "Categories",
    "SecondaryCategories",
    "SortOrder",
    "Order",
    "IsPublished",
    "Published",
    "Visible",
    "PublishedAt",
    "PublishDate",

    "ShortDescription",
    "Excerpt",
    "Summary",
    "Description",

    "BodyMd",
    "Body",
    "Markdown",
    "DescriptionMd",

    "DetailsMd",
    "BenefitsMd",
    "MaterialsMd",
    "FormatsMd",
    "FinishesMd",
    "TechnicalSpecsMd",
    "ApplicationsMd",

    "FaqsJson",
    "FaqJson",
    "FAQsJson",

    "ImageSrc",
    "Image",
    "FeaturedImage",
    "ImageWidth",
    "Width",
    "ImageHeight",
    "Height",
    "ImageAlt",
    "Alt",
    "GalleryImagesJson",
    "GalleryJson",

    "Sku",
    "SKU",
    "Mpn",
    "MPN",
    "Gtin13",
    "GTIN13",
    "Ean13",
    "Brand",
    "Marca",
    "Price",
    "BasePrice",
    "PriceCurrency",
    "Currency",
    "InStock",
    "Stock",
    "Available",
    "RatingValue",
    "Rating",
    "ReviewCount",
    "Reviews",

    "AttributesJson",
    "Attributes",
    "VariantsJson",
    "Variants",
    "FormFieldsJson",
    "FormFields",

    "MetaTitle",
    "SeoTitle",
    "MetaDescription",
    "SeoDescription",
    "Canonical",
    "CanonicalUrl",
    "SeoCanonical",
    "HrefLangJson",
    "HreflangJson",
    "KeywordsJson",
    "Keywords",
    "SearchTermsJson",
    "SearchTerms",
    "SchemaJson",
    "Schema",
    "LegacySlugsJson",
    "LegacySlugs",
    "NoIndex",
    "Noindex",
    "RobotsOverride",
    "Robots",
    "RobotsAdvanced",
    "OgImageSrc",
    "OgImage",
  ];

  const [catItems, prodItems] = await Promise.all([
    fetchAllItems<SharePointCategoryFields>(SP_LIST_CATEGORIES_ID!, categoryFields),
    fetchAllItems<SharePointProductFields>(SP_LIST_PRODUCTS_ID!, productFields),
  ]);

  if (prodItems.length) {
    const firstProductFields = (prodItems[0]?.fields || {}) as Record<string, unknown>;
    console.log("   Raw product items:", prodItems.length);
    console.log(
      "   Product field keys sample:",
      Object.keys(firstProductFields).sort().slice(0, 40).join(", ")
    );
  } else {
    console.warn("   No raw product items returned by Graph.");
  }

  const categoriesAll = catItems.map(buildCategory).filter(Boolean) as CategoryDto[];
  const categories = categoriesAll.filter((category) => category.isPublished).sort(compareByOrderThenTitle);

  const productsAll = prodItems.map(buildProduct).filter(Boolean) as ProductDto[];
  const products = productsAll.filter((product) => product.isPublished).sort(compareByOrderThenTitle);

  const productsMissingSlug = prodItems.length - productsAll.length;
  const productsUnpublished = productsAll.length - products.length;

  console.log("   Product diagnostics:", {
    raw: prodItems.length,
    built: productsAll.length,
    published: products.length,
    missingSlug: productsMissingSlug,
    unpublished: productsUnpublished,
  });

  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const orphans = categories.filter((category) => category.parent && !bySlug.has(category.parent));

  await fs.mkdir("cms", { recursive: true });

  if (orphans.length) {
    await fs.writeFile(
      "cms/orphan-categories.json",
      JSON.stringify(
        orphans.map((orphan) => ({
          slug: orphan.slug,
          parent: orphan.parent,
          title: orphan.title,
        })),
        null,
        2
      ),
      "utf8"
    );

    console.warn(
      "⚠️ Orphan categories (parent not found):",
      orphans.map((orphan) => `${orphan.slug} -> ${orphan.parent}`)
    );
  }

  const dupCat = findDuplicates(categories.map((category) => category.slug));
  const dupProd = findDuplicates(products.map((product) => product.slug));

  if (dupCat.length || dupProd.length) {
    const report = { dupCat, dupProd };
    await fs.writeFile("cms/slug-collisions.json", JSON.stringify(report, null, 2), "utf8");
    console.error("⛔ Slug collisions detected:", report);
  }

  const categoryValidation = categories
    .map((category) => ({ slug: category.slug, issues: validateCategory(category) }))
    .filter((item) => item.issues.length > 0);

  const productValidation = products
    .map((product) => ({ slug: product.slug, issues: validateProduct(product) }))
    .filter((item) => item.issues.length > 0);

  if (categoryValidation.length || productValidation.length) {
    await fs.writeFile(
      "cms/validation-report.json",
      JSON.stringify(
        {
          categories: categoryValidation,
          products: productValidation,
        },
        null,
        2
      ),
      "utf8"
    );

    console.warn("⚠️ Validation report generated: cms/validation-report.json");
  }

  const routes = uniq([
    ...categories.map((category) => category.path),
    ...products.map((product) => product.path),
  ]).sort();

  const catalog: SyncCatalog = {
    generatedAt: new Date().toISOString(),
    categories,
    products,
  };

  await fs.writeFile("cms/catalog.json", JSON.stringify(catalog, null, 2), "utf8");
  await fs.writeFile("cms/routes.json", JSON.stringify(routes, null, 2), "utf8");

  console.log("✅ CMS sync OK.");
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products:   ${products.length}`);
  console.log(`   Routes:     ${routes.length}`);
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Sync failed:", message);
  process.exit(1);
});