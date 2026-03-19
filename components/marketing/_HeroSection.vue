<template>
  <section class="bg-white">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
      <div>
        <p v-if="eyebrow" class="text-sm font-semibold text-slate-600">
          {{ eyebrow }}
        </p>

        <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {{ title }}
        </h1>

        <p class="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          {{ subtitle }}
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <NuxtLink
            :to="primaryCta.to"
            class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {{ primaryCta.label }}
          </NuxtLink>

          <NuxtLink
            v-if="secondaryCta"
            :to="secondaryCta.to"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            {{ secondaryCta.label }}
          </NuxtLink>
        </div>

        <ul v-if="bullets?.length" class="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <li v-for="(b, i) in bullets" :key="i" class="flex gap-2">
            <span class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">✓</span>
            <span>{{ b }}</span>
          </li>
        </ul>
      </div>

      <div class="relative">
        <div class="absolute -inset-6 -z-10 rounded-3xl bg-slate-100" />
        <img
          v-if="image?.src"
          :src="image.src"
          :alt="image.alt || ''"
          class="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm"
        />
        <div v-else class="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
          <p class="text-sm text-slate-500">Imagen de portada (opcional)</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Cta = { label: string; to: string }
type HeroImage = { src: string; alt?: string }

withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    subtitle: string
    primaryCta: Cta
    secondaryCta?: Cta
    bullets?: string[]
    image?: HeroImage
  }>(),
  {
    eyebrow: "Impresión y rotulación en Barcelona",
    title: "Impresión profesional para empresas",
    subtitle:
      "Gran formato, vinilos, PLV, rótulos, lonas, cartelería y más. Te asesoramos y producimos con calidad y plazos reales.",
    primaryCta: () => ({ label: "Solicitar presupuesto", to: "/contacto" }),
    secondaryCta: () => ({ label: "Ver categorías", to: "/categorias" }),
    bullets: () => ["Entrega y montaje", "Asesoramiento experto", "Producción propia", "Calidad garantizada"],
  }
)
</script>
