<script setup lang="ts">
import { computed } from 'vue'
import { useCategoriasHome } from '@/composables/useCategoriasHome'

const { data: categories, pending, error } = useCategoriasHome()

if (error.value)
  console.error('fallo cargando categorías:', error.value)

const carrouselCategories = computed(() => {
  if (pending.value || error.value || !categories.value) {
    return []
  }
  return Array.isArray(categories.value)
    ? categories.value
    : []
})
</script>

<template>
  <div>
    <UiSliderHome />

    <!-- Loading state -->
    <div v-if="pending" class="py-16 text-center text-gray-500">
      Cargando categorías…
    </div>

    <!-- Carrousel o fallback: hermanos inmediatos -->
    <CategoryCarrousel
      v-else-if="carrouselCategories.length"
      :categories="carrouselCategories"
    />
    <p
      v-else
      class="py-16 text-center text-gray-500"
    >
      No hay categorías disponibles.
    </p>

    <!-- Resto del contenido siempre renderizado -->
    <div class="space-y-4">
      <FeatureSection
        title="Impresión digital personalizada"
        image="/img/servicios/impresion-digital.webp"
        alt="Impresión digital personalizada"
        description="<p>Impresión ágil y de alta calidad para tiradas cortas y personalizadas. Perfecta para promociones, eventos y productos exclusivos con una rápida entrega.</p><p>Ideal para imprimir lo que necesites con calidad profesional sin necesidad de grandes cantidades.</p>"
      />
      <FeatureSection
        title="Impresión offset de alto volumen"
        image="/img/servicios/impresion-offset.webp"
        alt="Impresión offset de alto volumen"
        description="<p>Alta fidelidad de color y excelente calidad en grandes tiradas. Nuestra impresión offset es ideal para catálogos, revistas, folletos y material corporativo.</p><p>Opta por la mejor relación calidad/precio cuando necesitas imprimir a gran escala.</p>"
        reversed
      />
      <FeatureSection
        title="Gran formato e instalación profesional"
        image="/img/servicios/gran-formato.webp"
        alt="Gran formato e instalación profesional"
        description="<p>Diseñamos, imprimimos e instalamos vinilos, lonas, expositores y todo tipo de soportes publicitarios de gran formato.</p><p>Nos encargamos del montaje para que no tengas que preocuparte por nada.</p>"
      />
      <FeatureSection
        title="Montajes Profesionales"
        image="/img/servicios/gran-formato.webp"
        alt="Montajes Profesionales"
        description="<p>Nuestro equipo experto se encarga de la instalación de todos tus proyectos de gran formato, asegurando un acabado impecable y duradero.</p><p>Déjanos la parte complicada a nosotros y disfruta del resultado final.</p>"
        reversed
      >
        <template #actions>
          <button
            class="bg-accent text-white py-2 px-4 rounded-md hover:bg-accent-dark"
          >
            Ver proyectos
          </button>
        </template>
      </FeatureSection>
    </div>

    <UiFeatures />
  </div>
</template>
