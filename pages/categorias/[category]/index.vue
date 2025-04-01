<template>
  <div>
    <CategoryHeader
      :title="page?.title"
      :description="page?.description"
      :image="`/img/categorias/${page?.image}`"
      :alt="page?.alt"
      :link="`/categorias/${page?.slug}`"
    />

    <ContentRenderer v-if="page" :value="page" class="mb-10" />
    <Nav :categories="categories" />
    
    <ProductGrid :category="categorySlug" />
  </div>
</template>

<script setup lang="ts">

const { data: categories } = await useCategorias()

const route = useRoute()
const categorySlug = route.params.category as string

const { data: page } = await useCategoriaBySlug(categorySlug)
</script>

