<template>
  <section v-if="products?.length" class="mt-16">
    <h2 id="productos-heading" class="text-2xl font-bold mb-8 text-foreground">
      Productos
    </h2>
    <ul class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="product in products" :key="product._path">
        <Card :product="product" />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">

const props = defineProps<{
  products: Array<any>
}>()
</script>
