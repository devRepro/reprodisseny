<!-- components/marketing/category/CategoryHero.vue -->
<script setup lang="ts">
const props = defineProps<{
  category: any
}>()

const bgSrc = computed(() => {
  const c = props.category || {}
  // prioridad: imageSrc plano, luego image.src
  return c.imageSrc || c.image?.src || null
})

const title = computed(() => props.category?.title || props.category?.nav || "Categoria")
const description = computed(() => props.category?.description || "")
const breadcrumbs = computed(() => props.category?.breadcrumbs || [])
const cta = computed(() => props.category?.cta || { text: "Veure productes", link: "#productos" })
</script>

<template>
  <header class="relative overflow-hidden border-b">
    <!-- Background -->
    <div v-if="bgSrc" class="absolute inset-0">
      <img
        :src="bgSrc"
        :alt="category?.alt || title"
        class="h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <!-- Overlay para legibilidad -->
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-6 py-12 lg:py-16">
      <!-- Breadcrumbs -->
      <nav v-if="breadcrumbs.length" class="text-sm text-white/80">
        <ol class="flex flex-wrap items-center gap-2">
          <li v-for="(b, i) in breadcrumbs" :key="b.url" class="flex items-center gap-2">
            <NuxtLink :to="b.url" class="hover:underline">
              {{ b.name }}
            </NuxtLink>
            <span v-if="i < breadcrumbs.length - 1">/</span>
          </li>
        </ol>
      </nav>

      <!-- Badges -->
      <div class="mt-6 flex flex-wrap gap-2">
        <span
          v-if="category?.featured"
          class="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white"
        >
          Destacada
        </span>
        <span
          v-if="category?.hidden"
          class="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white"
        >
          No indexada
        </span>
        <span
          v-if="category?.nav"
          class="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white"
        >
          {{ category.nav }}
        </span>
      </div>

      <!-- Title / description -->
      <h1 class="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {{ title }}
      </h1>

      <p v-if="description" class="mt-4 max-w-2xl text-base leading-7 text-white/85">
        {{ description }}
      </p>

      <!-- CTAs -->
      <div class="mt-8 flex flex-wrap gap-3">
        <a
          :href="cta.link"
          class="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          {{ cta.text }}
        </a>

        <!-- CTA guía (sin background, como enlace secundario) -->
        <NuxtLink
          to="/guia-impresion"
          class="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
        >
          Com preparar arxius
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
