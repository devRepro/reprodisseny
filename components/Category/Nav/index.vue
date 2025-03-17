<script setup lang="ts">
  const { data: docs } = await useAsyncData('documents-list', () => {
    return queryCollection('categorias')
      .select('title', 'nav', 'path', 'description')
      .all()
  })
</script>

<template>
  <nav class="categoryMenu__block">
    <ul class="flex justify-between w-full">
      <li v-for="doc in docs" :key="doc.path" class="categoryMenu__item">
        <NuxtLink :to="doc.path" class="categoryMenu__link">
          {{ doc.nav }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
<style>
  .categoryMenu__block {
    background: #1a1c20;
    border-radius: 4px;
    color: #FFF;
    display: flex;
    font-size: 14px;
    gap: 10px;
    padding: 8px 16px;
}

</style>