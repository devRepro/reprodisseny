<script setup lang="ts">

import { ref, watch } from 'vue'
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

interface BreadcrumbItemData {
  title: string
  path: string
}

const route = useRoute()
const breadcrumbs = ref<BreadcrumbItemData[]>([])

// 1️⃣ Cargamos el menú (useCategoriasNav ya usa useAsyncData)
const { data: categoriasNav, error: categoriasError } = await useCategoriasNav()
if (categoriasError.value) {
  console.error('[AppCrumbs] Error cargando menú:', categoriasError.value)
}// 2️⃣ Función que genera el array de migas a partir de `menuItems`
function buildBreadcrumbs() {
  const menuItems = categoriasNav.value?.menuItems || []
  const segments = route.path
    .replace(/\/$/, '')     // quita "/" final
    .split('/')
    .filter(Boolean)

  const items: BreadcrumbItemData[] = [
    { title: 'Inicio', path: '/' }
  ]

  let currentLevel = menuItems as any[]        // nivel jerárquico actual
  let accumulated = ''                          // ruta acumulada

  for (const seg of segments) {
    accumulated += `/${seg}`

    // buscarmos un item cuyo slug coincida con el segmento
    const found = currentLevel.find(i => i.slug === seg)

    let title: string
    if (found) {
      title = found.nav || found.title || seg.replace(/-/g, ' ')
      // descendemos un nivel para la siguiente iteración
      currentLevel = Array.isArray(found.children) ? found.children : []
    } else {
      // fallback si no existe en tu menú
      title = seg
        .charAt(0)
        .toUpperCase() +
        seg
          .slice(1)
          .replace(/-/g, ' ')
      currentLevel = []
    }

    items.push({ title, path: accumulated })
  }

  breadcrumbs.value = items
}

// 3️⃣ Recalculamos cada vez que cambie la ruta
watch(
  () => route.path,
  () => buildBreadcrumbs(),
  { immediate: true }
)
</script>

<template>
  <Breadcrumb v-if="breadcrumbs.length > 1" class="mb-4 px-4 md:px-0">
    <BreadcrumbList class="text-sm">
      <template
        v-for="(item, idx) in breadcrumbs"
        :key="item.path + '-' + idx"
      >
        <BreadcrumbItem>
          <BreadcrumbLink
            v-if="idx < breadcrumbs.length - 1"
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
          v-if="idx < breadcrumbs.length - 1"
          class="text-muted-foreground"
        />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>