// server/utils/cmsCatalog.server.ts
import { readFile, stat } from "node:fs/promises"
import { join } from "node:path"
import { transformCategoryToTabs } from "~/shared/utils/cms/transformCategoryTabs"

type CmsCatalog = {
  categories: any[]
  products: any[]
  __index?: {
    byPath: Map<string, any>
    bySlug: Map<string, any>
  }
}

let cache: CmsCatalog | null = null
let cacheAt = 0
let cacheMtimeMs = 0

const DEV_TTL_MS = 5_000
const PROD_TTL_MS = 60_000

function normSlug(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  s = s.replace(/^\/+/, "")
  s = s.replace(/^\/?categorias\//i, "")
  s = s.replace(/^categorias\//i, "")
  s = s.replace(/^\/+|\/+$/g, "")
  return s
}

function normPath(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  if (!s.startsWith("/")) s = "/" + s
  s = s.replace(/\/{2,}/g, "/")
  if (!s.startsWith("/categorias/")) s = "/categorias/" + s.replace(/^\/+/, "")
  return s.replace(/\/+$/, "")
}

function normCategorySlug(v: unknown) {
  return String(v ?? "").trim().toLowerCase()
}

function parseCategoriesValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(normCategorySlug).filter(Boolean)
  }

  if (typeof value !== "string") return []

  const raw = value.trim()
  if (!raw) return []

  // JSON válido: ["eventos","expositores"]
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map(normCategorySlug).filter(Boolean)
    }
  } catch {
    // fallback para formatos legacy tipo ['eventos';'expositores']
  }

  return raw
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/"/g, "")
    .replace(/'/g, "")
    .split(/[;,]/)
    .map((v) => normCategorySlug(v))
    .filter(Boolean)
}

function uniqueStrings(values: unknown[]) {
  return [...new Set(values.map(normCategorySlug).filter(Boolean))]
}

function firstNonEmpty(obj: any, keys: string[], fallback: any = undefined) {
  for (const k of keys) {
    const v = obj?.[k]
    if (v !== undefined && v !== null && String(v).trim() !== "") return v
  }
  return fallback
}

function toNum(v: any): number | undefined {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim())
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function mapCategoryToFields(c: any) {
  return {
    Title: firstNonEmpty(c, ["Title", "title", "name", "NavLabel", "nav"], ""),
    Description: firstNonEmpty(c, ["Description", "description"], ""),
    BodyMd: firstNonEmpty(c, ["BodyMd", "bodyMd", "body", "markdown"], ""),
    ImageSrc: firstNonEmpty(c, ["ImageSrc", "imageSrc"], "") || c?.image?.src || "",
    ImageAlt: firstNonEmpty(c, ["ImageAlt", "imageAlt", "alt"], "") || c?.image?.alt || "",
    ImageWidth: toNum(firstNonEmpty(c, ["ImageWidth", "imageWidth"], undefined)) || toNum(c?.image?.width),
    ImageHeight: toNum(firstNonEmpty(c, ["ImageHeight", "imageHeight"], undefined)) || toNum(c?.image?.height),
    GalleryImagesJson: firstNonEmpty(c, ["GalleryImagesJson", "galleryImagesJson", "gallery"], null),

    // 🔴 TabsJson se ignora totalmente
    TabsJson: "",
  }
}

function hydrateCategory(c: any) {
  const fallbackPath = c?.slug ? `/categorias/${normSlug(c.slug)}` : (c?.path || "")
  c.path = normPath(c?.path || fallbackPath)

  // ✅ tabs SOLO desde BodyMd (ignora TabsJson)
  const fields = mapCategoryToFields(c)
  c.tabs = transformCategoryToTabs(fields, {
    bodyMdOnly: true,
    ignoreTabsJson: true,
    includeIntroTab: false,     // evita duplicar Description si ya la enseñas arriba
    includeGalleryTab: true,
    singleTabTitle: "Contenido",
  })

  return c
}

function buildIndex(categories: any[]) {
  const byPath = new Map<string, any>()
  const bySlug = new Map<string, any>()

  for (const c of categories) {
    if (!c) continue
    const pathKey = normPath(c?.path)
    if (pathKey && !byPath.has(pathKey)) byPath.set(pathKey, c)

    const mainSlug = normSlug(c?.slug)
    if (mainSlug && !bySlug.has(mainSlug)) bySlug.set(mainSlug, c)

    const legacy = Array.isArray(c?.legacySlugs) ? c.legacySlugs.map(normSlug) : []
    for (const ls of legacy) if (ls && !bySlug.has(ls)) bySlug.set(ls, c)

    const extra = Array.isArray(c?.slugs) ? c.slugs.map(normSlug) : []
    for (const es of extra) if (es && !bySlug.has(es)) bySlug.set(es, c)
  }

  return { byPath, bySlug }
}

function normalizeProduct(p: any) {
  const primaryCategory = normCategorySlug(
    firstNonEmpty(p, ["primaryCategory", "PrimaryCategory"], "")
  )

  // Categories = categorías secundarias
  const secondaryCategories = parseCategoriesValue(
    firstNonEmpty(p, ["categories", "Categories"], [])
  ).filter((slug) => slug !== primaryCategory)

  const categorySlugs = uniqueStrings([
    primaryCategory,
    ...secondaryCategories,
  ])

  return {
    ...p,
    primaryCategory,
    categories: secondaryCategories,
    categorySlugs,
  }
}

function prepareCatalog(raw: any): CmsCatalog {
  const categories = Array.isArray(raw?.categories) ? raw.categories : []
  const productsRaw = Array.isArray(raw?.products) ? raw.products : []

  for (const c of categories) hydrateCategory(c)

  const products = productsRaw.map(normalizeProduct)

  const out: CmsCatalog = { categories, products }
  Object.defineProperty(out, "__index", {
    value: buildIndex(categories),
    enumerable: false,
    writable: false,
    configurable: false,
  })
  return out
}

export async function getCmsCatalog(): Promise<CmsCatalog> {
  const isDev = process.env.NODE_ENV !== "production"
  const ttl = isDev ? DEV_TTL_MS : PROD_TTL_MS
  const filePath = join(process.cwd(), "cms", "catalog.json")

  // ✅ si hay cache y aún está dentro del TTL, pero el archivo cambió → recarga
  if (cache && Date.now() - cacheAt < ttl) {
    try {
      const st = await stat(filePath)
      if (st.mtimeMs <= cacheMtimeMs) return cache
      // si cambió, caemos y recargamos
    } catch {
      // si stat falla, mejor recargar para dar error claro
    }
  }

  try {
    const st = await stat(filePath)
    const raw = await readFile(filePath, "utf8")
    const parsed = JSON.parse(raw)

    cache = prepareCatalog(parsed)
    cacheAt = Date.now()
    cacheMtimeMs = st.mtimeMs
    return cache
  } catch (e: any) {
    const msg =
      e?.code === "ENOENT"
        ? "No existe cms/catalog.json. ¿Has ejecutado el script de sync?"
        : `Error leyendo cms/catalog.json: ${e?.message || String(e)}`
    throw new Error(msg)
  }
}

export function clearCmsCatalogCache() {
  cache = null
  cacheAt = 0
  cacheMtimeMs = 0
}