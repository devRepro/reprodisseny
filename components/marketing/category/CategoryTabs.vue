<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onBeforeUnmount, watch } from "vue"
import { useRoute } from "#imports"
import { cn } from "@/lib/utils"

type Block =
  | { type: "text"; text: string; html?: boolean; format?: "plain" | "html" }
  | { type: "bullets"; items: string[] }
  | { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number }
  | { type: string; [k: string]: any }

type Tab = { id?: string; title: string; blocks?: Block[]; content?: Block[] }
type SafeTab = { id: string; title: string; _blocks: Block[] }

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    contentContainerClass?: string
    barContainerClass?: string
    stickyTop?: number
    scrollOffset?: number
  }>(),
  {
    contentContainerClass: "mx-auto w-full max-w-[1440px] px-6 lg:px-10 2xl:px-[120px]",
    barContainerClass: "w-full px-4 md:px-6 lg:px-10",
    stickyTop: 80,
    scrollOffset: 140,
  }
)

const route = useRoute()

const rootRef = ref<HTMLElement | null>(null)
const startSentinelRef = ref<HTMLElement | null>(null)
const endSentinelRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)

const activeId = ref("")
const isClicking = ref(false)
const isPinned = ref(false)
const barHeight = ref(0)

let sectionIO: IntersectionObserver | null = null
let rafId = 0
let resizeHandler: (() => void) | null = null
let scrollHandler: (() => void) | null = null

const slugify = (v: string) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

const safeTabs = computed<SafeTab[]>(() => {
  const seen = new Map<string, number>()
  return (props.tabs || [])
    .filter((t) => String(t?.title || "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      const baseId = slugify(t.id || t.title) || `tab-${i}`
      const count = (seen.get(baseId) || 0) + 1
      seen.set(baseId, count)
      return {
        id: count > 1 ? `${baseId}-${count}` : baseId,
        title: String(t.title),
        _blocks: blocks,
      }
    })
})

const effectiveScrollOffset = computed(() =>
  Math.max(props.scrollOffset, props.stickyTop + barHeight.value + 20)
)

function measureBar() {
  barHeight.value = barRef.value?.offsetHeight || 0
}

function updatePinnedState() {
  const startEl = startSentinelRef.value
  const endEl = endSentinelRef.value
  if (!startEl || !endEl) {
    isPinned.value = false
    return
  }

  const thresholdTop = props.stickyTop
  const thresholdBottom = props.stickyTop + (barHeight.value || 0) + 8

  const startRect = startEl.getBoundingClientRect()
  const endRect = endEl.getBoundingClientRect()

  const passedStart = startRect.top <= thresholdTop
  const hasRoomBeforeEnd = endRect.top > thresholdBottom

  isPinned.value = passedStart && hasRoomBeforeEnd
}

function requestLayoutSync() {
  if (rafId) return
  rafId = window.requestAnimationFrame(() => {
    rafId = 0
    measureBar()
    updatePinnedState()
  })
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

  if (typeof history !== "undefined") {
    history.replaceState(null, "", `#${id}`)
  }

  scrollToId(id, true)
  window.setTimeout(() => (isClicking.value = false), 700)
}

function setupSectionObserver() {
  sectionIO?.disconnect()
  sectionIO = null

  sectionIO = new IntersectionObserver(
    (entries) => {
      if (isClicking.value) return

      const visibles = entries.filter((e) => e.isIntersecting)
      if (!visibles.length) return

      const best = visibles.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (best?.target?.id) activeId.value = best.target.id
    },
    {
      root: null,
      rootMargin: `-${effectiveScrollOffset.value}px 0px -60% 0px`,
      threshold: [0.1, 0.25, 0.5],
    }
  )

  safeTabs.value.forEach((t) => {
    const el = document.getElementById(t.id)
    if (el) sectionIO?.observe(el)
  })
}

