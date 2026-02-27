<!-- components/marketing/category/CategoryRail.vue -->
<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onBeforeUnmount, watch } from "vue"
import { useRoute } from "#imports"
import { cn } from "@/lib/utils"

// --- TIPOS (igual que tu componente) ---
type TextBlock = { type: "text"; text: string; html?: boolean; format?: "plain" | "html" }
type BulletsBlock = { type: "bullets"; items: string[] }
type ImageBlock = {
  type: "image"
  src: string
  alt?: string
  caption?: string
  width?: number
  height?: number
}
type UnknownBlock = { type: string; [k: string]: any }
type Block = TextBlock | BulletsBlock | ImageBlock | UnknownBlock

type Tab = { id?: string; title: string; blocks?: Block[]; content?: Block[] }

type EnhancedTab = {
  id: string
  title: string
  _blocks: Block[]
  excerpt?: string
  thumb?: ImageBlock
}

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    containerClass?: string
    density?: "comfortable" | "compact"
    scrollOffset?: number
    stickyTop?: number
  }>(),
  {
    containerClass: "mx-auto w-full max-w-[1440px] px-6 lg:px-16 xl:px-24",
    density: "comfortable",
    scrollOffset: 120,
    stickyTop: 80,
  }
)

const route = useRoute()

const activeId = ref("")
const isClicking = ref(false)

let sectionIO: IntersectionObserver | null = null
let revealIO: IntersectionObserver | null = null

const revealed = ref<Record<string, boolean>>({})

function slugify(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

function isHtmlTextBlock(b: Block): b is TextBlock {
  return b.type === "text" && ((b as any).html === true || (b as any).format === "html")
}

function pickThumb(blocks: Block[]): ImageBlock | undefined {
  return blocks.find((b) => b?.type === "image" && (b as any).src) as ImageBlock | undefined
}

function pickExcerpt(blocks: Block[]): string | undefined {
  const t = blocks.find((b) => b?.type === "text" && String((b as any).text || "").trim()) as TextBlock | undefined
  if (t && !isHtmlTextBlock(t)) {
    const s = String(t.text).replace(/\s+/g, " ").trim()
    return s.length > 120 ? s.slice(0, 117) + "…" : s
  }

  const bullets = blocks.find((b) => b?.type === "bullets" && Array.isArray((b as any).items)) as
    | BulletsBlock
    | undefined
  if (bullets?.items?.length) {
    const s = bullets.items.slice(0, 2).join(" · ").trim()
    return s.length > 120 ? s.slice(0, 117) + "…" : s
  }
  return undefined
}

const tabsEnhanced = computed<EnhancedTab[]>(() =>
  (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      const id = slugify(t.id || t.title) || `tab-${i}`
      return {
        id,
        title: String(t.title).trim(),
        _blocks: blocks,
        thumb: pickThumb(blocks),
        excerpt: pickExcerpt(blocks),
      }
    })
)

type BentoVariant = "hero" | "tall" | "wide" | "base" | "small"

function textLen(t?: string) {
  return (t || "").trim().length
}

function bulletsCount(blocks: Block[]) {
  const b = blocks.find((x) => x?.type === "bullets") as BulletsBlock | undefined
  return Array.isArray(b?.items) ? b!.items.length : 0
}

function contentScore(tab: EnhancedTab) {
  // score sencillo para determinar “riqueza”
  let s = 0
  if (tab.thumb?.src) s += 3
  s += Math.min(2, Math.floor(bulletsCount(tab._blocks) / 3)) // 0..2
  if (textLen(tab.excerpt) > 90) s += 1
  return s // 0..6 aprox
}

