<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoriasNav } from '@/composables/useCategoriasNav'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NuxtLink } from '#components'

interface Crumb {
  title: string
  path: string
}

// Accedemos a la ruta actual
const route = useRoute()
// Obtenemos las categorías de navegación
const { data: categoriasNav, pending, error } = useCategoriasNav()

// Computamos los breadcrumbs
const crumbs = computed<Crumb[]>(() => {
  const base: Crumb[] = [{ title: 'Inicio', path: '/' }]

  if (pending.value || error.value || !categoriasNav.value) {
    return base
  }

  const segments = route.path.replace(/\/$/, '').split('/').filter(Boolean)
  const menu = categoriasNav.value.menuItems ?? []

  let currentLevel = menu
  let accumulatedPath = ''

  const dynamicCrumbs = segments.map((segment) => {
    accumulatedPath += `/${segment}`
    const match = currentLevel.find((item) => item.slug === segment)

    const title = match
      ? match.nav || match.title
      : segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

    currentLevel = match?.children ?? []

    return {
      title,
      path: accumulatedPath,
    }
  })

  return [...base, ...dynamicCrumbs]
})

// Mostramos los crumbs solo si hay más de uno
const showCrumbs = computed(() => crumbs.value.length > 1)
</script>

<template>
  <Breadcrumb v-if="showCrumbs" class="mb-4 px-4 md:px-0">
    <BreadcrumbList class="text-sm">
      <template v-for="(item, idx) in crumbs" :key="item.path">
        <BreadcrumbItem>
          <template v-if="idx < crumbs.length - 1">
            <BreadcrumbLink
              as-child
              class="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
            >
              <NuxtLink :to="item.path">
                {{ item.title }}
              </NuxtLink>
            </BreadcrumbLink>
          </template>
          <template v-else>
            <BreadcrumbPage class="font-semibold text-[hsl(var(--color-primary))]">
              {{ item.title }}
            </BreadcrumbPage>
          </template>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="idx < crumbs.length - 1" class="text-muted-foreground" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
