<script setup lang="ts">
import { computed, ref, watchEffect } from "vue"
import { cn } from "@/lib/utils"

import CategoryBlocks from "@/components/marketing/category/CategoryBlocks.vue"
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "reka-ui"

type Block = { type: string; [k: string]: any }
type Tab = { id?: string; title: string; blocks?: Block[] }

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    /** id por defecto (sin #) */
    defaultId?: string
    /** sincroniza hash (#acabados) para compartir enlace */
    syncHash?: boolean
    /** barra sticky opcional */
    stickyTop?: number | null
    class?: string
    panelClass?: string
  }>(),
  {
    defaultId: "",
    syncHash: true,
    stickyTop: null,
    class: "",
    panelClass: "",
  }
)

function slugify(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

const safeTabs = computed(() =>
  (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => ({
      ...t,
      id: slugify(t.id || t.title) || `tab-${i}`,
      blocks: (t.blocks || []).filter(Boolean),
    }))
)

const active = ref("")

watchEffect(() => {
  const list = safeTabs.value
  if (!list.length) return

  const wanted = (props.defaultId || "").replace(/^#/, "")
  if (!active.value) {
    // 1) defaultId prop
    if (wanted && list.some((t) => t.id === wanted)) {
      active.value = wanted
      return
    }
    // 2) hash de URL
    if (props.syncHash && process.client) {
      const hash = window.location.hash.replace(/^#/, "")
      if (hash && list.some((t) => t.id === hash)) {
        active.value = hash
        return
      }
    }
    // 3) primera tab
    active.value = list[0].id
    return
  }

  // Si el activo desaparece, repara
  if (!list.some((t) => t.id === active.value)) active.value = list[0].id
})

function onValueChange(id: string) {
  if (!props.syncHash || !process.client) return
  if (!id) return
  const target = `#${id}`
  if (window.location.hash === target) return
  history.replaceState(null, "", target)
}
</script>

<template>
  <section v-if="safeTabs.length" :class="cn('w-full', props.class)">
    <TabsRoot v-model="active" class="w-full" @update:value="onValueChange">
      <!-- Tabs bar (underline, igual que categorías) -->
      <div
        :class="cn(
          'rounded-xl border border-slate-200 bg-white',
          stickyTop != null ? 'sticky z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80' : ''
        )"
        :style="stickyTop != null ? { top: `${stickyTop}px` } : undefined"
      >
        <TabsList class="no-scrollbar flex w-full items-center gap-6 overflow-x-auto px-5">
          <TabsTrigger
            v-for="t in safeTabs"
            :key="t.id"
            :value="t.id"
            class="relative -mb-px whitespace-nowrap py-4 text-sm font-medium text-slate-600
                   outline-none transition-colors
                   data-[state=active]:text-slate-900
                   data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0
                   data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:bg-primary
                   focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {{ t.title }}
          </TabsTrigger>
        </TabsList>
      </div>

      <!-- Panel (card) -->
      <div :class="cn('mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm', props.panelClass)">
        <TabsContent
          v-for="t in safeTabs"
          :key="t.id"
          :value="t.id"
          class="px-6 py-10 md:px-10 md:py-12"
        >
          <!-- Puedes ocultar el H2 si no lo quieres visualmente: class="sr-only" -->
          <h2 class="mb-6 text-2xl font-semibold text-foreground">
            {{ t.title }}
          </h2>

          <!-- Reutiliza tu renderer de bloques -->
          <CategoryBlocks :blocks="(t.blocks as any)" />
        </TabsContent>
      </div>
    </TabsRoot>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>