function bentoVariant(tab: EnhancedTab, i: number): BentoVariant {
  const score = contentScore(tab)
  const hasImg = !!tab.thumb?.src

  // 1) Primer tile “wow” si hay imagen (o score alto)
  if (i === 0 && (hasImg || score >= 3)) return "hero"

  // 2) Patrón cíclico para ritmo visual (evita monotonía)
  //    Ajusta el patrón a tu gusto:
  const pattern: BentoVariant[] = ["tall", "wide", "base", "base", "small", "base"]
  let v = pattern[i % pattern.length]

  // 3) Reglas de corrección según contenido
  //    - si NO hay imagen, evita tall/hero (se ve raro)
  if (!hasImg && (v === "tall" || v === "hero")) v = "wide"

  //    - si score muy bajo, usa base/small
  if (score <= 1 && (v === "tall" || v === "wide")) v = "base"

  //    - si score alto, permite tall aunque no sea el patrón
  if (score >= 4 && hasImg && v === "base") v = "tall"

  return v
}

function bentoSpanClasses(tab: EnhancedTab, i: number) {
  const v = bentoVariant(tab, i)

  // Grid de 12 columnas en desktop.
  // Las combinaciones están pensadas para “encajar bien” y verse pro.
  const map: Record<BentoVariant, string> = {
    hero: "col-span-12 lg:col-span-7 row-span-2",
    tall: "col-span-12 sm:col-span-6 lg:col-span-5 row-span-2",
    wide: "col-span-12 lg:col-span-7 row-span-1",
    base: "col-span-12 sm:col-span-6 lg:col-span-4 row-span-1",
    small: "col-span-12 sm:col-span-6 lg:col-span-3 row-span-1",
  }

  return map[v]
}

function isTallTile(tab: EnhancedTab, i: number) {
  const v = bentoVariant(tab, i)
  return v === "hero" || v === "tall"
}

function setHash(id: string) {
  if (typeof history !== "undefined") history.replaceState(null, "", `#${id}`)
}

const effectiveScrollOffset = computed(() => {
  // offset mínimo por header sticky (aprox)
  const min = (props.stickyTop || 0) + 16
  return Math.max(props.scrollOffset || 0, min)
})

function scrollToId(id: string, smooth = true) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - effectiveScrollOffset.value
  window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" })
}

function onClickNav(id: string, ev?: MouseEvent) {
  ev?.preventDefault()
  isClicking.value = true
  activeId.value = id
  setHash(id)
  scrollToId(id, true)
  window.setTimeout(() => (isClicking.value = false), 650)
}

const activeIndex = computed(() => tabsEnhanced.value.findIndex((t) => t.id === activeId.value))
const progress = computed(() => {
  const n = tabsEnhanced.value.length
  if (n <= 1) return 1
  const idx = Math.max(0, activeIndex.value)
  return idx / (n - 1)
})

function setupObservers() {
  sectionIO?.disconnect()
  revealIO?.disconnect()
  sectionIO = null
  revealIO = null

  // Scrollspy (active)
  sectionIO = new IntersectionObserver(
    (entries) => {
      if (isClicking.value) return
      const visible = entries.filter((e) => e.isIntersecting)
      if (!visible.length) return
      const best = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (best?.target?.id) activeId.value = best.target.id
    },
    {
      root: null,
      rootMargin: `-${effectiveScrollOffset.value}px 0px -55% 0px`,
      threshold: [0.1, 0.25, 0.5],
    }
  )

  // Reveal suave (solo una vez)
  revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const id = (e.target as HTMLElement)?.id
        if (!id) return
        if (e.isIntersecting) revealed.value[id] = true
      })
    },
    {
      root: null,
      rootMargin: "0px 0px -20% 0px",
      threshold: [0.05, 0.15],
    }
  )

  tabsEnhanced.value.forEach((t) => {
    const el = document.getElementById(t.id)
    if (el) {
      sectionIO?.observe(el)
      revealIO?.observe(el)
    }
  })
}

const contentPaddingClass = computed(() => (props.density === "compact" ? "py-10" : "py-12"))

onMounted(async () => {
  if (!tabsEnhanced.value.length) return

  const hash = String(route.hash || "").replace(/^#/, "")
  activeId.value = tabsEnhanced.value.some((t) => t.id === hash) ? hash : tabsEnhanced.value[0].id

  await nextTick()

  // Si vienes con hash, navega sin “pelear” con observer
  if (hash && tabsEnhanced.value.some((t) => t.id === hash)) {
    isClicking.value = true
    scrollToId(hash, false)
    window.setTimeout(() => (isClicking.value = false), 250)
  }

  setupObservers()

  const onResize = () => setupObservers()
  window.addEventListener("resize", onResize, { passive: true })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize)
  })
})

