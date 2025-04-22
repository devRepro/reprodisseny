<!--<template>
  <div>
    <CategoryHeader
      v-if="page"
      :title="page.title"
      :description="page.description"
      :image="`/img/categorias/${page.image}`"
      :alt="page.alt"
      :link="`/categorias/${page.slug}`"
    />

    <UiSpinner v-else />

    <ContentRenderer v-if="page" :value="page" class="mb-10" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'categorias'
})

import { useRoute } from 'vue-router'
import { useCategoriaBySlug } from '@/composables/useCategoriaBySlug'
import { useHead } from '#imports'

const route = useRoute()
const categorySlug = route.params.category as string

const { data: page } = await useCategoriaBySlug(categorySlug)

useHead(() => ({
  title: page.value?.metaTitle || page.value?.title,
  meta: [
    {
      name: 'description',
      content: page.value?.metaDescription || page.value?.description
    },
    {
      name: 'keywords',
      content: Array.isArray(page.value?.keywords)
        ? page.value.keywords.join(', ')
        : typeof page.value?.keywords === 'string'
        ? page.value.keywords
        : ''
    },
    {
      property: 'og:title',
      content: page.value?.metaTitle || page.value?.title
    },
    {
      property: 'og:description',
      content: page.value?.metaDescription || page.value?.description
    },
    {
      property: 'og:image',
      content: `https://reprodisseny.com${page.value?.image}`
    }
  ],
  script: page.value?.structuredData
    ? [
        {
          type: 'application/ld+json',
          children: page.value.structuredData
        }
      ]
    : []
}))
</script>


<!--<!-- pages/categorias/[category]/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'categorias' })

import { useRoute } from 'vue-router'
import { useCategoriaBySlug } from '@/composables/useCategoriaBySlug'
import { useHead } from '#imports'

// Componentes UI shadcn + propios
import { Breadcrumb }     from '@/components/ui/breadcrumb'

const route = useRoute()
const slug  = route.params.category as string
const { data: page, pending, error } = await useCategoriaBySlug(slug)

// SEO dinámico y JSON‑LD
useHead(() => ({
  title: page.value?.metaTitle || page.value?.title,
  meta: [
    { name: 'description', content: page.value?.metaDescription || page.value?.description },
    { name: 'keywords',    content: Array.isArray(page.value?.keywords)
                             ? page.value.keywords.join(', ')
                             : page.value?.keywords || '' },
    { property: 'og:title',       content: page.value?.metaTitle || page.value?.title },
    { property: 'og:description', content: page.value?.metaDescription || page.value?.description },
    { property: 'og:image',       content: `https://reprodisseny.com${page.value?.image}` },
  ],
  script: page.value?.structuredData
    ? [{ type: 'application/ld+json', children: page.value.structuredData }]
    : []
}))
</script>-->

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-12">
    <!-- 1. Breadcrumbs -->
    <UiBreadcrumb class="text-sm text-gray-600">
      <Breadcrumb.Item href="/">Inicio</Breadcrumb.Item>
      <Breadcrumb.Item href="/categorias">Categorías</Breadcrumb.Item>
      <Breadcrumb.Item :active="true">{{ page.value?.title }}</Breadcrumb.Item>
    </UiBreadcrumb>

    <!-- 2. Hero -->
    <div v-if="pending" class="flex justify-center py-16"><UiSpinner /></div>
    <div v-else-if="error" class="text-center text-red-600 py-16">
      Error al cargar la categoría.
    </div>
    <CategoryHeader
      v-else
      :title="page.value.title"
      :description="page.value.description"
      :image="`/img/categorias/${page.value.image}`"
      :alt="page.value.alt || page.value.title"
      :link="`/contacto?from=${page.value.slug}`"
    />

    <!-- 3. Descripción SEO‑rich -->
    <section v-if="page.value.body" class="prose mx-auto dark:prose-invert mb-16">
      <ContentRenderer :node="page.value.body" />
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 4. Sidebar sticky (solo desktop) -->
      <aside class="hidden lg:block sticky top-24 self-start">
        <UiInquiryForm :from="page.value.slug" />
      </aside>

      <!-- 5. Productos destacados -->
      <main class="lg:col-span-3 space-y-12">
        <section v-if="page.value.topProducts?.length">
          <h2 class="text-2xl font-semibold mb-4">Top Ventas</h2>
          <ProductSection :items="page.value.topProducts" />
        </section>

        <section v-if="page.value.newProducts?.length">
          <h2 class="text-2xl font-semibold mb-4">Novedades</h2>
          <ProductSection :items="page.value.newProducts" />
        </section>

        <!-- 6. FAQs -->
        <section v-if="page.value.faqs?.length">
          <h2 class="text-2xl font-semibold mb-4">Preguntas Frecuentes</h2>
          <UiAccordionFAQ :items="page.value.faqs" />
        </section>

        <!-- 7. CTA final -->
        <div class="text-center py-12">
          <button
            class="inline-block bg-primary px-6 py-3 text-white font-medium rounded-lg shadow hover:bg-primary-dark transition"
            @click="$router.push(`/contacto?from=${page.value.slug}`)"
          >
            Contáctanos para más información
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Ajustes de container y espaciado ya controlados con Tailwind */
</style>
-->