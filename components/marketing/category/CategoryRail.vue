<!-- components/marketing/category/CategoryRail.vue -->
<script setup lang="ts">
import { computed } from "vue"
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
    containerClass: "mx-auto w-full max-w-[1100px] px-6 lg:px-16",
    density: "comfortable",
    scrollOffset: 120,
    stickyTop: 80,
  }
)

const tabsEnhanced = computed(() => enhanceTabs(props.tabs || []))
const ids = computed(() => tabsEnhanced.value.map((t) => t.id))

const effectiveScrollOffset = computed(() => {
  const min = (props.stickyTop || 0) + 16
  return Math.max(props.scrollOffset || 0, min)
})

const { activeId, revealed, activeIndex, progress, onClickNav } = useSectionSpy({
  ids,
  scrollOffset: effectiveScrollOffset,
})

const contentPaddingClass = computed(() => (props.density === "compact" ? "py-10" : "py-12"))
</script>

<template>
  <section v-if="tabsEnhanced.length" class="bg-background">
    <div :class="cn(containerClass, contentPaddingClass)">
      <!-- TOP STICKY NAV -->
      <CategoryRailNav
        :tabs="tabsEnhanced"
        :active-id="activeId"
        :active-index="activeIndex"
        :progress="progress"
        :sticky-top="stickyTop"
        class="mb-10 rounded-3xl"
        @navigate="(id, ev) => onClickNav(id, ev)"
      />

      <!-- SECTIONS -->
      <main class="min-w-0">
        <article
          v-for="t in tabsEnhanced"
          :key="t.id"
          :id="t.id"
          class="mb-10 last:mb-0"
          :style="{ scrollMarginTop: `${effectiveScrollOffset + 12}px` }"
        >
          <div
            class="transition-all duration-500 motion-reduce:transition-none"
            :class="revealed[t.id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
          >
            <header class="mb-5">
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {{ t.title }}
              </h2>
            </header>

            <div class="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur md:p-8">
              <CategoryBlocks :blocks="t._blocks" />
            </div>
          </div>
        </article>
      </main>
    </div>
  </section>
</template>