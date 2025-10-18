<!-- Ejemplo simple de UI -->
<script setup lang="ts">
const { data, pending, error } = useGbpReviews();
</script>

<template>
  <div>
    <p v-if="pending">Cargando reseñas…</p>
    <p v-else-if="error">No se pudieron cargar las reseñas.</p>
    <div v-else>
      <h3 v-if="data?.averageRating">
        ⭐ {{ data.averageRating }} ({{ data?.total }} reseñas)
      </h3>
      <ul>
        <li v-for="r in data?.items" :key="r.id">
          <strong>{{ r.name }}</strong> — {{ r.rating }}★
          <div>{{ r.comment }}</div>
          <em v-if="r.reply">Respuesta: {{ r.reply }}</em>
        </li>
      </ul>
    </div>
  </div>
</template>
