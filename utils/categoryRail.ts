// utils/categoryRail.ts
export type TextBlock = { type: "text"; text: string; html?: boolean; format?: "plain" | "html" }
export type BulletsBlock = { type: "bullets"; items: string[] }
export type ImageBlock = { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number }
export type Block = TextBlock | BulletsBlock | ImageBlock | { type: string; [k: string]: any }

export type Tab = { id?: string; title: string; blocks?: Block[]; content?: Block[] }
export type EnhancedTab = { id: string; title: string; _blocks: Block[]; excerpt?: string; thumb?: ImageBlock }

export function slugify(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

export function isHtmlTextBlock(b: Block): b is TextBlock {
  return b.type === "text" && ((b as any).html === true || (b as any).format === "html")
}

export function pickThumb(blocks: Block[]): ImageBlock | undefined {
  return blocks.find((b) => b?.type === "image" && (b as any).src) as ImageBlock | undefined
}

export function pickExcerpt(blocks: Block[]): string | undefined {
  const t = blocks.find((b) => b?.type === "text" && String((b as any).text || "").trim()) as TextBlock | undefined
  if (t && !isHtmlTextBlock(t)) {
    const s = String(t.text).replace(/\s+/g, " ").trim()
    return s.length > 120 ? s.slice(0, 117) + "…" : s
  }
  const bullets = blocks.find((b) => b?.type === "bullets" && Array.isArray((b as any).items)) as BulletsBlock | undefined
  if (bullets?.items?.length) {
    const s = bullets.items.slice(0, 2).join(" · ").trim()
    return s.length > 120 ? s.slice(0, 117) + "…" : s
  }
}

export function enhanceTabs(tabs: Tab[]): EnhancedTab[] {
  return (tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      const id = slugify(t.id || t.title) || `tab-${i}`
      return { id, title: String(t.title).trim(), _blocks: blocks, thumb: pickThumb(blocks), excerpt: pickExcerpt(blocks) }
    })
}