import { defineEventHandler, getQuery, createError } from "h3"
import { useStorage } from "#imports"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

type Kind = "producto" | "categoria"
type SuggestItem = {
  id: string
  kind: Kind
  title: string
  href: string
  image?: string | null
}

type SuggestResponse = { q: string; items: SuggestItem[] }

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const s = (v: any) => String(v ?? "").trim()

function normText(v: any) {
  return s(v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

function clampInt(v: any, fallback: number, min: number, max: number) {
  const x = parseInt(String(v ?? ""), 10)
  if (!Number.isFinite(x)) return fallback
  return Math.max(min, Math.min(max, x))
}

// ranking simple: empieza por término > contiene
function score(title: string, term: string) {
  const t = normText(title)
  if (!t) return 0
  if (t.startsWith(term)) return 100
  if (t.includes(term)) return 50
  return 0
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as { q?: string; limit?: string; force?: string }

  const termRaw = s(q.q)
  const term = normText(termRaw)
  const limit = clampInt(q.limit, 8, 1, 30)
  const force = q.force === "1"

  if (!termRaw) return { q: "", items: [] } satisfies SuggestResponse

  const storage = useStorage("cache")
  const cacheKey = `search:suggest:${term}:${limit}`
  if (!force) {
    const cached = await storage.getItem<SuggestResponse>(cacheKey)
    if (cached) return cached
  }

  const { categories, products } = await getCmsCatalog()
  if (!categories && !products) throw createError({ statusCode: 500, statusMessage: "Catalog not available" })

  // filtra como en catalog.get.ts (publicados y no ocultos)
  const cats = (categories ?? [])
    .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
    .filter((c: any) => c?.showInNav !== false)

  const prods = (products ?? [])
    .filter((p: any) => p?.isPublished !== false && p?.hidden !== true)

  // score + sort
  const catMatches = cats
    .map((c: any) => {
      const title = s(c.title)
      return {
        score: score(title, term),
        item: {
          id: s(c.id || c.slug || c.path),
          kind: "categoria" as const,
          title,
          href: s(c.path || `/categorias/${c.slug}`),
          image: (typeof c.image === "string" ? c.image : c.image?.src) || null,
        },
      }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || n(a.item.title.localeCompare(b.item.title)))
    .map((x) => x.item)

  const prodMatches = prods
    .map((p: any) => {
      const title = s(p.title)
      return {
        score: score(title, term),
        item: {
          id: s(p.id || p.slug || p.path),
          kind: "producto" as const,
          title,
          href: s(p.path || `/productos/${p.slug}`),
          image: (typeof p.image === "string" ? p.image : p.image?.src) || null,
        },
      }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || n(a.item.title.localeCompare(b.item.title)))
    .map((x) => x.item)

  // mezcla: productos primero (como TruYol)
  const items: SuggestItem[] = [...prodMatches, ...catMatches].slice(0, limit)

  const payload: SuggestResponse = { q: termRaw, items }
  await storage.setItem(cacheKey, payload, { ttl: 60 * 5 }) // 5 min
  return payload
})
