<script setup lang="ts">
definePageMeta({
  layout: 'categorias'
})

import { useRoute, useRouter } from 'vue-router'
import { useAsyncData, useSeoMeta, showError, computed } from '#imports'
import type { Categoria, Producto } from '@/types'

const route = useRoute()
const router = useRouter()

// --- Slug y path ---
const slugParts = route.params.slug as string[]
if (!Array.isArray(slugParts) || slugParts.length === 0) {
  throw showError({ statusCode: 404, statusMessage: 'Página no encontrada' })
}
const targetSlug = slugParts[slugParts.length - 1]
const fullPath = `/categorias/${slugParts.join('/')}`

// --- Carga de contenido ---
const { data: contentData, pending, error } = useAsyncData<Categoria | Producto>(
  `content-${fullPath}`,
  async () => {
    const item = await queryCollection('categorias')
      .where('slug', '=', targetSlug)
      .first()
    if (!item) throw showError({ statusCode: 404, statusMessage: 'No encontrado' })
    item.path = item.path || fullPath
    return item
  },
  { server: true, lazy: false }
)

const contentType = computed(() => contentData.value?.type)
const categorySlug = computed(() =>
  contentType.value === 'categoria' ? (contentData.value as Categoria).slug : null
)

// --- Carga de productos asociados ---
const { data: associatedProducts, pending: pendingProducts } = useAsyncData<Producto[]>(
  `products-${fullPath}`,
  async () => {
    if (!categorySlug.value) return []
    const prods = await queryCollection('categorias')
      .where('type', '=', 'producto')
      .where('category', '=', categorySlug.value)
      .all()
    return Array.isArray(prods) ? (prods as Producto[]) : []
  },
  {
    server: true,
    lazy: true,
    watch: [categorySlug],
    default: () => []
  }
)

// --- Formato para GridDisplay.vue ---
const formattedProducts = computed(() =>
  (associatedProducts.value || []).map((product) => ({
    id: product.id || product.slug,
    title: product.nav || product.title,
    link: `/categorias/${product.category}/${product.slug}`,
    image: resolveImageUrl(product.image, product.type),
  }))
)

// --- Paginación de productos ---
const itemsPerPage = 8
const currentPage = ref(1)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return formattedProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(formattedProducts.value.length / itemsPerPage)
)

function onPageChange(page: number) {
  currentPage.value = page
  // Opcional: scroll al inicio de productos
  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
}

// --- SEO dinámico ---
useSeoMeta(() => {
  const item = contentData.value
  if (!item) return {}
  return {
    title: item.title,
    description: item.description || '',
    ogTitle: item.title,
    ogDescription: item.description || '',
    ogUrl: `https://tusitio.com${fullPath}`,
    ogImage: item.image ? resolveImageUrl(item.image, item.type) : undefined,
    twitterCard: 'summary_large_image'
  }
})

// --- Helpers ---
function goToProduct(p: Producto) {
  router.push(`/categorias/${p.category}/${p.slug}`)
}

function resolveImageUrl(path: string | undefined, type: string | undefined) {
  if (!path) return '/img/placeholder.webp'
  if (path.startsWith('/') || path.startsWith('http')) return path
  return (type === 'categoria' ? '/img/categorias/' : '') + path
}
</script>

<template>
  <main class="category-product-page">
    <!-- Loader inicial -->
    <section v-if="pending" class="text-center py-10">
      <p aria-busy="true" role="status" class="text-gray-600">Cargando contenido…</p>
    </section>

    <!-- Contenido principal -->
    <template v-else-if="contentData">
      <!-- 🗂 Vista de Categoría -->
      <section v-if="contentType === 'categoria'">
        <AppCrumbs class="ml-2" />
        <h1 class="sr-only">{{ (contentData as Categoria).title }}</h1>

        <SharedHeaderSection :image="resolveImageUrl((contentData as Categoria).image, contentData.type)"
          :alt="(contentData as Categoria).alt || (contentData as Categoria).title"
          :title="(contentData as Categoria).title">
          <template #right>
            <p class="text-lg text-muted-foreground">
              {{ (contentData as Categoria).description }}
            </p>
            <NuxtLink :to="'#productos'"
              class="inline-block mt-4 px-6 py-3 bg-primary text-white rounded hover:bg-primary/90 transition">
              Ver productos
            </NuxtLink>
          </template>
        </SharedHeaderSection>


        <!-- Listado de productos -->
        <section id="productos" aria-labelledby="productos-heading">
          <h2 id="productos-heading" class="text-2xl font-semibold mb-4 border-b pb-2">
            Productos en {{ (contentData as Categoria).nav || (contentData as Categoria).title }}
          </h2>

          <div v-if="pendingProducts" class="text-center py-6" aria-busy="true">
            <p class="text-gray-500">Cargando productos…</p>
          </div>
          <!-- grid productos categoria-->
          <GridDisplay v-else-if="associatedProducts?.length" :items="paginatedProducts" />
          <!-- Paginación si hay másd e 8 elementos -->
          <!-- Pagination solo si hay más de 1 página -->
          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <Pagination
            :total="totalPages"
            :current="currentPage"
            @update:current="onPageChange"
          />
          </div>
        </section>
      </section>

      <!-- 🛒 Vista de Producto -->
      <section v-else-if="contentType === 'producto'">
        <AppCrumbs class="ml-2" />
        <h1 class="sr-only">{{ (contentData as Producto).title }}</h1>

        <SharedHeaderSection
        :image="resolveImageUrl((contentData as Producto).image, contentData.type)"
        :alt="(contentData as Producto).alt || (contentData as Producto).title"
        :title="(contentData as Producto).title">
          <template #right>
            <UiFormsProduct :title="(contentData as Producto).title" />
          </template>
        </SharedHeaderSection>

      </section>

      <!-- 📂 Vista de Subcategoría -->
      <section v-else-if="contentType === 'subcategoria'">
        <AppCrumbs class="ml-2" />
        <p class="text-center text-gray-500 py-10">Vista de subcategoría próximamente…</p>
      </section>

      <!-- ❌ Tipo no reconocido -->
      <div v-else class="text-center text-orange-500 py-10">
        Tipo de contenido '{{ contentData.type }}' no reconocido.
      </div>
    </template>

    <!-- 🧨 Error general -->
    <section v-else-if="error && !pending" class="text-center py-10 text-red-500">
      <p>Error cargando datos. Inténtalo de nuevo más tarde.</p>
      <p class="mt-2 text-sm">{{ error.message }}</p>
    </section>
  </main>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
