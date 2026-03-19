<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import { cn } from "@/lib/utils"
import { enhanceTabs, type Tab } from "@/utils/categoryRail"
import { useSectionSpy } from "@/composables/useSectionSpy"
import CategoryRailNav from "./CategoryRailNav.vue"
import CategoryBlocks from "./CategoryBlocks.vue"

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    containerClass?: string
    density?: "comfortable" | "compact"
    scrollOffset?: number
    stickyTop?: number
  }>(),
  {
    containerClass: "container-content",
    density: "comfortable",
    scrollOffset: 120,
    stickyTop: 80,
  }
)

const tabsEnhanced = computed(() => enhanceTabs(props.tabs || []))
const ids = computed(() => tabsEnhanced.value.map((t) => t.id))

const navRef = ref<{ rootEl?: HTMLElement | null } | null>(null)
const navHeight = ref(0)

let resizeObserver: ResizeObserver | null = null
let resizeHandler: (() => void) | null = null

function updateNavHeight() {
  navHeight.value = navRef.value?.rootEl?.offsetHeight || 0
}

onMounted(async () => {
  await nextTick()
  updateNavHeight()

  if (typeof window !== "undefined") {
    resizeHandler = () => updateNavHeight()
    window.addEventListener("resize", resizeHandler, { passive: true })
  }

  if (typeof ResizeObserver !== "undefined" && navRef.value?.rootEl) {
    resizeObserver = new ResizeObserver(() => updateNavHeight())
    resizeObserver.observe(navRef.value.rootEl)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (resizeHandler && typeof window !== "undefined") {
    window.removeEventListener("resize", resizeHandler)
    resizeHandler = null
  }
})

const effectiveScrollOffset = computed(() => {
  const stickyBase = Number(props.stickyTop || 0)
  const navSpace = Number(navHeight.value || 0)
  const safetyGap = 20
  const computedOffset = stickyBase + navSpace + safetyGap

  return Math.max(Number(props.scrollOffset || 0), computedOffset)
})

const { activeId, revealed, activeIndex, onClickNav } = useSectionSpy({
  ids,
  scrollOffset: effectiveScrollOffset,
})

const sectionPaddingClass = computed(() =>
  props.density === "compact"
    ? "pt-8 pb-10 md:pt-10 md:pb-12"
    : "pt-10 pb-14 md:pt-12 md:pb-16"
)
</script>

<template>
  <section v-if="tabsEnhanced.length" class="bg-background">
    <div :class="cn(props.containerClass, sectionPaddingClass)">
      <CategoryRailNav
        ref="navRef"
        :tabs="tabsEnhanced"
        :active-id="activeId"
        :active-index="activeIndex"
        :sticky-top="stickyTop"
        class="mb-12 md:mb-14"
        @navigate="(id, ev) => onClickNav(id, ev)"
      />

      <div class="space-y-12 md:space-y-16">
        <article
          v-for="(t, index) in tabsEnhanced"
          :key="t.id"
          :id="t.id"
          class="border-t border-border/70 pt-10 first:border-t-0 first:pt-0 md:pt-12 md:first:pt-0"
          :style="{ scrollMarginTop: `${effectiveScrollOffset + 8}px` }"
        >
          <div
            class="transition-all duration-500 motion-reduce:transition-none"
            :class="revealed[t.id] ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
          >
            <header class="max-w-[760px]">
              <div class="mb-3 flex items-center gap-3">
                <span
                  class="inline-flex min-w-[40px] items-center justify-center rounded-full border border-primary/15 bg-accent px-3 py-1 text-label text-primary"
                >
                  {{ String(index + 1).padStart(2, "0") }}
                </span>

                <span class="text-label uppercase tracking-[0.08em] text-muted-foreground">
                  Sección
                </span>
              </div>

              <h2
                class="text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
              >
                {{ t.title }}
              </h2>
            </header>

            <div class="mt-6 md:mt-7">
              <CategoryBlocks :blocks="t._blocks" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>