<script setup lang="ts">
const route = useRoute();

const target = computed(() => {
  const category = String(route.params.category ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  if (!category) return "/categorias";
  return `/categorias/${category}`;
});

await navigateTo(target.value, { redirectCode: 301 });
</script>

<template />
