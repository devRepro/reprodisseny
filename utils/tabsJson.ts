export type TabBlock =
  | { type: "bullets"; items: string[] }
  | { type: "text"; format?: "plain"; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: string; [k: string]: any } // futuros tipos

export type NormalizedTab = { title: string; blocks: TabBlock[] }

const s = (v: any) => String(v ?? "").trim()

function stripTrailingCommas(str: string) {
  // tolera ",]" o ",}" (muy típico al pegar JSON a mano)
  return str.replace(/,\s*([}\]])/g, "$1")
}

export function parseTabsJson(input: unknown): any[] {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (typeof input !== "string") return []
  const raw = input.trim()
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    try {
      return JSON.parse(stripTrailingCommas(raw))
    } catch {
      return []
    }
  }
}

function normalizeBlock(b: any): TabBlock | null {
  if (!b || typeof b !== "object") return null
  const type = s(b.type).toLowerCase()

  if (type === "bullets") {
    const items = (Array.isArray(b.items) ? b.items : []).map((x: any) => s(x)).filter(Boolean)
    return items.length ? { type: "bullets", items } : null
  }

  if (type === "text") {
    const text = s(b.text)
    return text ? { type: "text", format: "plain", text } : null
  }

  if (type === "image") {
    const src = s(b.src)
    if (!src) return null
    return { type: "image", src, alt: s(b.alt) || undefined, caption: s(b.caption) || undefined }
  }

  // tipos futuros: no rompen
  return { type, ...b }
}

export function normalizeTabs(raw: unknown): NormalizedTab[] {
  const arr = Array.isArray(raw) ? raw : []

  return arr
    .map((t: any) => {
      const title = s(t?.title ?? t?.label ?? t?.name)
      if (!title) return null

      // Formato nuevo: blocks
      if (Array.isArray(t?.blocks)) {
        const blocks = t.blocks.map(normalizeBlock).filter(Boolean) as TabBlock[]
        // si no quieres devolver bloques desconocidos aún, filtra aquí por tipos conocidos
        const renderable = blocks.filter((b) => ["bullets", "text", "image"].includes(String(b.type)))
        return renderable.length ? { title, blocks: renderable } : null
      }

      // Formato legacy: bullets/items/points al nivel del tab
      const legacy = Array.isArray(t?.bullets) ? t.bullets : Array.isArray(t?.items) ? t.items : t?.points
      if (Array.isArray(legacy)) {
        const items = legacy.map((x: any) => s(x)).filter(Boolean)
        return items.length ? { title, blocks: [{ type: "bullets", items }] } : null
      }

      return null
    })
    .filter(Boolean) as NormalizedTab[]
}
