<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useHead } from '#imports'

const route = useRoute()

// SEO básico desde el slug
const pageTitle = route.params.slug?.[route.params.slug.length - 1] || 'Categoría'
useHead({
  title: `Impresión de ${pageTitle} | TuEmpresa`,
  meta: [
    {
      name: 'description',
      content: `Servicios de impresión de ${pageTitle} profesional. Calidad, rapidez y buen precio.`,
    },
  ],
})
</script>

<template>
  <NuxtLayout name="default">
    <template #navigation>
      <!-- Espacio reservado por si quieres añadir navegación o menú secundario -->
      <div class="bg-white border-b">
        <div class="container mx-auto px-4">
          <!-- Ejemplo: navegación secundaria, breadcrumbs extra -->
        </div>
      </div>
    </template>

    <div class="layout-categoria bg-white">
      <!-- Migas de pan -->
      <AppCrumbs class="mb-2" />

      <!-- CONTENIDO PRINCIPAL DINÁMICO -->
      <main class="container mx-auto px-4 py-8 space-y-10">
        <!-- Vistas dinámicas: productos, descripción, etc -->
        <slot />

        <!-- Preguntas frecuentes -->
        <section v-if="$slots.faq">
          <slot name="faq" />
        </section>

        <!-- Reseñas -->
        <section v-if="$slots.reviews" class="bg-gray-50 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">Lo que opinan nuestros clientes</h2>
          <slot name="reviews" />
        </section>

        <!-- CTA final -->
        <section class="text-center mt-10">
          <h3 class="text-xl font-semibold">¿Listo para imprimir?</h3>
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
