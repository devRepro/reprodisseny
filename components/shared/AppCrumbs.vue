<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategoriasNav } from '@/composables/useCategoriasNav'

import { useHead, useRuntimeConfig } from '#imports'

interface Crumb {
  title: string
  path: string
}

// Datos de navegación y ruta actual
const route = useRoute()
const router = useRouter()
const { data: categoriasNav, pending, error } = useCategoriasNav()
const baseUrl = useRuntimeConfig().public.siteUrl || 'https://reprodisseny.com'

// Construcción de breadcrumbs
const crumbs = computed<Crumb[]>(() => {
  const base: Crumb[] = [{ title: 'Inicio', path: router.options.history.base || '/' }]

  if (pending.value || error.value || !categoriasNav.value) {
    return base
  }

  const segments = route.path.split('/').filter(Boolean)
  let currentLevel = categoriasNav.value.menuItems ?? []
  let accumulatedPath = ''

  const dynamicCrumbs = segments.map(segment => {
    accumulatedPath += `/${segment}`
    const match = currentLevel.find(item => item.slug === segment)
    const title = match
      ? match.nav || match.title
      : segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    currentLevel = match?.children ?? []
    return { title, path: accumulatedPath }
  })

  return [...base, ...dynamicCrumbs]
})

const showCrumbs = computed(() => crumbs.value.length > 1)

// JSON-LD para BreadcrumbList
useHead(() => {
  if (!showCrumbs.value) return {}

  const itemList = crumbs.value.map((crumb, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: crumb.title,
    item: `${baseUrl}${crumb.path}`
  }))

  return {
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: itemList
        })
      }
    ]
  }
})
</script>


<template>
  <Breadcrumb v-if="showCrumbs" class="mb-4 px-4 md:px-0">
    <BreadcrumbList class="text-sm flex flex-wrap items-center">
      <BreadcrumbItem v-for="(item, idx) in crumbs" :key="item.path">
        <template v-if="idx < crumbs.length - 1">
          <BreadcrumbLink
            as-child
            class="text-muted-foreground hover:text-foreground focus-visible:text-foreground transition-colors"
          >
            <NuxtLink :to="item.path" aria-label="`Ir a ${item.title}`">
              {{ item.title }}
            </NuxtLink>
          </BreadcrumbLink>
          <BreadcrumbSeparator class="mx-2 text-muted-foreground" />
        </template>
        <template v-else>
          <BreadcrumbPage class="font-semibold text-primary">
            {{ item.title }}
          </BreadcrumbPage>
        </template>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>
