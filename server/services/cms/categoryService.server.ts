// server/services/cms/categoryService.server.ts
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

export type CategoryAction = { title: string; image: string; to?: string }
export type CategoryTab = { title: string; bullets: string[]; image?: string }
export type FaqItem = { q: string; a: string }

export type CategoryPage = {
  id: string
  slug: string
  path: string
  title: string
  excerpt?: string
  heroImage?: string

  introTitle?: string

  actions: CategoryAction[]
  tabs: CategoryTab[]
  faq: FaqItem[]
  relatedWorks: string[]
}

// --- safe json helpers ---
function parseJsonArray<T>(v: unknown, fallback: T[] = []): T[] {
  if (!v) return fallback
  if (Array.isArray(v)) return v as T[]
  if (typeof v === "string") {
    const s = v.trim()
    if (!s) return fallback
    try {
      const x = JSON.parse(s)
      return Array.isArray(x) ? (x as T[]) : fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

const pick = (o: any, keys: string[]) => {
  for (const k of keys) {
    const v = o?.[k]
    if (v !== undefined && v !== null && String(v).trim() !== "") return v
  }
  return undefined
}

export async function getCategoryPageBySlug(slug: string): Promise<CategoryPage | null> {
  const { categories } = await getCmsCatalog()

  const raw = (categories || []).find(
    (c: any) => c?.slug === slug && c?.isPublished !== false && c?.hidden !== true
  )
  if (!raw) return null

  // NOTE: Map your catalog.json fields to what the UI needs.
  const id = String(pick(raw, ["id", "Id", "ID"]) ?? "")
  const title = String(pick(raw, ["title", "Title", "name", "Name"]) ?? "")
  const excerpt = String(pick(raw, ["excerpt", "Excerpt", "summary", "Summary"]) ?? "")
  const heroImage = String(pick(raw, ["heroImage", "HeroImage", "image", "Image"]) ?? "")
  const path = String(pick(raw, ["path"]) ?? `/categorias/${slug}`)

  const introTitle = String(
    pick(raw, ["introTitle", "IntroTitle"]) ??
      "Impresión de libros, revistas y catálogos. Elementos clave en la estrategia de comunicación."
  )

  // Recommended: store these blocks as JSON strings in catalog.json
  const actions = parseJsonArray<CategoryAction>(pick(raw, ["actionsJson", "ActionsJson", "actions", "Actions"]))
  const tabs = parseJsonArray<CategoryTab>(pick(raw, ["tabsJson", "TabsJson", "tabs", "Tabs"]))
  const faq = parseJsonArray<FaqItem>(pick(raw, ["faqJson", "FaqJson", "faq", "Faq"]))
  const relatedWorks = parseJsonArray<string>(pick(raw, ["relatedWorksJson", "RelatedWorksJson", "relatedWorks", "RelatedWorks"]))

  return {
    id,
    slug,
    path,
    title,
    excerpt,
    heroImage,
    introTitle,
    actions,
    tabs,
    faq,
    relatedWorks,
  }
}
