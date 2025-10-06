<script setup lang="ts">
import { useCategoriasHome } from "~/composables/useCategoriasHome";

const { error } = useCategoriasHome();
if (error.value) {
  console.error("Fallo cargando categorías:", error.value);
}
</script>

<template>
  <div>
    <SharedMenuCategories />

    <SharedSliderHome />

    <div class="space-y-4">
      <FeatureSection
        title="Impresión digital personalizada"
        image="/img/servicios/impresion-digital.webp"
        alt="Impresión digital personalizada"
        description="<p>Impresión ágil y de alta calidad...</p>"
      />
      <FeatureSection
        title="Impresión offset de alto volumen"
        image="/img/servicios/impresion-offset.webp"
        alt="Impresión offset de alto volumen"
        description="<p>Alta fidelidad de color...</p>"
        reversed
      />
      <FeatureSection
        title="Gran formato e instalación profesional"
        image="/img/servicios/gran-formato.webp"
        alt="Gran formato e instalación profesional"
        description="<p>Diseñamos, imprimimos e instalamos...</p>"
      />
      <FeatureSection
        title="Montajes Profesionales"
        image="/img/servicios/gran-formato.webp"
        alt="Montajes Profesionales"
        description="<p>Nuestro equipo experto se encarga...</p>"
        reversed
      >
        <template #actions>
          <button class="bg-accent text-white py-2 px-4 rounded-md hover:bg-accent-dark">
            Ver proyectos
          </button>
        </template>
      </FeatureSection>
    </div>
  </div>
</template>
