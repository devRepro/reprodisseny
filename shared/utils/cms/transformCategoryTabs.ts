// shared/utils/cms/transformCategoryTabs.ts

export type TextBlock = { type: "text"; text: string; html?: boolean; format?: "plain" | "html" }
export type BulletsBlock = { type: "bullets"; items: string[] }
export type ImageBlock = { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number }
export type Block = TextBlock | BulletsBlock | ImageBlock | { type: string; [k: string]: any }

export type Tab = { id?: string; title: string; blocks?: Block[]; content?: Block[] }

export type CategoryFields = {
  Title?: string
  Description?: string
  BodyMd?: string
  ImageSrc?: string
  ImageWidth?: number | string
  ImageHeight?: number | string
  ImageAlt?: string
  GalleryImagesJson?: any
  TabsJson?: any
}

type TransformOptions = {
  includeGalleryTab?: boolean
  galleryTabTitle?: string
  /** Si true: NO crea tab de “Descripción” con Description/Image */
  includeIntroTab?: boolean
  introTabTitle?: string
  /** Si true: IGNORA TabsJson completamente */
  ignoreTabsJson?: boolean
  /** Si true: construye tabs SOLO desde BodyMd (y si no hay, fallback a Description) */
  bodyMdOnly?: boolean
  /** si BodyMd no tiene ##, este será el título del tab único */
  singleTabTitle?: string
}

const DEFAULTS: Required<Omit<TransformOptions, "ignoreTabsJson" | "bodyMdOnly">> & {
  ignoreTabsJson: boolean
  bodyMdOnly: boolean
} = {
  includeGalleryTab: true,
  galleryTabTitle: "Galería",
  includeIntroTab: true,
  introTabTitle: "Descripción",
  ignoreTabsJson: false,
  bodyMdOnly: false,
  singleTabTitle: "Contenido",
}

export function transformCategoryToTabs(fields: CategoryFields, opts?: TransformOptions): Tab[] {
  const o = { ...DEFAULTS, ...(opts || {}) }

  // ✅ Si quieres BodyMd-only, saltamos TabsJson e Intro (por defecto) y construimos desde BodyMd
  if (o.bodyMdOnly) {
    const tabs = buildTabsFromBodyMdOnly(fields, o)
    return sanitizeTabs(tabs)
  }

  // 1) TabsJson si existe (a menos que lo ignores)
  if (!o.ignoreTabsJson) {
    const tabsFromJson = parseTabsJson(fields.TabsJson)
    if (tabsFromJson?.length) return sanitizeTabs(tabsFromJson)
  }

  // 2) Comportamiento “mixto” (intro + secciones BodyMd + galería)
  const tabs: Tab[] = []

  if (o.includeIntroTab) {
    const introBlocks: Block[] = []
    const hero = buildMainImageBlock(fields)
    if (hero) introBlocks.push(hero)
    if (isNonEmpty(fields.Description)) introBlocks.push(...contentToBlocks(String(fields.Description)))
    if (introBlocks.length) {
      tabs.push({ id: "descripcion", title: o.introTabTitle, blocks: introBlocks })
    }
  }

  const md = String(fields.BodyMd || "").trim()
  const mdTabs = buildTabsFromBodyMd(md, o.singleTabTitle)
  tabs.push(...mdTabs)

  if (o.includeGalleryTab) {
    const galleryBlocks = galleryToImageBlocks(fields.GalleryImagesJson)
    if (galleryBlocks.length) tabs.push({ id: "galeria", title: o.galleryTabTitle, blocks: galleryBlocks })
  }

  return sanitizeTabs(tabs)
}

/* -----------------------------
   BodyMd-only builders
------------------------------ */

function buildTabsFromBodyMdOnly(fields: CategoryFields, o: TransformOptions): Tab[] {
  // Por defecto: no dupliques Description en tabs (ya lo enseñas en Hero/Intro)
  const md = String(fields.BodyMd || "").trim()
  const mdTabs = buildTabsFromBodyMd(md, o.singleTabTitle || "Contenido")

  // Fallback: si BodyMd está vacío o no genera bloques, usa Description como tab único
  if (!mdTabs.length && isNonEmpty(fields.Description)) {
    return [{
      id: "contenido",
      title: o.singleTabTitle || "Contenido",
      blocks: contentToBlocks(String(fields.Description)),
    }]
  }

  // Galería opcional
  const tabs = [...mdTabs]
  if (o.includeGalleryTab) {
    const galleryBlocks = galleryToImageBlocks(fields.GalleryImagesJson)
    if (galleryBlocks.length) tabs.push({ id: "galeria", title: o.galleryTabTitle || "Galería", blocks: galleryBlocks })
  }
  return tabs
}

