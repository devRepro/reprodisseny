<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead, useRuntimeConfig } from '#imports'
import { useCategoriasNav } from '@/composables/useCategoriasNav'

// ⬇️ Importa los componentes shadcn (o quítalo si confías en el auto-import)
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Tipo simple para nuestros items
type Crumb = { label: string; to: string }

// Util: "calendarios-sobremesa" -> "Calendarios Sobremesa"
function titleFromSlug(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const route = useRoute()
const router = useRouter()
const { data: categoriasNav, pending, error } = useCategoriasNav()

// Base para "Inicio"
const basePath = computed(() => router.options.history.base || '/')

// Construye items
const items = computed<Crumb[]>(() => {
  const out: Crumb[] = [{ label: 'Inicio', to: basePath.value }]
  if (pending.value || error.value) return out

  const segments = route.path.split('/').filter(Boolean)
  let current = categoriasNav.value?.menuItems ?? []
  let acc = ''

  for (const seg of segments) {
    acc += `/${seg}`
    const match = current.find((i: any) => i.slug === seg)
    const label = match?.nav || match?.title || titleFromSlug(seg)
    out.push({ label, to: acc })
    current = match?.children ?? []
  }
  return out
})

// Mostrar sólo si hay “Inicio + algo”
const show = computed(() => items.value.length > 1)

// JSON-LD BreadcrumbList
const siteUrlRaw = useRuntimeConfig().public?.siteUrl || 'https://reprodisseny.com'
const siteUrl = siteUrlRaw.replace(/\/+$/, '') // sin barra final

useHead(() => {
  if (!show.value) return {}
  const itemList = items.value.map((it, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: it.label,
    item: `${siteUrl}${it.to}`.replace(/\/{2,}/g, '/').replace(':/', '://'),
  }))
  return {
    script: [
      {
        key: 'breadcrumbs-jsonld',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: itemList,
        }),
      },
    ],
  }
})
</script>

<template>
  <div v-if="show" class="mb-4 px-4 md:px-0">
    <Breadcrumb class="text-sm">
      <BreadcrumbList>
        <template v-for="(it, i) in items" :key="it.to">
          <!-- Enlaces para todos menos el último -->
          <BreadcrumbItem v-if="i < items.length - 1">
            <BreadcrumbLink as-child>
              <NuxtLink :to="it.to" class="hover:underline">{{ it.label }}</NuxtLink>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <!-- Último como página activa -->
          <BreadcrumbItem v-else>
            <BreadcrumbPage>{{ it.label }}</BreadcrumbPage>
          </BreadcrumbItem>

          <BreadcrumbSeparator v-if="i < items.length - 1" />
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>
