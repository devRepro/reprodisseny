<template>
  <div>
    <HeroBanner
      title="Somos tu socio de producción gráfica"
      subtitle="Convertimos tus necesidades en materiales de comunicación corporativa, comercial y marketing. Producimos tus proyectos profesionalmente, acompañándote con calidad y rapidez."
      image-src="/img/hero/barcelona.jpg"
      :cta="{ label: 'Contacta con un experto', to: '/contacto' }"
    />

    <!-- Esto son categorías (familias), aunque el título diga productos -->
    <ProductCategoryGrid title="Nuestros productos" :categories="categoryCards" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import HeroBanner from "@/components/marketing/HeroBanner.vue";
import ProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import { getCategories, mapCategoriesToCards } from "~/server/utils/catalogContent";

const { data: categories } = await useAsyncData("homeCategories", () => getCategories(), {
  default: () => [],
});

const categoryCards = computed(() => mapCategoriesToCards(categories.value));
</script>
