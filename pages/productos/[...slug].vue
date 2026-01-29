<!-- pages/productos/[...slug].vue -->
<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.at(-1)
  : String(route.params.slug || "");

if (!slug) {
  throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
}

await navigateTo(`/productos/${slug}`, { redirectCode: 301 });
</script>

<template></template>
