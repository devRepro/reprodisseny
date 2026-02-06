import { defineEventHandler, getRouterParam, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const s = (v: any) => String(v ?? "").trim()
const norm = (v: any) => s(v).toLowerCase()
const imgSrc = (x: any) => (typeof x === "string" ? x : x?.src) || null

export default defineEventHandler(async (event) => {
  const slug = norm(getRouterParam(event, "slug"))
  if (!slug) {
    throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" })
  }

  const { products } = await getCmsCatalog()

  const raw = (products || []).find((p: any) => {
    return norm(p.slug) === slug && p?.isPublished !== false && p?.hidden !== true
  })

  if (!raw) {
    throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" })
  }

  // Normaliza campos importantes para el front
  const path = raw.path || (raw.slug ? `/productos/${raw.slug}` : "/productos")

  return {
    ...raw, // si quieres mantener todo lo extra (tabs, schema, etc.)
    slug: raw.slug,
    path,
    image: imgSrc(raw.image)
      ? {
          src: imgSrc(raw.image),
          alt: raw.image?.alt ?? raw.title ?? "",
          width: raw.image?.width ?? 1200,
          height: raw.image?.height ?? 1200,
        }
      : null,
  }
})
