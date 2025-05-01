<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useHead } from '#imports'

const route = useRoute()

const productSlug = route.params.slug?.[route.params.slug.length - 1] || 'Producto'

useHead({
  title: `Producto de impresión: ${productSlug} | TuEmpresa`,
  meta: [
    {
      name: 'description',
      content: `Descubre nuestro producto "${productSlug}" de alta calidad para impresión personalizada.`,
    },
  ],
})
</script>

<template>
  <NuxtLayout name="default">
    <template #navigation>
      <!-- Espacio opcional para navegación específica -->
      <div class="bg-white border-b">
        <div class="container mx-auto px-4">
          <!-- Por ejemplo: navegación secundaria, breadcrumb extendido -->
        </div>
      </div>
    </template>

    <div class="layout-producto bg-white">
      <AppCrumbs class="mb-2" />

      <!-- CONTENIDO PRINCIPAL -->
      <main class="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <slot />

        <!-- Preguntas frecuentes (si se definen) -->
        <section v-if="$slots.faq">
          <slot name="faq" />
        </section>

        <!-- Opiniones de clientes -->
        <section v-if="$slots.reviews" class="bg-gray-50 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">Opiniones de nuestros clientes</h2>
          <slot name="reviews" />
        </section>

        <!-- CTA final -->
        <section class="text-center mt-10">
          <h3 class="text-xl font-semibold">¿Interesado en este producto?</h3>
          <NuxtLink
            to="/contacto"
            class="inline-block mt-4 px-6 py-3 bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Solicita presupuesto
          </NuxtLink>
        </section>
      </main>
    </div>
  </NuxtLayout>
</template>

