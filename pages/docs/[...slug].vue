<template>
  <article class="prose dark:prose-invert lg:prose-xl max-w-none">
    <div v-if="pending">
      <p>Cargando contenido...</p>
    </div>

    <div v-else-if="error">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <strong class="font-bold">¡Error al cargar el documento!</strong>
        <p><code>{{ route.path }}</code></p>
        <pre class="text-xs mt-1">{{ error.message }}</pre>
      </div>
    </div>

    <ContentRenderer v-else-if="doc" :value="doc" />

    <div v-else class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded" role="alert">
      <strong class="font-bold">Documento no encontrado</strong>
      <p><code>{{ route.path }}</code></p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { DocsCollectionItem } from '~/types/content' // Opcional, si usas tipado

definePageMeta({ layout: 'docs' })

const route = useRoute()

// Esta es la forma recomendada por la doc oficial:
const { data: doc, pending, error } = await useAsyncData<DocsCollectionItem | null>(
  `docs-content-${route.path}`,
  () => queryCollection('docs').path(route.path).first()
)

watchEffect(() => {
  if (doc.value) {
    useHead({
      title: doc.value.title ?? 'Documentación',
      meta: [
        { name: 'description', content: doc.value.description ?? 'Documentación interna' },
        { name: 'robots', content: 'noindex, nofollow' }
      ]
    })
  }
})
</script>