onMounted(async () => {
  if (!safeTabs.value.length) return

  const hash = String(route.hash || "").replace(/^#/, "")
  activeId.value = safeTabs.value.some((t) => t.id === hash) ? hash : safeTabs.value[0].id

  await nextTick()
  measureBar()
  updatePinnedState()
  setupSectionObserver()

  // Si viene con hash, baja a la sección sin animación
  if (hash && safeTabs.value.some((t) => t.id === hash)) {
    isClicking.value = true
    scrollToId(hash, false)
    window.setTimeout(() => (isClicking.value = false), 250)
  }

  scrollHandler = () => requestLayoutSync()
  resizeHandler = () => {
    requestLayoutSync()
    setupSectionObserver()
  }

  window.addEventListener("scroll", scrollHandler, { passive: true })
  window.addEventListener("resize", resizeHandler, { passive: true })

  // primera sincronización por si el layout cambia tras imágenes/fuentes
  window.setTimeout(() => requestLayoutSync(), 0)
  window.setTimeout(() => requestLayoutSync(), 200)
})

watch(
  () => safeTabs.value.map((t) => t.id).join("|"),
  async () => {
    await nextTick()
    requestLayoutSync()
    setupSectionObserver()
  }
)

watch(
  () => effectiveScrollOffset.value,
  () => {
    setupSectionObserver()
    requestLayoutSync()
  }
)

onBeforeUnmount(() => {
  sectionIO?.disconnect()
  sectionIO = null

  if (scrollHandler) window.removeEventListener("scroll", scrollHandler)
  if (resizeHandler) window.removeEventListener("resize", resizeHandler)

  if (rafId) {
    window.cancelAnimationFrame(rafId)
    rafId = 0
  }
})
</script>

<template>
  <section ref="rootRef" v-if="safeTabs.length" class="w-full bg-background">
    <!-- Inicio de rango sticky -->
    <div ref="startSentinelRef" class="h-px w-full" aria-hidden="true" />

    <!-- Placeholder para evitar salto al pasar a fixed -->
    <div aria-hidden="true" :style="{ height: isPinned ? `${barHeight}px` : '0px' }" />

    <!-- Barra tabs -->
    <div
  ref="barRef"
  :class="cn(
    'z-40 border-b border-slate-200 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/90 transition-shadow',
    isPinned ? 'fixed left-0 right-0 shadow-sm' : 'relative'
  )"
  :style="isPinned ? { top: `calc(${props.stickyTop}px + env(safe-area-inset-top, 0px))` } : undefined"
>
  <div :class="cn(barContainerClass, 'py-3')">
    <nav class="flex items-center gap-3" aria-label="Navegación de secciones">
      <!-- Label contextual: mejora comprensión (desktop) -->
      <span
        class="hidden lg:inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-medium text-slate-600"
      >
        En esta sección
      </span>

      <div class="relative min-w-0 flex-1">
        <!-- Fades SOLO en móvil para no tapar texto en desktop -->
        <div
          class="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-slate-50 to-transparent md:hidden"
        />
        <div
          class="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-slate-50 to-transparent md:hidden"
        />

        <!-- Rail -->
        <div
          class="no-scrollbar flex w-full items-center gap-2 overflow-x-auto rounded-full border border-slate-200 bg-white p-1"
        >
          <a
            v-for="t in safeTabs"
            :key="t.id"
            :href="`#${t.id}`"
            @click.prevent="onClickTab(t.id)"
            class="relative flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] leading-[20px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            :class="
              activeId === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            "
            :aria-current="activeId === t.id ? 'location' : undefined"
          >
            <span class="truncate">{{ t.title }}</span>
          </a>
        </div>
      </div>
    </nav>
  </div>
</div>

    <!-- Contenido -->
    <div :class="cn(contentContainerClass, 'py-12')">
      <div class="overflow-hidden rounded-3xl border border-brand-ink-light bg-card shadow-sm">
        <article
          v-for="t in safeTabs"
          :key="t.id"
          :id="t.id"
          class="border-b border-brand-ink-light px-6 py-12 last:border-b-0 md:px-12 md:py-16"
          :style="{ scrollMarginTop: `${effectiveScrollOffset + 20}px` }"
        >
          <h2 class="mb-8 text-brand-ink-dark">
            {{ t.title }}
          </h2>

          <div class="space-y-8 text-brand-ink-dark/80">
            <template v-for="(b, bi) in t._blocks" :key="bi">
              <div
                v-if="b.type === 'text' && b.html"
                class="prose prose-slate max-w-none"
                v-html="b.text"
              />
              <p v-else-if="b.type === 'text'" class="text-body whitespace-pre-line">
                {{ b.text }}
              </p>

              <ul v-else-if="b.type === 'bullets'" class="grid gap-4 sm:grid-cols-2">
                <li
                  v-for="(it, j) in b.items"
                  :key="j"
                  class="flex items-start gap-4 rounded-xl border border-brand-ink-light bg-brand-ink-light/20 p-5"
                >
                  <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
                  <span class="text-label text-brand-ink-dark">{{ it }}</span>
                </li>
              </ul>

              <figure v-else-if="b.type === 'image'" class="my-10">
                <NuxtImg
                  :src="b.src"
                  :alt="b.alt || t.title"
                  class="w-full max-h-[600px] rounded-2xl border border-brand-ink-light object-cover"
                />
                <figcaption
                  v-if="b.caption"
                  class="mt-4 text-center text-label-s italic text-brand-ink-medium"
                >
                  {{ b.caption }}
                </figcaption>
              </figure>
            </template>
          </div>
        </article>
      </div>
    </div>

    <!-- Final de rango sticky -->
    <div ref="endSentinelRef" class="h-px w-full" aria-hidden="true" />
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>