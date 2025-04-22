// components/AppCrumbs.vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
// Importa queryCollection (y ParsedContent para el tipado)
import { queryCollection } from '#imports'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb' // Asegúrate que la ruta a tus componentes shadcn sea correcta

interface BreadcrumbItemData {
  title: string;
  path: string;
}

const route = useRoute()
const breadcrumbs = ref<BreadcrumbItemData[]>([])
async function fetchContentForPath(path: string): Promise<ParsedContent | null> {
  try {
    const content = await queryCollection<ParsedContent>('categorias')
        .where({ _path: path })
        .findOne(); // findOne devuelve ParsedContent | null
    return content; // Devuelve el contenido o null
  } catch (error) {
    console.error(`Error fetching content for breadcrumb path "${path}" using queryCollection('categorias'):`, error);
  
    return null;
  }
}

async function generateBreadcrumbs() {
  const path = route.path
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean)
  const items: BreadcrumbItemData[] = []

  items.push({ title: 'Inicio', path: '/' })

  let currentPath = ''
  for (const segment of segments) { 
    currentPath = `${currentPath}/${segment}`

    const content = await fetchContentForPath(currentPath);

    let title = '';
    let finalPath = currentPath;

    if (content) {
      title = content.nav || content.title || segment.replace(/-/g, ' ') || 'Segmento'; // Fallback si nav/title no existen
      finalPath = content._path || finalPath; // Usa _path si existe
    } else {
      if (segment && typeof segment === 'string') {
        title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        const titleMap: Record<string, string> = { 'categorias': 'Categorías' };
        title = titleMap[segment] || title;
      } else {
        // Manejo si segment no es una cadena válida (poco probable con filter(Boolean))
        console.warn('Segmento de breadcrumb inválido:', segment);
        title = 'Desconocido'; // O algún valor por defecto
      }
      // --- Fin Fallback Seguro ---
    }

    // Evitar añadir duplicados si la ruta ya existe
    if (!items.some(item => item.path === finalPath)) {
        items.push({ title, path: finalPath });
    } else if (items[items.length-1].path !== finalPath) {
        // Asegurar que si la ruta es diferente, se añada (ej. /categorias vs /categorias/index)
         items.push({ title, path: finalPath });
    }
  }
  breadcrumbs.value = items
}

watch(() => route.path, generateBreadcrumbs, { immediate: true })

</script>

<template>
  <!-- Template sin cambios -->
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
          <BreadcrumbPage
            v-else
            class="font-semibold text-[hsl(var(--color-primary))]"
          >
            {{ item.title }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator
          v-if="index < breadcrumbs.length - 1"
          class="text-muted-foreground"
        />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>