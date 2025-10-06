<!-- pages/categorias/[...slug].vue -->
<script setup lang="ts">
const { data: doc, pending, error } = await useCategoriaData();

// slug actual desde path (/categorias/foo[/bar])
const slug = computed(
  () => doc.value?.slug ?? (useRoute().params.slug as string[] | string)
);
const flatSlug = computed(() =>
  Array.isArray(slug.value) ? slug.value.join("/") : slug.value
);

const { data: productos } = await useCategoriaProductos(flatSlug.value);
</script>

<template>
  <main>
    <article v-if="doc">
      <h1>{{ doc.title }}</h1>
      <ContentRenderer :value="doc" />
    </article>

    <ProductList v-if="productos?.length" :products="productos" class="mt-12" />
  </main>
</template>
