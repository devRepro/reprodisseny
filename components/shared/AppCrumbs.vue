<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoriasNav } from '@/composables/useCategoriasNav'
import { useHead, useRuntimeConfig } from '#imports'
import { NuxtLink } from '#components'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface Crumb { title: string; path: string }

const config = useRuntimeConfig()
const baseUrl = config.public.siteUrl

const route = useRoute()
const { data: categoriasNav, pending, error } = useCategoriasNav()

const crumbs = computed<Crumb[]>(() => {
  const base: Crumb[] = [{ title: 'Inicio', path: '/' }]
  if (pending.value || error.value || !categoriasNav.value) {
    return base
  }

  let currentLevel = categoriasNav.value.menuItems || []
  let acc = ''

  const dynamic = route.path
    .split('/')
    // ① sólo strings no vacías
    .filter(s => typeof s === 'string' && s.length > 0)
    .map(raw => {
      // ② garantizamos que `segment` es string
      const segment = raw ?? ''
      acc += `/${segment}`
      const match = currentLevel.find(i => i.slug === segment)
      const title = match
        ? (match.nav || match.title)
        : segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
      currentLevel = match?.children || []
      return { title, path: acc }
    })

  return [...base, ...dynamic]
})

const showCrumbs = computed(() => crumbs.value.length > 1)

useHead(() => {
  if (!showCrumbs.value) return {}
  return {
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.value.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.title,
            item: `${baseUrl}${c.path}`
          }))
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
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <NuxtLink :to="item.path" :aria-label="`Ir a ${item.title}`">
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
