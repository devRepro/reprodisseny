<!-- components/marketing/category/CategoryRailNav.vue -->
<script setup lang="ts">
import type { EnhancedTab } from "@/utils/categoryRail"
import { cn } from "@/lib/utils"

const props = defineProps<{
  tabs: EnhancedTab[]
  activeId: string
  progress: number
  activeIndex: number
  stickyTop?: number
  class?: string
}>()

const emit = defineEmits<{
  (e: "navigate", id: string, ev?: MouseEvent): void
}>()
</script>

<template>
  <div
    :class="cn(
      'sticky z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70',
      props.class
    )"
    :style="{ top: `${props.stickyTop ?? 80}px` }"
  >
    <div class="rounded-3xl border border-border/60 bg-background/40 p-3 shadow-sm">
      <div class="mb-2 flex items-center justify-between gap-4 px-1">
        <div class="min-w-0">
          
          <h2 class="mt-1 truncate text-sm font-semibold tracking-tight text-foreground">Explora esta categoría</h2>
        </div>

        <div class="shrink-0 text-right">
          <div class="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
              :style="{ width: `${Math.round((props.progress || 0) * 100)}%` }"
            />
          </div>
          <p class="mt-1 text-[11px] text-muted-foreground">
            {{ Math.max(1, props.activeIndex + 1) }}/{{ props.tabs.length }}
          </p>
        </div>
      </div>

      <!-- Mobile: scroll -->
      <div class="no-scrollbar flex items-center gap-2 overflow-x-auto py-1 sm:hidden">
        <a
          v-for="(t, i) in props.tabs"
          :key="`m-${t.id}`"
          :href="`#${t.id}`"
          class="shrink-0"
          @click="(e) => emit('navigate', t.id, e)"
        >
          <span
            class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            :class="
              props.activeId === t.id
                ? 'border-primary/30 bg-primary/10 text-foreground'
                : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            "
          >
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
              :class="props.activeId === t.id ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
            >
              {{ i + 1 }}
            </span>
            <span class="max-w-[18ch] truncate">{{ t.title }}</span>
          </span>
        </a>
      </div>

      <!-- Desktop: wrap -->
      <div class="hidden sm:flex sm:flex-wrap sm:gap-2 sm:py-1">
        <a
          v-for="(t, i) in props.tabs"
          :key="`d-${t.id}`"
          :href="`#${t.id}`"
          class="group"
          @click="(e) => emit('navigate', t.id, e)"
        >
          <span
            class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            :class="
              props.activeId === t.id
                ? 'border-primary/30 bg-primary/10 text-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)]'
                : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            "
          >
            <span class="text-[11px] text-muted-foreground/80">#{{ i + 1 }}</span>
            <span class="max-w-[28ch] truncate">{{ t.title }}</span>
            <span
              class="h-1.5 w-1.5 rounded-full transition-colors"
              :class="props.activeId === t.id ? 'bg-primary' : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'"
            />
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>