watch(
  () => tabsEnhanced.value.map((t) => t.id).join("|"),
  async () => {
    await nextTick()
    setupObservers()
  }
)

watch(
  () => effectiveScrollOffset.value,
  () => setupObservers()
)

onBeforeUnmount(() => {
  sectionIO?.disconnect()
  revealIO?.disconnect()
})
</script>

<template>
  <section v-if="tabsEnhanced.length" class="bg-background">
    <div :class="cn(containerClass, contentPaddingClass)">
      <div class="grid gap-10 lg:grid-cols-[320px,1fr] xl:grid-cols-[360px,1fr]">
        <!-- SIDEBAR (desktop) -->
        <aside class="min-w-0 lg:sticky" :style="{ top: `${stickyTop}px` }">
          <div
            class="rounded-3xl border border-border/60 bg-background/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div class="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-4">
              <div class="min-w-0">
                <p class="text-xs font-medium text-muted-foreground">Contenido</p>
                <p class="mt-1 truncate text-sm font-semibold tracking-tight text-foreground">
                  Explora esta categoría
                </p>
              </div>

              <div class="shrink-0 text-right">
                <div class="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                    :style="{ width: `${Math.round(progress * 100)}%` }"
                  />
                </div>
                <p class="mt-1 text-[11px] text-muted-foreground">
                  {{ Math.max(1, activeIndex + 1) }}/{{ tabsEnhanced.length }}
                </p>
              </div>
            </div>

            <nav class="p-2" aria-label="Secciones">
              <a
                v-for="(t, i) in tabsEnhanced"
                :key="t.id"
                :href="`#${t.id}`"
                :aria-current="activeId === t.id ? 'true' : undefined"
                class="group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                :class="activeId === t.id ? 'bg-muted/60' : 'hover:bg-muted/40'"
                @click="(e) => onClickNav(t.id, e)"
              >
                <div class="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center">
                  <div
                    class="absolute inset-0 rounded-full transition-colors"
                    :class="activeId === t.id ? 'bg-primary/15' : 'bg-muted'"
                  />
                  <span
                    class="relative text-[11px] font-semibold"
                    :class="activeId === t.id ? 'text-primary' : 'text-muted-foreground'"
                  >
                    {{ i + 1 }}
                  </span>
                </div>

                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-sm font-semibold transition-colors"
                    :class="activeId === t.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'"
                  >
                    {{ t.title }}
                  </p>
                  <p v-if="t.excerpt" class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {{ t.excerpt }}
                  </p>
                </div>

                <div
                  class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
                  :class="activeId === t.id ? 'bg-primary' : 'bg-muted-foreground/30'"
                />
              </a>
            </nav>
          </div>

          <!-- MOBILE DOCK -->
          <div class="lg:hidden fixed bottom-4 left-1/2 z-50 w-[min(680px,calc(100%-2rem))] -translate-x-1/2">
            <div
              class="rounded-full border border-border/60 bg-background/80 px-2 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/70"
            >
              <div class="no-scrollbar flex items-center gap-2 overflow-x-auto">
                <a
                  v-for="t in tabsEnhanced"
                  :key="t.id"
                  :href="`#${t.id}`"
                  class="shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  :class="activeId === t.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/40'"
                  @click="(e) => onClickNav(t.id, e)"
                >
                  {{ t.title }}
                </a>
              </div>
            </div>
          </div>
        </aside>

        <!-- CONTENT -->
        <main class="min-w-0">
            <!-- BADGES OVERVIEW (wrap desktop + scroll mobile) -->
