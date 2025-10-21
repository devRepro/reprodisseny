<script setup lang="ts">
import GoogleReviewsCarousel from "@/components/GoogleReviewsCarousel.vue";
import { useReviews } from "@/composables/useReviews";

// En dev tira de GBP (login); en prod usa Places (público/SSR)
const source = import.meta.env.DEV ? "gbp" : "places";
const placeId = "YOUR_GOOGLE_PLACE_ID"; // <- el tuyo
const mapsUrl = "https://maps.google.com/?cid=TU_CID"; // opcional

const { items, average, total, pending, error } = useReviews({
  source,
  placeId,
  lang: "es",
});
</script>

<template>
  <section class="max-w-5xl mx-auto">
    <div v-if="pending">Cargando reseñas…</div>
    <p v-else-if="error" class="text-sm text-destructive">
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
</template>
