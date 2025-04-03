<script lang="ts" setup>
const props = defineProps<{ category: string }>()

// Usamos el composable para recuperar los productos
const { data: productos, pending, error } = useProductosByCategoria(props.category)
</script>

<template>
  <section class="container mx-auto px-4 py-10">
    <!-- Indicador de carga -->
    <div v-if="pending" class="text-center">
      Cargando productos...
    </div>

    <!-- Mostrar error si ocurre -->
    <div v-else-if="error" class="text-red-600 text-center">
      Error al cargar productos: {{ error.message }}
    </div>

    <nav aria-label="Submenú de productos">
      <div class="flex flex-col">
        <NuxtLink
          v-for="product in productos"
          :key="product.path"
          :to="`/categorias/${category}/${product.slug}`"
          class="group flex flex-col bg-white shadow-sm hover:shadow-md transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          role="menuitem"
          tabindex="0"
        >
          <div class="text-center">

            <p class="font-medium text-base text-gray-800">
              {{ product.title }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </nav>
  </section>
</template>
