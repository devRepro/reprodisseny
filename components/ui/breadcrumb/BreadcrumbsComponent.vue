<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

import { useRoute } from 'vue-router'
import { computed } from 'vue'

// Obtenemos la ruta actual y generamos partes
const route = useRoute()

// Generamos las partes de la ruta (slug)
const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const breadcrumbParts = parts.map((part, index) => {
    const href = '/' + parts.slice(0, index + 1).join('/')
    const label = decodeURIComponent(part).replace(/-/g, ' ')
    return { label, href }
  })
  return breadcrumbParts
})
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
      </BreadcrumbItem>

      <template v-for="(crumb, index) in breadcrumbs" :key="crumb.href">
        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <component
            :is="index === breadcrumbs.length - 1 ? BreadcrumbPage : BreadcrumbLink"
            :href="index === breadcrumbs.length - 1 ? undefined : crumb.href"
          >
            {{ crumb.label }}
          </component>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
