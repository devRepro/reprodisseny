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

interface Crumb { title: string; path: string }

const route = useRoute()
const { data: categoriasNav, pending, error } = useCategoriasNav()

const crumbs = computed<Crumb[]>(() => {
  // Base siempre presente
  const base: Crumb[] = [{ title: 'Inicio', path: '/' }]

  // Si sigue cargando o hubo error, devolvemos solo “Inicio”
  if (pending.value || error.value || !categoriasNav.value) {
    return base
  }

  // Construimos a partir de la ruta actual
  const menu = categoriasNav.value.menuItems || []
  const segments = route.path
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean)

  let accPath = ''
  let level = menu as any[]
  const extra: Crumb[] = segments.map(seg => {
    accPath += `/${seg}`
    const found = level.find((i: any) => i.slug === seg)

    // Título amigable
    const title = found
      ? (found.nav || found.title)
      : seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    level = found?.children || []
    return { title, path: accPath }
  })

  return base.concat(extra)
})

const showCrumbs = computed(() => crumbs.value.length > 1)
</script>
<template>
  <Breadcrumb
    v-if="showCrumbs"
    class="mb-4 px-4 md:px-0"
  >
    <BreadcrumbList class="text-sm">
      <template
        v-for="(item, idx) in crumbs"
        :key="item.path"
      >
        <BreadcrumbItem>
          <BreadcrumbLink
            v-if="idx < crumbs.length - 1"
            as-child
            class="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
          </BreadcrumbLink>
          <BreadcrumbPage
            v-else
            class="font-semibold text-[hsl(var(--color-primary))]"
          >
            {{ item.title }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator
          v-if="idx < crumbs.length - 1"
          class="text-muted-foreground"
        />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
