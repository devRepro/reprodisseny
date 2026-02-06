<template>
  <header class="w-full bg-white border-b border-slate-200">
    <div class="mx-auto max-w-7xl px-6">
      <div class="h-16 flex items-center gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 shrink-0">
         <SharedLogo />
          <span class="sr-only">Repro Disseny</span>
        </NuxtLink>

        <!-- Search -->
        <div class="flex-1 flex justify-center">
          <div class="relative w-full max-w-2xl">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <!-- icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-4.3-4.3" />
                <circle cx="11" cy="11" r="7" />
              </svg>
            </span>
            <input
              v-model="q"
              type="search"
              placeholder="Buscar"
              class="w-full h-10 rounded-full border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              @keydown.enter="onSearch"
            />
          </div>
        </div>

        <!-- CTA + burger -->
        <div class="flex items-center gap-3 shrink-0">
          <NuxtLink
            to="/presupuesto"
            class="hidden md:inline-flex h-10 items-center rounded-lg bg-sky-700 px-4 text-sm font-medium text-white hover:bg-sky-800"
          >
            Pide tu presupuesto
          </NuxtLink>

          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Nav azul -->
    <MarketingNavBar :items="items" />
  </header>
</template>

<script setup lang="ts">
import MarketingNavBar from "@/components/marketing/MarketingNavBar.vue"

type NavItem = { label: string; to: string }

const props = defineProps<{
  items: NavItem[]
}>()

const q = ref("")

function onSearch() {
  // Ruta ejemplo; ajusta si tienes página /buscar
  if (!q.value.trim()) return
  navigateTo({ path: "/buscar", query: { q: q.value.trim() } })
}
</script>