function buildTabsFromBodyMd(md: string, singleTitle: string): Tab[] {
  const text = String(md || "").replace(/\r\n/g, "\n").trim()
  if (!text) return []

  const sections = splitMarkdownH2Sections(text)

  // Si hay "##", cada H2 es un tab
  if (sections.length) {
    return sections
      .map((s) => {
        const blocks = contentToBlocks(s.body || "")
        if (!isNonEmpty(s.title) || !blocks.length) return null
        return { id: slugify(s.title), title: s.title.trim(), blocks }
      })
      .filter(Boolean) as Tab[]
  }

  // Si no hay H2, un tab único
  const blocks = contentToBlocks(text)
  return blocks.length ? [{ id: "contenido", title: singleTitle || "Contenido", blocks }] : []
}

/* -----------------------------
   Parser / Heurísticas
------------------------------ */

function parseTabsJson(input: any): Tab[] | null {
  if (!input) return null
  if (Array.isArray(input)) return input as Tab[]
  if (typeof input === "string") {
    const raw = maybeUnescapeExcelJsonString(input.trim())
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as Tab[]) : null
    } catch {
      return null
    }
  }
  return null
}

function maybeUnescapeExcelJsonString(s: string): string {
  let v = s.trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  if (v.includes('""')) v = v.replace(/""/g, '"')
  return v.replace(/\r\n/g, "\n")
}

function buildMainImageBlock(fields: CategoryFields): ImageBlock | null {
  if (!isNonEmpty(fields.ImageSrc)) return null
  return {
    type: "image",
    src: String(fields.ImageSrc).trim(),
    alt: isNonEmpty(fields.ImageAlt) ? String(fields.ImageAlt).trim() : undefined,
    width: toNum(fields.ImageWidth),
    height: toNum(fields.ImageHeight),
  }
}

function galleryToImageBlocks(input: any): ImageBlock[] {
  if (!input) return []
  let parsed: any = input
  if (typeof input === "string") {
    try { parsed = JSON.parse(maybeUnescapeExcelJsonString(input)) } catch { parsed = [] }
  }
  const arr = Array.isArray(parsed) ? parsed : []
  return arr
    .map((x) => {
      if (!x) return null
      if (typeof x === "string") return { type: "image", src: x } as ImageBlock
      const src = String(x.src || x.url || x.href || "").trim()
      if (!src) return null
      return {
        type: "image",
        src,
        alt: isNonEmpty(x.alt) ? String(x.alt) : undefined,
        caption: isNonEmpty(x.caption) ? String(x.caption) : undefined,
        width: toNum(x.width),
        height: toNum(x.height),
      } as ImageBlock
    })
    .filter(Boolean) as ImageBlock[]
}

function splitMarkdownH2Sections(md: string): Array<{ title: string; body: string }> {
  const lines = md.split("\n")
  const sections: Array<{ title: string; bodyLines: string[] }> = []
  let current: { title: string; bodyLines: string[] } | null = null

  for (const raw of lines) {
    const m = raw.match(/^##\s*(.+)\s*$/)
    if (m) {
      if (current) sections.push(current)
      current = { title: m[1].trim(), bodyLines: [] }
      continue
    }
    if (current) current.bodyLines.push(raw)
  }
  if (current) sections.push(current)

  return sections.map((s) => ({ title: s.title, body: s.bodyLines.join("\n").trim() }))
}

function contentToBlocks(input: string): Block[] {
  const s = String(input || "").replace(/\r\n/g, "\n").trim()
  if (!s) return []

  const lines = s.split("\n")
  const blocks: Block[] = []
  let para: string[] = []
  let bullets: string[] = []

  const flushPara = () => {
    const t = para.join("\n").trim()
    if (t) blocks.push({ type: "text", text: t, format: "plain" })
    para = []
  }
  const flushBullets = () => {
    const items = bullets.map((x) => x.trim()).filter(Boolean)
    if (items.length) blocks.push({ type: "bullets", items })
    bullets = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) { flushBullets(); flushPara(); continue }

    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
    if (img) {
      flushBullets(); flushPara()
      blocks.push({ type: "image", src: img[2].trim(), alt: img[1]?.trim() || undefined })
      continue
    }

    const bullet = line.match(/^(?:•|·|–|-|\*)\s+(.*)$/) || line.match(/^\d+[\.\)]\s+(.*)$/)
    if (bullet) { flushPara(); bullets.push(bullet[1]); continue }

    flushBullets()
    para.push(rawLine)
  }

  flushBullets()
  flushPara()
  return blocks
}

function sanitizeTabs(tabs: Tab[]): Tab[] {
  return (tabs || [])
    .filter((t) => isNonEmpty(t?.title))
    .map((t) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      return { id: isNonEmpty(t.id) ? String(t.id) : undefined, title: String(t.title).trim(), blocks }
    })
    .filter((t) => (t.blocks?.length ?? 0) > 0)
}

function slugify(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

function isNonEmpty(v: any) {
  return String(v ?? "").trim().length > 0
}

function toNum(v: any): number | undefined {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim())
  return Number.isFinite(n) && n > 0 ? n : undefined
}