<div class="mb-10">
  <div class="rounded-3xl border border-border/60 bg-background/60 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50">
    <!-- Mobile: scroll -->
    <div class="no-scrollbar flex items-center gap-2 overflow-x-auto py-1 sm:hidden">
      <a
        v-for="(t, i) in tabsEnhanced"
        :key="`badge-m-${t.id}`"
        :href="`#${t.id}`"
        class="shrink-0"
        @click="(e) => onClickNav(t.id, e)"
      >
        <span
          class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          :class="
            activeId === t.id
              ? 'border-primary/30 bg-primary/10 text-foreground'
              : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          "
        >
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
            :class="activeId === t.id ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
          >
            {{ i + 1 }}
          </span>
          <span class="max-w-[18ch] truncate">{{ t.title }}</span>
        </span>
      </a>
    </div>

    <!-- Desktop: wrap (ideal para 5 secciones) -->
    <div class="hidden sm:flex sm:flex-wrap sm:gap-2 sm:py-1">
      <a
        v-for="(t, i) in tabsEnhanced"
        :key="`badge-d-${t.id}`"
        :href="`#${t.id}`"
        class="group"
        @click="(e) => onClickNav(t.id, e)"
      >
        <span
          class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          :class="
            activeId === t.id
              ? 'border-primary/30 bg-primary/10 text-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)]'
              : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          "
        >
          <span class="text-[11px] text-muted-foreground/80">#{{ i + 1 }}</span>
          <span class="max-w-[28ch] truncate">{{ t.title }}</span>
          <span
            class="h-1.5 w-1.5 rounded-full transition-colors"
            :class="activeId === t.id ? 'bg-primary' : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'"
          />
        </span>
      </a>
    </div>
  </div>
</div>
          

          <!-- SECTIONS -->
          <article
            v-for="(t, i) in tabsEnhanced"
            :key="t.id"
            :id="t.id"
            class="mb-10 last:mb-0"
            :style="{ scrollMarginTop: `${effectiveScrollOffset + 12}px` }"
          >
            <div
              class="transition-all duration-500 motion-reduce:transition-none"
              :class="revealed[t.id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
            >
              <header class="mb-5 flex items-end justify-between gap-4">
                <div class="min-w-0">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Capítulo {{ i + 1 }}
                  </p>
                  <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    {{ t.title }}
                  </h2>
                </div>

                <a
                  href="#"
                  class="hidden shrink-0 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground md:inline-flex"
                  @click.prevent="window.scrollTo({ top: 0, behavior: 'smooth' })"
                >
                  Volver arriba
                </a>
              </header>

              <div
                class="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50 md:p-8"
              >
                <div class="space-y-6 leading-relaxed text-muted-foreground md:text-[15px]">
                  <template v-for="(b, bi) in t._blocks" :key="bi">
                    <div
                      v-if="isHtmlTextBlock(b)"
                      class="prose prose-slate max-w-none dark:prose-invert"
                      v-html="b.text"
                    />

                    <p v-else-if="b.type === 'text'" class="whitespace-pre-line">
                      {{ (b as any).text }}
                    </p>

                    <ul v-else-if="b.type === 'bullets'" class="grid gap-3 sm:grid-cols-2">
                      <li
                        v-for="(it, j) in (b as any).items || []"
                        :key="j"
                        class="group rounded-2xl border border-border/60 bg-muted/30 p-4 transition hover:bg-muted/40"
                      >
                        <div class="flex items-start gap-3">
                          <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span class="text-sm font-semibold text-foreground/90">
                            {{ it }}
                          </span>
                        </div>
                      </li>
                    </ul>

                    <figure v-else-if="b.type === 'image'" class="overflow-hidden rounded-2xl border border-border/60">
                      <div class="group relative">
                        <NuxtImg
                          :src="(b as any).src"
                          :alt="(b as any).alt || ''"
                          :width="(b as any).width"
                          :height="(b as any).height"
                          class="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
                          loading="lazy"
                          format="webp"
                          quality="80"
                        />
                        <div class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                      </div>

                      <figcaption
                        v-if="(b as any).caption"
                        class="border-t border-border/60 bg-background/40 px-4 py-3 text-center text-sm text-muted-foreground"
                      >
                        {{ (b as any).caption }}
                      </figcaption>
                    </figure>
                  </template>

                  <div v-if="!t._blocks.length" class="rounded-2xl bg-muted/30 p-4 text-center italic">
                    Información no disponible.
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>