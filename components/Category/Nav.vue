<template>
  <nav>
    <ul v-if="categories && categories.length" class="flex gap-4 categoryMenu px-4 py-2">
      <li
        v-for="category in categories"
        :key="category._path"
        class="relative group"
        @mouseenter="loadProducts(category.slug)"
      >
        <NuxtLink :to="category._path" class="font-semibold">
          {{ category.title }}
        </NuxtLink>

        <!-- Submenú de productos -->
        <ul
          v-if="productsByCategory[category.slug]?.length"
          class="absolute top-full left-0 mt-2 bg-white text-black p-3 rounded shadow-lg hidden group-hover:block min-w-[200px] z-50"
        >
          <li
            v-for="product in productsByCategory[category.slug]"
            :key="product._path"
            class="hover:underline"
          >
            <NuxtLink :to="product._path">{{ product.title }}</NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">


// ✅ defineProps con valor por defecto para evitar `undefined`
const props = withDefaults(defineProps<{
  categories?: {
    title: string
    slug: string
    _path: string
  }[]
}>(), {
  categories: () => []
})

const productsByCategory = reactive<Record<string, any[]>>({})

const loadProducts = async (slug: string) => {
  if (productsByCategory[slug]) return
  const productos = await useProductosByCategoria(slug)
  productsByCategory[slug] = productos
}
</script>

<style scoped>
.categoryMenu {
  background-color: #333;
  color: #fff;
}
.categoryMenu a {
  color: #fff;
  padding: 0.5rem 1rem;
  display: block;
}
.categoryMenu li:hover > a {
  background-color: #444;
}
</style>
