<!-- components/marketing/category/CategoryTabs.vue -->
<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onBeforeUnmount, watch } from "vue"
import { useRoute } from "#imports"
import { cn } from "@/lib/utils"

// --- TIPOS ---
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
type SafeTab = { id: string; title: string; _blocks: Block[] }

const props = withDefaults(
  defineProps<{
    tabs: Tab[]

    /** Container global (reutiliza tus tokens/clases) */
    containerClass?: string

    /** Densidad del contenido */
    density?: "comfortable" | "compact"

    /** Offset para scroll a sección (header sticky + barra tabs) */
    scrollOffset?: number

    /** Top donde debe fijarse la barra (altura header fijo) */
    stickyTop?: number
  }>(),
  {
    containerClass: "mx-auto w-full max-w-[1440px] px-6 lg:px-16 xl:px-24",
    density: "comfortable",
    scrollOffset: 140,
    stickyTop: 80,
  }
)

const route = useRoute()

const activeId = ref("")
const isClicking = ref(false)

// “Sticky robusto” (fixed cuando toca)
const sentinelRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const isPinned = ref(false)
const barHeight = ref(0)

let pinIO: IntersectionObserver | null = null
let sectionIO: IntersectionObserver | null = null

function slugify(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

const safeTabs = computed<SafeTab[]>(() =>
  (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      const id = slugify(t.id || t.title) || `tab-${i}`
      return { id, title: String(t.title).trim(), _blocks: blocks }
    })
)

function isHtmlTextBlock(b: Block): b is TextBlock {
  return b.type === "text" && ((b as any).html === true || (b as any).format === "html")
}

function setHash(id: string) {
  if (typeof history !== "undefined") history.replaceState(null, "", `#${id}`)
}

const effectiveScrollOffset = computed(() => {
  // Asegura que el H2 no quede tapado por header + barra tabs
  const min = (props.stickyTop || 0) + (barHeight.value || 0) + 16
  return Math.max(props.scrollOffset || 0, min)
})

function measureBar() {
  barHeight.value = barRef.value?.offsetHeight || 0
}

function scrollToId(id: string, smooth = true) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - effectiveScrollOffset.value
  window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" })
}

function onClickTab(id: string) {
  isClicking.value = true
  activeId.value = id
  setHash(id)
  scrollToId(id, true)
  window.setTimeout(() => (isClicking.value = false), 650)
}

function setupPinnedObserver() {
  pinIO?.disconnect()
  pinIO = null
  if (!sentinelRef.value) return

  // Cuando el sentinel “sube” por encima de (stickyTop), fijamos
  pinIO = new IntersectionObserver(
    ([entry]) => {
      isPinned.value = !entry.isIntersecting
    },
    {
      root: null,
      threshold: 0,
      rootMargin: `-${props.stickyTop}px 0px 0px 0px`,
    }
  )

  pinIO.observe(sentinelRef.value)
}

function setupSectionObserver() {
  sectionIO?.disconnect()
  sectionIO = null

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

  safeTabs.value.forEach((t) => {
    const el = document.getElementById(t.id)
    if (el) sectionIO?.observe(el)
  })
}

const contentPaddingClass = computed(() =>
  props.density === "compact" ? "py-8 md:py-10" : "py-10 md:py-12"
)

onMounted(async () => {
  if (!safeTabs.value.length) return

  // Activo inicial por hash o primero
  const hash = String(route.hash || "").replace(/^#/, "")
  activeId.value = safeTabs.value.some((t) => t.id === hash) ? hash : safeTabs.value[0].id

  await nextTick()
  measureBar()
  setupPinnedObserver()

  // Si vienes con hash, navega sin pelear con observer
  if (hash && safeTabs.value.some((t) => t.id === hash)) {
    isClicking.value = true
    scrollToId(hash, false)
    window.setTimeout(() => (isClicking.value = false), 250)
  }

  setupSectionObserver()

  // Re-medimos si cambia viewport (evita offsets mal)
  const onResize = () => {
    measureBar()
    setupSectionObserver()
    setupPinnedObserver()
  }
  window.addEventListener("resize", onResize, { passive: true })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize)
  })
})

