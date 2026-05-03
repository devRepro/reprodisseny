<script setup lang="ts">
import { computed } from "vue";
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid";

const pageContainerClass = "container-content";

const {
  categories: homeCategories,
  pending: homeCategoriesPending,
  error: homeCategoriesError,
} = useHomeCategoriesGrid(24);

const safeHomeCategories = computed(() => homeCategories.value ?? []);

useSeoMeta({
  title: "Categorías de impresión | Reprodisseny",
  description:
    "Explora nuestras familias de producto: adhesivos, gran formato, expositores, publicaciones, eventos, publicidad y oficina, hostelería y restauración.",
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <section :class="[pageContainerClass, 'pt-12 pb-8 md:pt-16 md:pb-10']">
      <div class="max-w-3xl">
        <p
          class="mb-5 text-body-s font-semibold uppercase tracking-[0.22em] text-primary"
        >
          Categorías
        </p>

        <h1 class="font-h1 text-balance text-foreground">
          Explora nuestras familias de producto
        </h1>

        <p class="mt-5 max-w-2xl text-body leading-8 text-muted-foreground">
          Accede a las principales líneas de soluciones y navega por familias para
          encontrar el formato, soporte o servicio más adecuado para tu proyecto.
        </p>
      </div>
    </section>

    <MarketingProductCategoryGrid
      title="Familias de producto"
      description="Elige una categoría para ver productos, formatos y soluciones relacionadas."
      :categories="safeHomeCategories"
      :total-slots="24"
      :pending="homeCategoriesPending"
    />

    <section v-if="homeCategoriesError" :class="[pageContainerClass, 'pb-8']">
      <div
        class="rounded-[28px] border border-red-100 bg-red-50 px-6 py-5 text-sm text-red-700"
      >
        No se han podido cargar las categorías. Revisa el endpoint
        <code>/api/home/categorias</code>.
      </div>
    </section>

    <section :class="[pageContainerClass, 'pt-2 pb-14 md:pt-4 md:pb-20']">
      <div
        class="rounded-[28px] border border-border/70 bg-card px-6 py-8 md:px-8 md:py-10"
      >
        <p
          class="mb-4 text-body-s font-semibold uppercase tracking-[0.22em] text-primary"
        >
          Catálogo completo
        </p>

        <h2 class="font-h2 text-balance text-foreground">
          ¿Prefieres buscar directamente entre todos los productos?
        </h2>

        <p class="mt-4 max-w-2xl text-body leading-7 text-muted-foreground">
          También puedes consultar el catálogo completo y encontrar productos concretos
          por nombre, familia o tipo de aplicación.
        </p>

        <NuxtLink
          to="/productos"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Ver todos los productos
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
