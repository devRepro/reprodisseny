<script setup lang="ts">
import { useGoogleReviews } from "@/composables/useGoogleReviews";
const {
  locationsRes,
  firstLocation,
  reviews,
  pendingReviews,
  errorReviews,
} = useGoogleReviews();
</script>

<template>
  <section>
    <h1>Reseñas de Google</h1>

    <div v-if="locationsRes.pending">Cargando ubicaciones…</div>
    <div v-else-if="locationsRes.error">Error: {{ locationsRes.error?.message }}</div>

    <div v-if="firstLocation">
      <h2>
        Mostrando reseñas para <strong>{{ firstLocation.title }}</strong>
      </h2>
    </div>

    <div v-if="pendingReviews">Cargando reseñas…</div>
    <div v-else-if="errorReviews">Error: {{ (errorReviews as any)?.message }}</div>

    <div v-else-if="reviews.length">
      <article v-for="(r, i) in reviews" :key="i" class="review">
        <header class="row">
          <img v-if="r.avatar" :src="r.avatar" alt="" class="avatar" />
          <div>
            <strong>{{ r.author }}</strong>
            <div class="stars"><span v-for="n in r.rating" :key="n">⭐</span></div>
          </div>
        </header>
        <p class="text">“{{ r.text }}”</p>
        <footer v-if="r.reply" class="reply">
          <strong>Nuestra respuesta:</strong> {{ r.reply }}
        </footer>
      </article>
    </div>
    <p v-else>No hay reseñas.</p>
  </section>
</template>

<style scoped>
.review {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
  margin-bottom: 1rem;
}
.row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.text {
  margin-top: 6px;
  font-style: italic;
}
.reply {
  margin-top: 10px;
  padding-left: 12px;
  border-left: 3px solid #3b82f6;
  background: #eef5ff;
}
</style>