watch(
  () => safeTabs.value.map((t) => t.id).join("|"),
  async () => {
    await nextTick()
    measureBar()
    setupSectionObserver()
    setupPinnedObserver()
  }
)

watch(
  () => effectiveScrollOffset.value,
  () => {
    // si cambia el offset (por altura de barra), recalcula observer
    setupSectionObserver()
    setupPinnedObserver()
  }
)

onBeforeUnmount(() => {
  pinIO?.disconnect()
  sectionIO?.disconnect()
})
</script>

<template>
  <section v-if="safeTabs.length" class="bg-background">
    <!-- Sentinel: cuando pasa por arriba, fijamos la barra -->
    <div ref="sentinelRef" aria-hidden="true" class="h-px w-full" />

    <!-- Placeholder para evitar salto cuando la barra pasa a fixed -->
    <div aria-hidden="true" :style="{ height: isPinned ? `${barHeight}px` : '0px' }" />

    <!-- TOP BAR (fina, estilo breadcrumbs, y fijada robustamente) -->
    <div
      ref="barRef"
      :class="
        cn(
          'z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70',
          isPinned ? 'fixed left-0 right-0 shadow-sm' : 'relative'
        )
      "
      :style="isPinned ? { top: `${stickyTop}px` } : undefined"
    >
      <div :class="cn(containerClass, 'py-2')">
        <nav class="relative" aria-label="Secciones">
          <!-- fades laterales (tipo Microsoft) -->
          <div
            class="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent"
          />
          <div
            class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent"
          />

          <div class="no-scrollbar flex items-center gap-6 overflow-x-auto">
            <button
              v-for="t in safeTabs"
              :key="t.id"
              type="button"
              :aria-current="activeId === t.id ? 'page' : undefined"
              class="relative h-9 shrink-0 px-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
              :class="activeId === t.id ? 'text-foreground' : ''"
              @click="onClickTab(t.id)"
            >
              {{ t.title }}
              <span
                class="absolute -bottom-[1px] left-0 h-[2px] w-full origin-center scale-x-0 bg-primary transition-transform duration-200"
                :class="{ 'scale-x-100': activeId === t.id }"
              />
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div :class="cn(containerClass, contentPaddingClass)">
      <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <article
          v-for="t in safeTabs"
          :key="t.id"
          :id="t.id"
          class="border-b border-border/60 px-6 py-10 last:border-b-0 md:px-10 md:py-12"
          :style="{ scrollMarginTop: `${effectiveScrollOffset + 10}px` }"
        >
          <h2 class="mb-6 text-2xl font-semibold text-foreground">
            {{ t.title }}
          </h2>

          <div class="space-y-6 text-muted-foreground leading-relaxed">
            <template v-for="(b, bi) in t._blocks" :key="bi">
              <div v-if="isHtmlTextBlock(b)" class="prose max-w-none" v-html="b.text" />

              <p v-else-if="b.type === 'text'" class="whitespace-pre-line">
                {{ (b as any).text }}
              </p>

              <ul v-else-if="b.type === 'bullets'" class="grid gap-3 sm:grid-cols-2">
                <li
                  v-for="(it, j) in (b as any).items || []"
                  :key="j"
                  class="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span class="text-sm font-medium text-foreground/90">{{ it }}</span>
                </li>
              </ul>

              <figure v-else-if="b.type === 'image'" class="my-6">
                <NuxtImg
                  :src="(b as any).src"
                  :alt="(b as any).alt || ''"
                  :width="(b as any).width"
                  :height="(b as any).height"
                  class="w-full max-h-[520px] rounded-xl border border-border/60 object-cover"
                  loading="lazy"
                  format="webp"
                  quality="80"
                />
                <figcaption
                  v-if="(b as any).caption"
                  class="mt-2 text-center text-sm text-muted-foreground"
                >
                  {{ (b as any).caption }}
                </figcaption>
              </figure>
            </template>

            <div v-if="!t._blocks.length" class="rounded-lg bg-muted/30 p-4 text-center italic">
              Información no disponible.
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>