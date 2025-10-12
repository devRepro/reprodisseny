<script setup lang="ts">
import { computed } from "vue";
import { useCategoriasGrid } from "@/composables/useCategoriasGrid";

const { data, pending, error } = await useCategoriasGrid();

// Soporta ambas formas por si tu payload trae items o tree
const categories = computed(() => data.value?.items ?? []);
</script>

<template>
  <div>
    <SharedMenuCategories />
    <SharedSliderHome />

    <!-- estados -->
    <div v-if="pending" class="py-10 text-center text-muted-foreground">
      Cargando categorías…
    </div>
    <div v-else-if="error" class="py-10 text-center text-destructive">
      Error al cargar categorías
    </div>

    <!-- grid -->
    <CategoryCarousel
      v-else
      :items="categories"
      :keyFn="(c) => c.slug || c.id"
      :titleFn="(c) => c.nav ?? c.title ?? ''"
      :linkFn="(c) => c.path || `/categorias/${c.slug}`"
      :imageFn="(c) => c.image"
      :excerptFn="(c) => c.description ?? ''"
      :countFn="(c) => c.productsCount"
      :badgesFn="(c) => [c.featured && 'Destacado'].filter(Boolean)"
      baseImage="/img/categorias"
    />

    <div class="space-y-4">
      <FeatureSection
        title="Impresión digital personalizada"
        image="/img/servicios/impresion-digital.webp"
        alt="Impresión digital personalizada"
        description="<p>Impresión ágil y de alta calidad...</p>"
      />
      <FeatureSection
        title="Impresión offset de alto volumen"
        image="/img/servicios/impresion-offset.webp"
        alt="Impresión offset de alto volumen"
        description="<p>Alta fidelidad de color...</p>"
        reversed
      />
      <FeatureSection
        title="Gran formato e instalación profesional"
        image="/img/servicios/gran-formato.webp"
        alt="Gran formato e instalación profesional"
        description="<p>Diseñamos, imprimimos e instalamos...</p>"
      />
      <FeatureSection
        title="Montajes Profesionales"
        image="/img/servicios/gran-formato.webp"
        alt="Montajes Profesionales"
        description="<p>Nuestro equipo experto se encarga...</p>"
        reversed
      >
        <template #actions>
          <button class="bg-accent text-white py-2 px-4 rounded-md hover:bg-accent-dark">
            Ver proyectos
          </button>
        </template>
      </FeatureSection>
    </div>
  </div>
</template>
