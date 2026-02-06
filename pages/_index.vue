<script setup lang="ts">
import { computed } from "vue";
import { useCategoriasGrid } from "@/composables/useCategoriasGrid";
import { useReviews } from "@/composables/useReviews";

// 1) Categorías (SSR)
const { data: catData, pending, error } = await useCategoriasGrid();
const categories = computed(() => catData.value?.items ?? []);

// 2) Reseñas
// En prod: 'places' (SSR e indexable). En dev, si sigues con GBP: 'gbp'.
const source = import.meta.env.DEV ? "gbp" : "places";

// Places: pon tu placeId (no es secreto). Si usas GBP en dev, no es necesario.
const placeId = "TU_PLACE_ID";

// Enlace a Maps. Si en tu endpoint de Places devuelves googleMapsUri, cámbialo aquí.
const mapsUrl = computed(() => "https://maps.google.com/?cid=TU_CID");

const {
  items,
  average,
  total,
  pending: pendingReviews,
  error: errorReviews,
} = useReviews({
  source, // 'places' | 'gbp'
  placeId, // requerido si source='places'
  lang: "es",
});

// Navegación EXTERNA para iniciar OAuth (solo si usas GBP)
const connect = () => navigateTo("/api/gbp/oauth/start", { external: true });
</script>

<template>
  <div>
    <SharedMenuCategories />
    <SharedSliderHome />

    <!-- estados categorías -->
    <div v-if="pending" class="py-10 text-center text-muted-foreground">
      Cargando categorías…
    </div>
    <div v-else-if="error" class="py-10 text-center text-destructive">
      Error al cargar categorías
    </div>

    <!-- grid categorías -->
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
      class="mb-10"
    />

    <!-- features -->
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

    <!-- Carrusel de reseñas -->
    <section class="mt-12">
      <div v-if="pendingReviews" class="py-6 text-center text-muted-foreground">
        Cargando reseñas…
      </div>
      <p v-else-if="errorReviews" class="text-sm text-destructive">
        No se han podido cargar las reseñas.
      </p>
      <GoogleReviewsCarousel
        v-else
        title="Opiniones de clientes"
        :reviews="items"
        :rating="average ?? 0"
        :count="total ?? items.length"
        :maps-url="mapsUrl"
        business-name="Repro Disseny"
        business-url="https://reprodisseny.com"
      />
    </section>

    <!-- Botón de conexión SOLO si trabajas con GBP (dev). En prod con Places, no hace falta -->
    <div v-if="source === 'gbp'" class="mt-12 flex items-center gap-3">
      <a href="/api/gbp/oauth/start">Conectar</a>
    </div>
  </div>
</template>

<style scoped></style>
