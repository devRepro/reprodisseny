<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.at(-1)
  : String(route.params.slug || "");

<<<<<<< HEAD
const { data: product } = await useAsyncData(route.path, () =>
  queryCollection("productos").path(route.path).first()
);

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
}
</script>

<template>
  <div>
    <HeroBanner
      :title="product.title"
      :subtitle="product.description || ''"
      :image-src="product.image?.src || ''"
      :cta="{ label: 'Pedir presupuesto', to: '/presupuesto' }"
    />

    <!-- Aquí puedes montar el layout del PNG Producto -->
    <!-- Gallery / atributos / FAQ / CTA etc -->
  </div>
</template>
=======
if (!slug) {
  throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
}

await navigateTo(`/productos/${slug}`, { redirectCode: 301 });
</script>

<template></template>
>>>>>>> main
