<script setup lang="ts">
  const { data: docs } = await useAsyncData('documents-list', () => {
    return queryCollection('categorias')
      .select('title', 'path', 'description')
      .all()
  })
</script>

<template>
  <nav class="categoryMenu__block">
    <ul class="flex justify-between w-full">
      <li v-for="doc in docs" :key="doc.path" class="categoryMenu__item">
        <NuxtLink :to="doc.path" class="categoryMenu__link">
          {{ doc.title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>