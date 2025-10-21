<!--
<script setup lang="ts">
// 1. Usar tu composable para obtener las ubicaciones
const {
  data: locationsData,
  pending: locationsPending,
  error: locationsError,
} = useGbpLocations();

// 2. Obtener el ID de la primera ubicación (o permitir al usuario elegir)
const locationId = computed(() => {
  if (!locationsData.value?.locations || locationsData.value.locations.length === 0) {
    return null;
  }
  // Simplemente toma la primera ubicación para este ejemplo
  return locationsData.value.locations[0].id;
});

// 3. Variables para las reseñas y paginación
const allReviews = ref<any[]>([]);
const nextPageToken = ref<string | null>(null);
const reviewsError = ref<any | null>(null);
const reviewsPending = ref(false);

// 4. Función para buscar reseñas (adaptada para paginación)
async function fetchReviews(token: string | null = null) {
  if (!locationId.value) return; // No hacer nada si no hay ID

  reviewsPending.value = true;
  reviewsError.value = null;

  try {
    const { items, nextPageToken: nextToken } = await $fetch("/api/gbp/reviews", {
      params: {
        locationId: locationId.value,
        pageToken: token || undefined, // Enviar pageToken si existe
      },
    });

    // Añadir las nuevas reseñas a la lista existente
    allReviews.value.push(...items);
    // Guardar el token para la siguiente llamada
    nextPageToken.value = nextToken;
  } catch (err) {
    reviewsError.value = err;
  } finally {
    reviewsPending.value = false;
  }
}

// 5. Observador para cargar las reseñas iniciales cuando el locationId esté disponible
watch(
  locationId,
  (newId) => {
    if (newId && allReviews.value.length === 0) {
      // Cargar solo la primera vez
      fetchReviews();
    }
  },
  { immediate: true }
); // 'immediate' intenta ejecutarlo al cargar

// Función para el botón "Cargar más"
function loadMore() {
  if (nextPageToken.value) {
    fetchReviews(nextPageToken.value);
  }
}
</script>

<template>
  <div>
    <h2>Mi Panel de Reseñas</h2>

    <div v-if="locationsPending">Buscando ubicaciones...</div>
    <div v-if="locationsError">
      Error al cargar ubicaciones: {{ locationsError.message }}
    </div>

    <div v-if="reviewsPending && allReviews.length === 0">Cargando reseñas...</div>
    <div v-if="reviewsError">Error al cargar reseñas: {{ reviewsError.message }}</div>

    <ul v-if="allReviews.length > 0">
      <li v-for="review in allReviews" :key="review.id">
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
-->
<script></script>
<template>
  <div>Hola mundo</div>
</template>
