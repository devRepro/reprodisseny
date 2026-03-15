<script setup lang="ts">
const route = useRoute();

const target = computed(() => {
  const category = String(route.params.category ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  const rest = Array.isArray(route.params.slug)
    ? route.params.slug
    : String(route.params.slug ?? "")
        .split(/[\/,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  const parts = [category, ...rest].filter(Boolean);
  return `/categorias/${parts.join("/")}`.replace(/\/{2,}/g, "/");
});

await navigateTo(target.value, { redirectCode: 301 });
</script>

<template />
