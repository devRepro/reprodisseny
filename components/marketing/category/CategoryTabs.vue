<!-- components/marketing/category/CategoryTabs.vue -->
<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue"
import { useRoute, useRouter } from "#imports"
import { cn } from "@/lib/utils"

import CategoryBlocks from "@/components/marketing/category/CategoryBlocks.vue"
import type { Block } from "@/utils/categoryRail"

// Reka UI Tabs (accesible, “shadcn-like”)
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "reka-ui"

type TabCta = { label: string; to: string }
type Tab = {
  id?: string
  title: string
  blocks?: Block[]
  content?: Block[]
  cta?: Partial<TabCta>
}

type SafeTab = {
  id: string
  title: string
  blocks: Block[]
  cta?: TabCta
}

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    /** Si lo pasas, la barra queda sticky. Ej: 112 */
    stickyTop?: number | null
    /** Mantiene el hash (#acabados) sincronizado con la tab activa */
    syncHash?: boolean
    class?: string
    /** Extra clases para el panel (card) */
    panelClass?: string
  }>(),
  {
    stickyTop: null,
    syncHash: true,
    class: "",
    panelClass: "",
  }
)

const route = useRoute()
const router = useRouter()
const activeId = ref("")

function slugify(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

const safeTabs = computed<SafeTab[]>(() =>
  (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      const id = slugify(t.id || t.title) || `tab-${i}`
      const cta =
        (t.cta?.label && t.cta?.to) ? ({ label: t.cta.label, to: t.cta.to } as TabCta) : undefined
      return { id, title: String(t.title).trim(), blocks, cta }
    })
)

/**
 * Inicializa / repara activeId cuando:
 * - llegan tabs
 * - cambia el hash
 * - el id activo ya no existe
 */
watchEffect(() => {
  const list = safeTabs.value
  if (!list.length) return

  const hash = String(route.hash || "").replace(/^#/, "")
  const hashIsValid = hash && list.some((t) => t.id === hash)

  // Si no hay activo, prioriza hash válido, si no el primero
  if (!activeId.value) {
    activeId.value = hashIsValid ? hash : list[0].id
    return
  }

  // Si el activo ya no existe, repara
  if (!list.some((t) => t.id === activeId.value)) {
    activeId.value = hashIsValid ? hash : list[0].id
  }
})

/** Si cambia el hash manualmente (o por navegación), sincroniza tab activa */
watch(
  () => route.hash,
  (h) => {
    if (!props.syncHash) return
    const id = String(h || "").replace(/^#/, "")
    if (id && safeTabs.value.some((t) => t.id === id)) activeId.value = id
  }
)

/** Si cambia tab activa, actualiza el hash (shareable / UX) */
watch(
  () => activeId.value,
  async (id) => {
    if (!props.syncHash || !process.client) return
    if (!id) return
    const target = `#${id}`
    if (route.hash === target) return
    try {
      await router.replace({ hash: target })
    } catch {
      // noop
    }
  }
)
</script>

<template>
  <section v-if="safeTabs.length" :class="cn('w-full', props.class)">
    <TabsRoot v-model="activeId" class="w-full">
      <!-- Barra Tabs (underline como Tailwind Plus) -->
      <div
        :class="cn(
          'border border-slate-200 bg-white',
          'rounded-xl',
          stickyTop != null
            ? 'sticky z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80'
            : ''
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

      <!-- Panel -->
      <div :class="cn('mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm', props.panelClass)">
        <TabsContent
          v-for="t in safeTabs"
          :key="t.id"
          :value="t.id"
          class="px-6 py-10 md:px-10 md:py-12"
        >
          <!-- Heading visible (bueno para escaneo + SEO). Si no lo quieres, lo cambias a sr-only -->
          <h2 class="mb-6 text-2xl font-semibold text-foreground">
            {{ t.title }}
          </h2>

          <!-- ✅ Render CMS blocks reutilizable -->
          <CategoryBlocks :blocks="t.blocks" />

          <!-- CTA opcional por tab -->
          <div v-if="t.cta" class="mt-8">
            <NuxtLink
              :to="t.cta.to"
              class="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {{ t.cta.label }}
            </NuxtLink>
          </div>
        </TabsContent>
      </div>
    </TabsRoot>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>