<!-- components/product/ProductHero.vue -->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    image?: string;
    alt?: string;
    labels?: string[];
  }>(),
  { description: "", image: "/img/placeholders/mockup.webp", alt: "", labels: () => [] }
);

// Detecta si el módulo @nuxt/image está inyectado
const hasNuxtImage = Boolean(useNuxtApp().$img); // ← sin acceder en el template
</script>

<template>
  <header class="grid gap-6 md:grid-cols-2 items-start">
    <div>
      <h1 class="text-3xl md:text-4xl font-bold leading-tight">{{ title }}</h1>
      <p v-if="description" class="mt-4 text-muted-foreground text-lg">
        {{ description }}
      </p>
      <div v-if="labels?.length" class="mt-5 flex flex-wrap gap-2">
        <span
          v-for="(chip, i) in labels"
          :key="i"
          class="px-3 py-1 text-sm rounded-full bg-muted text-foreground/80"
          >{{ chip }}</span
        >
      </div>
    </div>

    <div class="w-full">
      <!-- Renderiza NuxtImg solo si el módulo está disponible -->
      <ClientOnly>
        <NuxtImg
          v-if="hasNuxtImage && image"
          :src="image"
          :alt="alt || title"
          sizes="(max-width: 768px) 100vw, 50vw"
          densities="x1 x2"
          format="webp"
          class="w-full h-auto rounded-xl object-cover shadow"
        />
      </ClientOnly>

      <img
        v-if="!hasNuxtImage && image"
        :src="image"
        :alt="alt || title"
        loading="eager"
        class="w-full h-auto rounded-xl object-cover shadow"
      />
    </div>
  </header>
</template>
