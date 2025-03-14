<template>
     <!-- Render the blog post as Prose & Vue components -->
  <ContentRenderer :value="page" />
</template>

<script setup lang="ts">

    //cargamos las categorias dinámicamente
    const category = useRoute().params.category

    const { data: page } = await useAsyncData(`categorias-${category}`, () => {
        return queryCollection('categorias').path(`/categorias/${category}`).first()
    })

</script>

