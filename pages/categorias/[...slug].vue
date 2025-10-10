<!-- pages/categorias/[...slug].vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// slug seguro (sin barras al principio/fin)
const slug = computed(() => {
  const raw = Array.isArray(route.params.slug)
    ? route.params.slug.join('/')
    : String(route.params.slug || '')
  return raw.replace(/^\/+|\/+$/g, '')
})

/** =========================
 *  1) Documento de la categoría (Nuxt Content v3 - collections)
 *  ========================= */
const { data: doc } = await useAsyncData(
  () => `categoria:${slug.value}`,
  () => queryCollection('categorias')
        .path(`/categorias/${slug.value}`)
        .first(),
  { watch: [() => slug.value] }
)

// 2) Derivadas del front-matter para el Hero
const catTitle = computed(
  () => doc.value?.title ?? slug.value.split('/').pop()?.replace(/-/g, ' ') ?? ''
)

const heroProps = computed(() => ({
  image: doc.value?.image ?? '/img/placeholders/mockup.webp',
  alt: doc.value?.alt ?? catTitle.value,
  title: catTitle.value,
  description: doc.value?.description ?? '',
  ctaText: doc.value?.ctaText ?? 'Descubre más ventajas',
  ctaLink: doc.value?.ctaLink ?? '#'
}))

/** =========================
 *  3) Query de productos (desde tu API)
 *  ========================= */
const query = computed(() => ({
  page: Number(route.query.page ?? 1),
  limit: Number(route.query.limit ?? 24),
  sort: String(route.query.sort ?? 'order'),
  direction: String(route.query.direction ?? 'ASC'),
  q: String(route.query.q ?? '')
}))

const { data: payload, pending, error } = await useAsyncData(
  () => `cat:products:${slug.value}:${JSON.stringify(query.value)}`,
  () => $fetch(`/api/categorias/${slug.value}/products`, { params: query.value }),
  {
    default: () => ({ items: [], page: 1, pages: 0, total: 0, limit: 24 }),
    watch: [() => slug.value, () => query.value]
  }
)

const productos = computed(() => payload.value.items || [])
const totalPages = computed(() => payload.value.pages || 0)
const currentPage = computed(() => payload.value.page || 1)

/** =========================
 *  4) Navegación de paginación
 *  ========================= */
function setPage(n: number) {
  const target = Math.min(Math.max(n, 1), totalPages.value || 1)
  router.push({ query: { ...route.query, page: target } })
}
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <!-- ===== Cabecera categoria ===== -->
    <CategoryHeader v-bind="heroProps" />

    <Separator class="bg-border/60" />

    <!-- ===== GRID DE PRODUCTOS ===== -->
    <section class="max-w-7xl mx-auto px-6 py-8 md:py-10">
      <div v-if="pending" class="text-muted-foreground">Cargando productos…</div>

      <div v-else-if="error" class="text-red-500 bg-red-500/10 p-4 rounded-lg">
        <strong>Error:</strong>
        {{ error.message || "No se pudieron cargar los productos." }}
      </div>

      <div v-else-if="!productos.length" class="text-sm text-muted-foreground">
        No hay productos en esta categoría.
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="p in productos"
          :key="p._id || p.path || p.slug"
          class="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
        >
          <NuxtLink :to="p.path || `/productos/${p.slug}`" class="block">
            <div class="aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                :src="p.image"
                :alt="p.alt || p.title"
                class="h-full w-full object-cover object-center transition-transform group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div class="p-4">
              <h3 class="line-clamp-2 text-base font-medium">{{ p.title }}</h3>
              <p v-if="p.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {{ p.description }}
              </p>
              <div class="mt-3 text-sm font-medium text-primary">Ver producto →</div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center gap-2 justify-center">
        <Button variant="outline" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
          ← Anterior
        </Button>

        <span class="text-sm text-muted-foreground">
          Página {{ currentPage }} / {{ totalPages }}
        </span>

        <Button
          variant="outline"
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
        >
          Siguiente →
        </Button>
      </div>
    </section>

    <Separator class="bg-border/60" />

    <!-- ===== COPY SEO (cuerpo del .md) ===== -->
    <section class="max-w-7xl mx-auto px-6 pb-6 md:pb-10">
      <!-- En el template los refs se desenvuelven, así que v-if="doc" evalúa doc.value -->
      <div v-if="doc" class="prose prose-invert max-w-none prose-p:leading-relaxed">
        <ContentRenderer :value="doc" />
      </div>
    </section>
  </main>
</template>
