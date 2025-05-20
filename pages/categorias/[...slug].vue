<script setup lang="ts">

import { useCategoriaData } from '@/composables/useCategoriaData'

const { contentData, pending, error } = useCategoriaData()
const contentType = computed(() => contentData.value?.type)

if (process.client) {
  watchEffect(() => {
    setPageLayout(contentType.value === 'producto' ? 'productos' : 'categorias')
  })
}

const route = useRoute()
const config = useRuntimeConfig().public

defineSeoMeta(() => {
  if (!contentData.value) return {}
  const url = `${config.siteUrl}${route.fullPath}`
  return {
    title: contentData.value.metaTitle || contentData.value.title,
    description: contentData.value.metaDescription || contentData.value.description,
    link: [{ rel: 'canonical', href: url }],
    ogTitle: contentData.value.metaTitle || contentData.value.title,
    ogDescription: contentData.value.metaDescription || contentData.value.description,
    ogImage: contentData.value.image ? `${config.siteUrl}/${contentData.value.image}` : undefined,
    twitterCard: 'summary_large_image'
  }
})

defineSchemaOrg(() => {
  if (!contentData.value) return []
  const base = config.siteUrl
  const crumbs = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: base },
    { '@type': 'ListItem', position: 2, name: 'Categorías', item: `${base}/categorias` },
    { '@type': 'ListItem', position: 3, name: contentData.value.title, item: `${base}${route.fullPath}` }
  ]
  const list = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs
  }
  return contentData.value.type === 'producto'
    ? [contentData.value.schema, list]
    : [list]
})
</script>
<template>
  <SharedAppCrumbs />

  <ViewCategoria
    v-if="contentType === 'categoria'"
    :data="contentData"
  />
  <ViewSubcategoria
    v-else-if="contentType === 'subcategoria'"
    :data="contentData"
  />
  <ViewProducto
    v-else-if="contentType === 'producto'"
    :data="contentData"
  />

  <div v-if="pending" class="text-center py-10">Cargando…</div>
  <div v-else-if="error" class="text-center py-10 text-red-500">
    Error: {{ error.message }}
  </div>
</template>

