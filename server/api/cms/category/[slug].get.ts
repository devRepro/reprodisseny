// server/api/cms/category/[...slug].get.ts
import { defineEventHandler, getRouterParam, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

// --- helpers (robustos con tu JSON actual) ---
function cleanAfterComma(v: unknown) {
  const s = String(v ?? "").trim()
  if (!s) return ""
  return s.split(",")[0].trim()
}

function normalizePath(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  if (!s.startsWith("/")) s = "/" + s
  s = s.replace(/\/{2,}/g, "/")               // // -> /
  s = s.replace(/^\/categorias\/categorias\//, "/categorias/") // dup
  return s.replace(/\/+$/, "")
}

function normalizeSlug(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  s = s.replace(/^\/categorias\//, "") // quita prefijo si viene mal
  s = s.replace(/^\/+|\/+$/g, "")
  return s
}

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, "slug") || ""
  const slugParts = raw.split("/").filter(Boolean)
  const wantedPath = normalizePath("/categorias/" + slugParts.join("/"))
  const wantedSlug = normalizeSlug(slugParts[slugParts.length - 1] || "")

  const { categories, products } = await getCmsCatalog()

  const category = (categories || []).find((c: any) => {
    const cPath = normalizePath(c?.path)
    const cSlug = normalizeSlug(c?.slug)
    return cPath === wantedPath || cSlug === wantedSlug
  })

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" })
  }

  // Normaliza imágenes (tu JSON guarda "url, texto")
  const imageSrc = cleanAfterComma(category?.image?.src || category?.imageSrc || "")
  const ctaLink = cleanAfterComma(category?.cta?.link || "")

  // (Opcional) Productos de la categoría (según tu catálogo: product.categorySlug) :contentReference[oaicite:3]{index=3}
  const slugKey = normalizeSlug(category?.slug)
  const categoryProducts = (products || []).filter((p: any) => normalizeSlug(p?.categorySlug) === slugKey)

  return {
    ...category,
    imageSrc,
    cta: category?.cta
      ? { ...category.cta, link: ctaLink }
      : null,
    // normaliza también faqs (tu JSON usa "faqs") :contentReference[oaicite:4]{index=4}
    faqs: Array.isArray(category?.faqs) ? category.faqs : [],
    products: categoryProducts,
  }
})
