<script setup lang="ts">
const {
  data: locationsData,
  pending: locationsPending,
  error: locationsError,
} = useGbpLocations();

const locationId = computed(() => {
  const list = locationsData.value?.locations || [];
  return list.length ? list[0].id : null;
});

const allReviews = ref<any[]>([]);
const nextPageToken = ref<string | null>(null);
const reviewsError = ref<any | null>(null);
const reviewsPending = ref(false);

async function fetchReviews(token: string | null = null) {
  if (!locationId.value) return;
  reviewsPending.value = true;
  reviewsError.value = null;
  try {
    const { items, nextPageToken: nextToken } = await $fetch("/api/gbp/reviews", {
      params: { locationId: locationId.value, pageToken: token || undefined },
    });
    allReviews.value.push(...items);
    nextPageToken.value = nextToken || null;
  } catch (err) {
    reviewsError.value = err;
  } finally {
    reviewsPending.value = false;
  }
}

watch(
  locationId,
  (id) => {
    if (id && allReviews.value.length === 0) fetchReviews();
  },
  { immediate: true }
);
function loadMore() {
  if (nextPageToken.value) fetchReviews(nextPageToken.value);
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-4">
    <h2 class="text-2xl font-bold">Mi Panel de Reseñas</h2>

    <!-- Importante: para /api usa <a>, no <NuxtLink> -->
    <a
      href="/api/gbp/oauth/login?returnTo=/reviews"
      class="inline-block rounded px-4 py-2 border"
    >
      Conectar con Google
    </a>

    <div v-if="locationsPending">Buscando ubicaciones...</div>
    <div v-else-if="locationsError">
      Error al cargar ubicaciones: {{ locationsError.message }}
    </div>

    <div v-if="reviewsPending && allReviews.length === 0">Cargando reseñas...</div>
    <div v-else-if="reviewsError">
      Error al cargar reseñas: {{ reviewsError.message }}
    </div>

    <ul v-if="allReviews.length > 0" class="space-y-3">
      <li v-for="review in allReviews" :key="review.id" class="border rounded p-3">
        <strong>{{ review.name }} ({{ review.rating }}★)</strong>
        <p>{{ review.comment }}</p>
        <em v-if="review.reply">Respuesta: {{ review.reply }}</em>
      </li>
    </ul>

    <button v-if="nextPageToken" @click="loadMore" :disabled="reviewsPending">
      {{ reviewsPending ? "Cargando..." : "Cargar más reseñas" }}
    </button>
  </div>
</template>
