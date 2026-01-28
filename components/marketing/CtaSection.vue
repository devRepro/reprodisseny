<template>
  <section class="bg-white">
    <div class="mx-auto max-w-6xl px-4 py-16">
      <div class="rounded-3xl bg-slate-900 px-6 py-12 text-white sm:px-12">
        <div class="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ title }}</h2>
            <p v-if="subtitle" class="mt-3 text-white/80">{{ subtitle }}</p>
          </div>

          <div class="flex flex-wrap gap-3 md:justify-end">
            <NuxtLink
              :to="primaryCta.to"
              class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              {{ primaryCta.label }}
            </NuxtLink>

            <NuxtLink
              v-if="secondaryCta"
              :to="secondaryCta.to"
              class="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Cta = { label: string; to: string }

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    primaryCta?: Cta
    secondaryCta?: Cta
  }>(),
  {
    title: "¿Preparamos tu presupuesto?",
    subtitle: "Cuéntanos qué necesitas y te proponemos la mejor solución.",
    primaryCta: () => ({ label: "Contactar", to: "/contacto" }),
    secondaryCta: () => ({ label: "Ver categorías", to: "/categorias" }),
  }
)
</script>
