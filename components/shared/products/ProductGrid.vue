<script lang="ts" setup>
import { computed, toRef } from "vue";

const props = defineProps<{ category: string }>();

const pageSize = 24;
const category = toRef(props, "category");

const { data, pending, error } = await useAsyncData(
  () => `products-grid-${category.value}`, // ✅ clave única por categoría
  () =>
    $fetch("/api/productos", {
      params: { categoria: category.value, page: 1, pageSize }, // ✅ filtra en server
    }),
  {
    server: true,
    dedupe: "defer",
    default: () => ({ items: [], total: 0 }),
    watch: [category], // ✅ revalida si cambia la prop
  }
);

// Lista de productos para el template
const items = computed(() => data.value?.items ?? []);
</script>

<template>
  <section class="container mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">
      Productos de la categoría "{{ category }}"
    </h2>

    <div v-if="pending" class="text-center text-sm text-gray-500 py-8">
      Cargando productos…
    </div>
    <div v-else-if="error" class="text-center text-sm text-red-600 py-8">
      No se pudieron cargar los productos.
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="product in items"
        :key="product.path || product.slug"
        :to="product.path || `/categorias/${category}/${product.slug}`"
        class="group flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full overflow-hidden"
      >
        <div class="p-4 text-center">
          <h5 class="font-semibold text-lg">{{ product.title }}</h5>
          <p v-if="product.description" class="text-sm text-gray-600">
            {{ product.description }}
          </p>
        </div>
        <div v-if="product.image">
          <img
            :src="product.image"
            :alt="product.alt || product.title"
            class="w-full h-auto"
          />
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
