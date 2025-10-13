<!-- pages/productos/[...slug].vue -->
<script setup lang="ts">
import { computed } from 'vue'            // 👈 te faltaba
// import { SharedBreadCrumbs } from '#components' // opcional; Nuxt lo auto-registra

const route = useRoute()

// 🔎 Content v3: por path y fallback por slug
const { data: product, pending, error } = await useAsyncData(
  () => `product:${route.path}`,
  async () => {
    const byPath = await queryCollection('productos').path(route.path).first()
    if (byPath) return byPath
    const slug = Array.isArray(route.params.slug) ? route.params.slug.at(-1) : String(route.params.slug || '')
    if (!slug) return null
    return await queryCollection('productos').where('slug', '=', slug).first()
  },
  { watch: [() => route.path] }
)

// JSON-LD del PRODUCTO
const jsonLd = computed(() => {
  const d = product.value
  if (!d?.schema) return null
  return JSON.stringify({ '@context': 'https://schema.org', ...d.schema })
})

// ✅ SOLO head del producto (title/description/canonical + JSON-LD)
useHead(() => ({
  title: product.value?.metatitle || product.value?.title,
  meta: [
    { name: 'description', content: product.value?.metadescription || product.value?.description || '' }
  ],
  link: product.value?.canonical ? [{ rel: 'canonical', href: product.value.canonical }] : [],
  script: jsonLd.value ? [{ type: 'application/ld+json', innerHTML: jsonLd.value }] : []
}))
</script>

<template>
  <main class="bg-background text-foreground">
    <SharedMenuCategories />
    <!-- 👍 el componente de migas se encarga de sus propios <script type="application/ld+json"> -->
    <SharedBreadCrumbs />

    <div v-if="pending" class="flex items-center justify-center h-screen">
      <p class="text-muted-foreground">Cargando producto…</p>
    </div>
    <div v-else-if="error || !product" class="flex items-center justify-center h-screen">
      <p class="text-destructive">Error: Producto no encontrado.</p>
    </div>

    <article v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="grid lg:grid-cols-5 lg:gap-x-12">
        <div class="lg:col-span-3">
          <div class="mb-8">
            <div class="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted border">
              <NuxtImg
                v-if="product.image"
                :src="typeof product.image === 'string' ? product.image : product.image.src"
                :alt="product.alt || product.title"
                class="h-full w-full object-cover"
                width="800" height="600" format="webp" fetchpriority="high"
              />
            </div>
          </div>

          <div class="mb-8">
            <div v-if="product.badges?.length" class="flex gap-2 mb-2">
              <span v-for="b in product.badges" :key="b" class="inline-block bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ b }}
              </span>
            </div>
            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">{{ product.title }}</h1>
            <p v-if="product.description" class="mt-4 text-lg text-muted-foreground">{{ product.description }}</p>
          </div>

          <div v-if="product.features?.length" class="py-8 border-t border-b">
            <h2 class="text-xl font-semibold mb-4">Características principales</h2>
            <ul class="space-y-3">
              <li v-for="f in product.features" :key="f.text" class="flex items-start gap-3">
                <span class="mt-1 text-primary">✔</span>
                <span class="text-muted-foreground">{{ f.text }}</span>
              </li>
            </ul>
          </div>

          <section v-if="product.body" class="py-8">
            <ContentRenderer class="prose prose-lg max-w-none prose-p:text-muted-foreground prose-h2:font-bold" :value="product" />
          </section>
        </div>

        <div class="lg:col-span-2 mt-10 lg:mt-0">
          <div class="lg:sticky lg:top-24">
            <div class="border rounded-2xl bg-card p-6 shadow-sm">
              <h2 class="text-2xl font-bold mb-1">Solicita tu presupuesto</h2>
              <p class="text-muted-foreground mb-6 text-sm">Rellena los datos y te contactaremos en minutos.</p>
              <ClientOnly>
                <SharedFormsLeadForm :producto="product.title" :extra-fields="product.formFields ?? []" />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </article>
  </main>
</template>
