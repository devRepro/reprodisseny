<script setup lang="ts">
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"

type NavTab = {
  id: string
  title: string
}

const props = withDefaults(
  defineProps<{
    tabs: NavTab[]
    activeId?: string
    activeIndex?: number
    stickyTop?: number
    class?: string
  }>(),
  {
    activeId: "",
    activeIndex: 0,
    stickyTop: 80,
    class: "",
  }
)

const emit = defineEmits<{
  (e: "navigate", id: string, ev: MouseEvent): void
}>()

const rootEl = ref<HTMLElement | null>(null)

defineExpose({
  rootEl,
})

const totalTabs = computed(() => props.tabs.length || 0)

const currentStep = computed(() => {
  const total = totalTabs.value
  if (!total) return 0
  return Math.min(total, Math.max(1, (props.activeIndex || 0) + 1))
})

const currentStepLabel = computed(() => {
  if (!totalTabs.value) return "0/0"
  return `${currentStep.value}/${totalTabs.value}`
})

const currentStepA11y = computed(() => {
  if (!totalTabs.value) return "Sin secciones"
  return `Sección ${currentStep.value} de ${totalTabs.value}`
})

function onClick(tabId: string, ev: MouseEvent) {
  emit("navigate", tabId, ev)
}
</script>

<template>
  <div
    v-if="tabs.length"
    ref="rootEl"
    :class="cn('sticky z-30', props.class)"
    :style="{ top: `${props.stickyTop}px` }"
  >
    <nav
      aria-label="Navegación de secciones de la categoría"
      class="relative overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_10px_30px_-22px_hsl(var(--foreground)/0.14)] backdrop-blur supports-[backdrop-filter]:bg-card/90"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--accent)/0.18)_100%)]"
      />

      <div class="relative px-5 py-5 md:px-6 md:py-6">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-label uppercase tracking-[0.08em] text-primary">
              Guía de categoría
            </p>

            <h3 class="mt-2 text-[clamp(1.125rem,1.55vw,1.35rem)] font-semibold leading-tight text-foreground">
              Explora esta categoría
            </h3>


          </div>

          <div class="shrink-0">
            <div
              class="inline-flex min-h-9 items-center rounded-full border border-primary/15 bg-background/80 px-3.5 py-1.5 text-label text-foreground shadow-sm"
              :aria-label="currentStepA11y"
            >
              {{ currentStepLabel }}
            </div>
          </div>
        </div>

        <div class="relative mt-5">
          <div
            aria-hidden="true"
            class="pointer-events-none absolute bottom-1 left-0 top-0 z-10 w-8 bg-[linear-gradient(90deg,hsl(var(--card))_0%,transparent_100%)]"
          />
          <div
            aria-hidden="true"
            class="pointer-events-none absolute bottom-1 right-0 top-0 z-10 w-8 bg-[linear-gradient(270deg,hsl(var(--card))_0%,transparent_100%)]"
          />

          <div class="rail-nav-scroll overflow-x-auto pb-1">
            <ol class="flex min-w-max items-center gap-2.5 pr-1">
              <li
                v-for="(tab, index) in tabs"
                :key="tab.id"
                class="shrink-0"
              >
                <button
                  type="button"
                  class="group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-left text-body-s transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                  :class="
                    tab.id === activeId
                      ? 'border-primary/20 bg-accent text-foreground shadow-sm'
                      : 'border-border/80 bg-background text-muted-foreground hover:border-primary/20 hover:bg-background hover:text-foreground'
                  "
                  :aria-current="tab.id === activeId ? 'true' : undefined"
                  :aria-label="`Ir a la sección ${index + 1}: ${tab.title}`"
                  @click="onClick(tab.id, $event)"
                >
                  <span
                    class="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-label-s font-medium transition-colors"
                    :class="
                      tab.id === activeId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                    "
                  >
                    {{ index + 1 }}
                  </span>

                  <span class="whitespace-nowrap font-medium">
                    {{ tab.title }}
                  </span>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.rail-nav-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.rail-nav-scroll::-webkit-scrollbar {
  display: none;
}
</style>