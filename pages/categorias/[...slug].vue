<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAsyncData, useHead, showError, computed } from '#imports'
import type { Categoria, Producto } from '@/types'

// --- Setup básico de ruta / slug ---
const route = useRoute()
const router = useRouter()

const slugParts = route.params.slug as string[]
if (!Array.isArray(slugParts) || slugParts.length === 0) {
  throw showError({ statusCode: 404, statusMessage: 'Página no encontrada' })
}
const targetSlug = slugParts[slugParts.length - 1]
const fullPath = `/categorias/${slugParts.join('/')}`

// --- Carga de contenido principal ---
const { data: contentData, pending, error } = await useAsyncData<Categoria | Producto>(
  `content-${fullPath}`,
  async () => {
    const item = await queryCollection('categorias')
      .where('slug', '=', targetSlug)
      .first()
    if (!item) throw showError({ statusCode: 404, statusMessage: 'No encontrado' })
    if (!item.path) item.path = fullPath
    return item
  }
)

const contentType = computed(() => contentData.value?.type)

// --- Carga de productos asociados si es categoría ---
const categorySlug = computed(() =>
  contentType.value === 'categoria' ? (contentData.value as Categoria).slug : null
)

const { data: associatedProducts, pending: pendingProducts } = await useAsyncData<
  Producto[]
>(
  `products-${fullPath}`,
  async () => {
    if (!categorySlug.value) return []
    const prods = await queryCollection('categorias')
      .where('type', '=', 'producto')
      .where('category', '=', categorySlug.value)
      .all()
    return Array.isArray(prods) ? (prods as Producto[]) : []
  },
  { watch: [categorySlug], default: () => [] }
)

// --- SEO básico ---
useHead(() => {
  if (pending.value || !contentData.value) {
    return { title: 'Cargando…' }
  }
  const item = contentData.value
  const title = item.title
  const description = item.description || ''
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `https://tusitio.com${fullPath}` }
    ],
    link: [{ rel: 'canonical', href: `https://tusitio.com${fullPath}` }]
  }
})

// --- Helpers de ruta e imagen ---
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
  <div class="category-product-page">
    <!-- Loader -->
    <div v-if="pending" class="text-center py-10">
      <p>Cargando…</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="contentData">
      <!-- Vista de Categoría -->
      <section v-if="contentType === 'categoria'">
        <header class="mb-8">
          <h1 class="text-3xl font-bold">{{ (contentData as Categoria).title }}</h1>
          <p v-if="(contentData as Categoria).description" class="text-lg text-gray-600">
            {{ (contentData as Categoria).description }}
          </p>
          <NuxtImg
            v-if="(contentData as Categoria).image"
            :src="resolveImageUrl((contentData as Categoria).image, contentData.type)"
            :alt="(contentData as Categoria).alt || (contentData as Categoria).title"
            class="w-full h-auto max-h-96 object-cover rounded-md my-6"
            loading="lazy"
            format="webp"
            quality="80"
          />
        </header>

        <section v-if="categorySlug">
          <h2 class="text-2xl font-semibold mb-4 border-b pb-2">
            Productos en {{ (contentData as Categoria).nav || (contentData as Categoria).title }}
          </h2>

          <div v-if="pendingProducts" class="text-center py-6">Cargando productos…</div>
          <div
            v-else-if="associatedProducts && associatedProducts.length"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <div
              v-for="product in associatedProducts"
              :key="product.id || product.slug"
              class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer"
              @click="goToProduct(product)"
            >
              <NuxtImg
                v-if="product.image"
                :src="resolveImageUrl(product.image, product.type)"
                :alt="product.alt || product.title"
                class="w-full h-48 object-cover"
                loading="lazy"
                format="webp"
                quality="80"
              />
              <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                Sin imagen
              </div>

              <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-semibold text-lg mb-1">{{ product.nav || product.title }}</h3>
                <p class="text-sm text-gray-500 mb-2 line-clamp-3 flex-grow">
                  {{ product.description }}
                </p>
                <NuxtLink
                  to="/contacto"
                  class="mt-auto text-right font-medium underline text-primary"
                >
                  Solicitar precio
                </NuxtLink>
              </div>
            </div>
          </div>

          <p v-else class="text-gray-500 italic">
            No hay productos listados en esta categoría.
          </p>
        </section>
      </section>

      <!-- Vista de Producto -->
      <section v-else-if="contentType === 'producto'">
        <header class="mb-8">
          <h1 class="text-3xl font-bold">{{ (contentData as Producto).title }}</h1>
          <p v-if="(contentData as Producto).sku" class="text-sm text-gray-500 mb-3">
            Referencia: {{ (contentData as Producto).sku }}
          </p>
          <NuxtImg
            v-if="(contentData as Producto).image"
            :src="resolveImageUrl((contentData as Producto).image, contentData.type)"
            :alt="(contentData as Producto).alt || (contentData as Producto).title"
            class="w-full h-auto max-h-[500px] object-contain rounded-md my-6"
            loading="lazy"
            format="webp"
            quality="80"
          />
        </header>

        <div class="mb-6">
          <NuxtLink
            to="/contacto"
            class="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
          >
            Solicitar precio
          </NuxtLink>
          <p v-if="(contentData as Producto).description" class="mt-4 text-lg text-gray-600">
            {{ (contentData as Producto).description }}
          </p>
        </div>
      </section>

      <!-- Tipo desconocido -->
      <div v-else class="text-center text-orange-500 py-10">
        Tipo de contenido '{{ contentData.type }}' no reconocido.
      </div>
    </div>

    <!-- Error genérico -->
    <div v-else-if="error && !pending" class="text-center py-10 text-red-500">
      <p>Error cargando datos. Inténtalo de nuevo más tarde.</p>
      <p class="mt-2 text-sm">{{ error.message }}</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
