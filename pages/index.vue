<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useCategoriasGrid } from "@/composables/useCategoriasGrid";

// 1) Grid categorías (igual)
const { data: catData, pending, error } = await useCategoriasGrid();
const categories = computed(() => catData.value?.items ?? []);

// 2) Ubicaciones: SOLO CLIENTE
type GbpLocation = { id: string; title: string };

const {
  data: locations,
  pending: pendingLocations,
  error: errorLocations,
} = await useFetch<GbpLocation[]>("/api/gbp/locations", {
  server: false, // <— clave: nada de SSR
  credentials: "include", // <— asegura envío de cookies
  key: "gbp-locations-client",
});

// 3) Reseñas: SOLO CLIENTE (cuando haya location)
type Review = {
  name: string;
  photoUrl?: string;
  rating: "FIVE" | "FOUR" | "THREE" | "TWO" | "ONE";
  comment?: string;
  reply?: string;
  createTime?: string;
};

const reviews = ref<Review[]>([]);
const pendingReviews = ref(false);
const errorReviews = ref<unknown>(null);

watchEffect(async () => {
  if (!locations.value?.length) return;
  pendingReviews.value = true;
  errorReviews.value = null;
  try {
    const locationId = locations.value[0].id; // p.ej. "locations/1234567890"
    reviews.value = await $fetch<Review[]>("/api/gbp/reviews", {
      query: { locationId },
      credentials: "include",
    });
  } catch (e) {
    errorReviews.value = e;
    reviews.value = [];
  } finally {
    pendingReviews.value = false;
  }
});

// Utilidad rating
const getStarRating = (ratingText: Review["rating"] | string) => {
  const map: Record<string, number> = { FIVE: 5, FOUR: 4, THREE: 3, TWO: 2, ONE: 1 };
  return map[ratingText] ?? 0;
};
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
    <div>
      <h1>Mis Reseñas de Google</h1>

      <div v-if="pendingLocations">Cargando ubicaciones...</div>
      <div v-if="errorLocations">
        Error al cargar ubicaciones: {{ errorLocations.message }}
      </div>
      <div v-if="locations && locations.length > 0">
        <h2>
          Mostrando reseñas para: <strong>{{ locations[0].title }}</strong>
        </h2>
      </div>

      <hr />

      <div v-if="pendingReviews">Cargando reseñas...</div>
      <div v-if="errorReviews">Error al cargar reseñas: {{ errorReviews.message }}</div>

      <div v-if="reviews.length > 0" class="reviews-container">
        <div v-for="(review, index) in reviews" :key="index" class="review-card">
          <div class="reviewer-info">
            <img :src="review.photoUrl" alt="Foto de perfil" class="reviewer-photo" />
            <div>
              <strong>{{ review.name }}</strong>
              <div class="stars">
                <span v-for="n in getStarRating(review.rating)" :key="n">⭐</span>
              </div>
            </div>
          </div>
          <p class="comment">"{{ review.comment }}"</p>
          <div v-if="review.reply" class="reply">
            <strong>Nuestra respuesta:</strong>
            <p>"{{ review.reply }}"</p>
          </div>
        </div>
      </div>
      <div v-else-if="!pendingReviews">
        <p>No se encontraron reseñas para esta ubicación.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.review-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f9f9f9;
}
.reviewer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.reviewer-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.comment {
  font-style: italic;
  color: #333;
}
.reply {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 3px solid #007bff;
  background-color: #eef;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
