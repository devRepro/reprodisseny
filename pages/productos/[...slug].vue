<script setup lang="ts">
const route = useRoute();

// reconstruye el path del doc bajo /productos/… (soporta subcarpetas)
const productPath = computed(() => {
  const segs = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
  return "/productos/" + segs.filter(Boolean).join("/");
});

// Carga el doc de Content por path (lado Vue)
const {
  data: product,
  pending,
  error,
} = await useAsyncData(
  `product:${productPath.value}`,
  () => queryCollection("productos").path(productPath.value).first(),
  { default: () => null }
);
</script>

<template>
  <main class="max-w-7xl mx-auto px-6 py-10">
    <div v-if="pending">Cargando…</div>
    <div v-else-if="error || !product">Producto no encontrado.</div>
    <div v-else class="grid md:grid-cols-2 gap-10">
      <section>
        <h1 class="text-3xl font-semibold">{{ product.title }}</h1>
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.alt || product.title"
          class="mt-4 rounded-xl"
        />
        <ContentRenderer v-if="product.body" :value="product" class="prose mt-6" />
      </section>
      <aside>
        <ProductForm :product="product" />
      </aside>
    </div>
  </main>
</template>
