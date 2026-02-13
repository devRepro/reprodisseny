// utils/tabsJson.ts

export type TabBlock =
  | { type: "bullets"; items: string[] }
  | { type: "text"; format?: "plain" | "html"; text: string; html?: boolean }
  | { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number }
  | { type: string; [k: string]: any } // futuros tipos

export type NormalizedTab = { id?: string; title: string; blocks: TabBlock[] }

const s = (v: any) => String(v ?? "").trim()
const stripHtml = (str: string) => str.replace(/<\/?[^>]+>/g, "").trim()

function stripTrailingCommas(str: string) {
  // tolera ",]" o ",}" (muy típico al pegar JSON a mano)
  return str.replace(/,\s*([}\]])/g, "$1")
}

export function parseTabsJson(input: unknown): any[] {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (typeof input !== "string") return []

  const raw = stripHtml(input.trim())
  if (!raw) return []

  const tryParse = (str: string): any[] => {
    const v = JSON.parse(str)
    // Caso 1: ya es array
    if (Array.isArray(v)) return v
    // Caso 2: doble-stringify -> devuelve string con JSON dentro
    if (typeof v === "string") return parseTabsJson(v)
    return []
  }

  try {
    return tryParse(raw)
  } catch {
    try {
      return tryParse(stripTrailingCommas(raw))
    } catch {
      return []
    }
  }
}

function normalizeBlock(b: any, fallbackAlt?: string): TabBlock | null {
  if (!b || typeof b !== "object") return null
  const type = s(b.type).toLowerCase()

  if (type === "bullets") {
    const items = (Array.isArray(b.items) ? b.items : []).map((x: any) => s(x)).filter(Boolean)
    return items.length ? { type: "bullets", items } : null
  }

  if (type === "text") {
    const text = s(b.text)
    if (!text) return null
    const format = (b.format === "html" || b.html === true) ? "html" : "plain"
    return { type: "text", format, text, html: format === "html" ? true : undefined }
  }

  if (type === "image") {
    const src = s(b.src)
    if (!src) return null
    const alt = s(b.alt) || fallbackAlt || undefined
    return {
      type: "image",
      src,
      alt,
      caption: s(b.caption) || undefined,
      width: Number(b.width) || undefined,
      height: Number(b.height) || undefined,
    }
  }

  // tipos futuros: no rompen
  return { type, ...b }
}

export function normalizeTabs(raw: unknown): NormalizedTab[] {
  // Acepta array o string JSON (TabsJson)
  const arr = Array.isArray(raw) ? raw : typeof raw === "string" ? parseTabsJson(raw) : []

  return arr
    .map((t: any, idx: number) => {
      const title = s(t?.title ?? t?.label ?? t?.name)
      if (!title) return null

      const id = s(t?.id) || `tab-${idx}`

      // Formato nuevo: blocks / content
      const blocksRaw = Array.isArray(t?.blocks) ? t.blocks : Array.isArray(t?.content) ? t.content : null
      if (blocksRaw) {
        const blocks = blocksRaw
          .map((b: any) => normalizeBlock(b, title))
          .filter(Boolean) as TabBlock[]

        // Solo renderizables (si quieres permitir futuros, quita este filtro)
        const renderable = blocks.filter((b) => ["bullets", "text", "image"].includes(String(b.type)))
        return renderable.length ? { id, title, blocks: renderable } : null
      }

      // Formato legacy: bullets/items/points al nivel del tab
      const legacy = Array.isArray(t?.bullets) ? t.bullets : Array.isArray(t?.items) ? t.items : t?.points
      if (Array.isArray(legacy)) {
        const items = legacy.map((x: any) => s(x)).filter(Boolean)
        return items.length ? { id, title, blocks: [{ type: "bullets", items }] } : null
      }

      return null
    })
    .filter(Boolean) as NormalizedTab[]
}
