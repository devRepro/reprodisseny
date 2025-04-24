<script setup lang="ts">
import { queryContent } from '#imports'; // ¿Falla ya aquí?
import { useAsyncData } from '#imports'; // ¿O aquí?
import { useRoute } from 'vue-router'; // Este debería funcionar

console.log('Intentando importar...'); 
const route = useRoute();
console.log('Ruta actual:', route.path);

// Intenta la consulta más simple posible dentro de useAsyncData
const { data } = await useAsyncData('test-query', () => queryContent().where({ _path: route.path }).findOne());
console.log('Resultado simple de query:', data.value); 

// No hagas nada más por ahora (ni useHead, ni computed, ni error handling)
</script>
<template>
  <div>Página de prueba</div>
  <pre>{{ data }}</pre> 
</template>