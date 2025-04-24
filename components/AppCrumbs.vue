<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsyncData, useNuxtApp } from '#app'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbItemData {
  title: string;
  path: string;
}

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref<BreadcrumbItemData[]>([])

async function fetchCategorias() {
  
  const { data, error } = await useAsyncData('categorias', async () => {
    if (!$content) {
      console.error('[AppCrumbs] $content is not available.')
      return []
    }
    try {
      return await $content('categorias').fetch()
    } catch (e) {
      console.error('[AppCrumbs] Error fetching categorias:', e)
      return []
    }
  })

  if (error.value) {
    console.error('[AppCrumbs] Error in useAsyncData:', error.value)
    return []
  }

  return data.value || []
}

async function generateBreadcrumbs(categorias: ParsedContent[]) {
  const path = route.path
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '')
  const segments = cleanPath.split('/').filter(Boolean)
  const items: BreadcrumbItemData[] = [{ title: 'Inicio', path: '/' }]
  let currentPath = ''

  for (const segment of segments) {
    currentPath = `${currentPath}/${segment}`
    const content = categorias.find(c => c._path === currentPath)

    let title = ''
    let finalPath = currentPath

    if (content) {
      title = content.nav || content.title || segment.replace(/-/g, ' ') || 'Segmento'
      finalPath = content._path || finalPath
    } else {
      if (segment && typeof segment === 'string') {
        title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        const titleMap: Record<string, string> = { 'categorias': 'Categorías' }
        title = titleMap[segment] || title
      } else {
        console.warn('Segmento de breadcrumb inválido:', segment)
        title = 'Desconocido'
      }
    }

    if (!items.some(item => item.path === finalPath)) {
      items.push({ title, path: finalPath })
    } else if (items[items.length - 1].path !== finalPath) {
      items.push({ title, path: finalPath })
    }
  }
  breadcrumbs.value = items
}

watch(
  () => route.path,
  async () => {
    const categorias = await fetchCategorias()
    await generateBreadcrumbs(categorias)
  },
  { immediate: true }
)
</script>

<template>
  <Breadcrumb v-if="breadcrumbs.length > 1" class="mb-4 px-4 md:px-0">
    <BreadcrumbList class="text-sm">
      <template v-for="(item, index) in breadcrumbs" :key="`${item.path}-${index}`">
        <BreadcrumbItem>
          <BreadcrumbLink
            v-if="index < breadcrumbs.length - 1"
            as-child
            class="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
          </BreadcrumbLink>
          <BreadcrumbPage v-else class="font-semibold text-[hsl(var(--color-primary))]">
            {{ item.title }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" class="text-muted-foreground" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>