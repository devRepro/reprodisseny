<!-- components/google/reviews/Section.vue -->
<script setup lang="ts">
import { computed } from "vue";
import GoogleReviewsCarousel from "./Carousel.vue";
import { usePlaceReviews } from "@/composables/usePlaceReviews";

const isDev = import.meta.dev;

const { items, average, total, mapsUrl, pending, error } = usePlaceReviews({
  lang: "es",
  limit: 6,
});

const devErrorMessage = computed(() => {
  if (!error.value) return "";

  return (
    error.value.statusMessage ||
    error.value.message ||
    String(error.value)
  );
});
</script>

<template>
  <GoogleReviewsCarousel
    v-if="!pending && !error && items.length > 0"
    title="Opiniones de clientes"
    :reviews="items"
    :rating="average"
    :count="total"
    :maps-url="mapsUrl || ''"
    business-name="Repro Disseny"
    business-url="https://reprodisseny.com"
  />

  <section
    v-else
    class="google-reviews-section"
  >
    <div class="container-wide">
      <div
        v-if="pending && items.length === 0"
        class="google-reviews-empty"
      >
        Cargando reseñas…
      </div>

      <p
        v-else-if="error"
        class="text-sm text-destructive"
      >
        No se han podido cargar las reseñas.

        <span
          v-if="isDev && devErrorMessage"
          class="mt-1 block opacity-80"
        >
          {{ devErrorMessage }}
        </span>
      </p>

      <div
        v-else
        class="google-reviews-empty"
      >
        No hay reseñas para mostrar.
      </div>
    </div>
  </section>
</template>