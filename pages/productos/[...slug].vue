<!-- pages/productos/[...slug].vue -->
<script setup lang="ts">
const route = useRoute();

// 🔎 patrón Content v3: resolver por route.path (y fallback por slug)
const { data: product, pending, error } = await useAsyncData(
  () => `product:${route.path}`,
  async () => {
    let doc = await queryCollection("productos").path(route.path).first();
    if (doc) return doc;
    const slug =
      route.params.slug &&
      (Array.isArray(route.params.slug)
        ? route.params.slug.at(-1)
        : String(route.params.slug));
    if (!slug) return null;
    return await queryCollection("productos").where("slug", "=", slug).first();
  },
  { watch: [() => route.path] }
);

// JSON-LD Product si viene en front-matter
const jsonLd = computed(() => {
  const d = product.value;
  if (!d?.schema) return null;
  return JSON.stringify({ "@context": "https://schema.org", ...d.schema });
});

useHead(() => ({
  title: product.value?.metatitle || product.value?.title,
  meta: [
    {
      name: "description",
      content: product.value?.metadescription || product.value?.description || "",
    },
    ...(product.value?.canonical
      ? [{ rel: "canonical", href: product.value.canonical }]
      : []),
  ],
  script: jsonLd.value ? [{ type: "application/ld+json", innerHTML: jsonLd.value }] : [],
}));
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-10">
    <SharedMenuCategories />
    <div v-if="pending">Cargando…</div>
    <div v-else-if="error || !product">Producto no encontrado.</div>

    <div v-else class="grid md:grid-cols-2 gap-10">
      <section>
        <ProductHero
          :title="product.title"
          :description="product.description"
          :image="product.image"
          :alt="product.alt"
          :labels="product.badges"
        />
        <ContentRenderer v-if="product.body" :value="product" class="prose mt-8" />
      </section>

      <ProductForm :product="product" />
    </div>
  </main>
</template>
