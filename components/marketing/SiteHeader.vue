<template>
  <header class="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-3 font-semibold">
        <img :src="logoSrc" alt="Repro Disseny" class="h-8 w-auto" />
        <span class="hidden sm:inline">Repro Disseny</span>
      </NuxtLink>

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="text-sm text-slate-700 hover:text-slate-900"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <NuxtLink
          :to="cta.to"
          class="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {{ cta.label }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
type NavLink = { label: string; to: string }

const props = withDefaults(
  defineProps<{
    logoSrc?: string
    links?: NavLink[]
    cta?: NavLink
  }>(),
  {
    logoSrc: "/img/logo/logo.svg",
    links: () => [
      { label: "Servicios", to: "#servicios" },
      { label: "Categorías", to: "#categorias" },
      { label: "Proyectos", to: "#proyectos" },
      { label: "Contacto", to: "/contacto" },
    ],
    cta: () => ({ label: "Pedir presupuesto", to: "/contacto" }),
  }
)

const { logoSrc, links, cta } = props
</script>
