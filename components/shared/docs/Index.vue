<script setup lang="ts">
const { data: docs } = await useAsyncData('docs-index', () =>
  queryContent('docs')
    .where({ _path: { $ne: '/docs' } })
    .sort({ title: 1 })
    .find()
)
</script>

<template>
  <ul class="list-disc pl-4">
    <li v-for="doc in docs" :key="doc._path">
      <NuxtLink :to="doc._path">{{ doc.title }}</NuxtLink>
    </li>
  </ul>
</template>
