<script setup lang="ts">
import { computed } from "vue"
import GoogleReviewsCarousel from "./Carousel.vue"
import { useReviews } from "@/composables/useReviews"

// ✅ en script sí
const isDev = import.meta.dev

const { items, average, total, mapsUrl, pending, error } = useReviews({
  lang: "es",
  limit: 6,
})
</script>

<template>
  <section class="max-w-5xl mx-auto py-8">
    <div v-if="pending && items.length === 0">Cargando reseñas…</div>

    <p v-else-if="error" class="text-sm text-destructive">
      No se han podido cargar las reseñas.
      <span v-if="isDev" class="block mt-1 opacity-80">
        {{ (error as any)?.statusMessage || (error as any)?.message || String(error) }}
      </span>
    </p>

    <GoogleReviewsCarousel
      v-else
      title="Opiniones de clientes"
      :reviews="items"
      :rating="average"
      :count="total"
      :maps-url="mapsUrl || ''"
      business-name="Repro Disseny"
      business-url="https://reprodisseny.com"
    />
  </section>
</template>
