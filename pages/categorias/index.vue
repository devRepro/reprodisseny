<script setup lang="ts">
import { computed } from "vue";
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";

type CategoryCard = {
  slug?: string;
  title?: string;
  nav?: string;
  description?: string;
  shortDescription?: string;
  path?: string;
  image?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  } | null;
};

const pageContainerClass = "container-content";

const { data: categoriesResponse, pending, error } = await useAsyncData(
  "categorias-page-grid",
  () =>
    $fetch<any>("/api/home/categorias", {
      query: { limit: 24 },
    }),
  {
    server: true,
    lazy: false,
    default: () => [],
  }
);

const categories = computed<CategoryCard[]>(() => {
  const value = categoriesResponse.value as any;

  if (Array.isArray(value)) return value.filter(Boolean);
  if (Array.isArray(value?.categories)) return value.categories.filter(Boolean);
  if (Array.isArray(value?.items)) return value.items.filter(Boolean);
  if (Array.isArray(value?.data)) return value.data.filter(Boolean);

  return [];
});

function categoryTitle(category: CategoryCard) {
  return category.nav || category.title || "Categoría";
}

function categoryDescription(category: CategoryCard) {
  return (
    category.shortDescription ||
    category.description ||
    "Consulta productos, formatos y soluciones disponibles para esta familia."
  );
}

function categoryHref(category: CategoryCard) {
  if (category.path) return category.path;
  if (category.slug) return `/categorias/${category.slug}`;
  return "/categorias";
}
const pageUrl = "https://reprodisseny.com/categorias";

useSeoMeta({
  title: "Categorías de impresión | Reprodisseny",
  description:
    "Explora nuestras familias de producto: adhesivos, gran formato, expositores, publicaciones, eventos, publicidad y oficina, hostelería y restauración.",
  ogUrl: pageUrl,
});

useHead({
  link: [
    {
      rel: "canonical",
      href: pageUrl,
    },
  ],
});
</script>

<template>
  <main class="categories-index-page">
    <section class="categories-index-hero">
      <div class="categories-index-hero__content">
        <p class="categories-index-hero__eyebrow">
          Categorías
        </p>

        <h1 class="categories-index-hero__title">
          Explora nuestras familias de producto
        </h1>

        <p class="categories-index-hero__description">
          Accede a las principales líneas de soluciones y navega por familias para
          encontrar el formato, soporte o servicio más adecuado para tu proyecto.
        </p>
      </div>
    </section>

    <section class="categories-index-grid">
      <div v-if="pending" class="categories-index-grid__skeleton-list">
        <div
          v-for="i in 6"
          :key="i"
          class="categories-index-grid__skeleton-card"
        />
      </div>

      <div
        v-else-if="error"
        class="categories-index-grid__notice categories-index-grid__notice--error"
      >
        No se han podido cargar las categorías.
      </div>

      <div
        v-else-if="categories.length === 0"
        class="categories-index-grid__notice"
      >
        No hay categorías disponibles en este momento.
      </div>

      <div v-else>
        <div class="categories-index-grid__header">
          <h2 class="categories-index-grid__title">Familias de producto</h2>

          <p class="categories-index-grid__description">
            Elige una categoría para ver productos, formatos y soluciones relacionadas.
          </p>
        </div>

        <ul class="categories-index-grid__list">
          <li
            v-for="category in categories"
            :key="category.slug || category.path || categoryTitle(category)"
            class="categories-index-grid__item"
          >
            <CatalogCard
              :href="categoryHref(category)"
              :title="categoryTitle(category)"
              :description="categoryDescription(category)"
              :image="category.image"
              cta-label="Ver categoría"
              fallback-label="Categoría"
            />
          </li>
        </ul>
      </div>
    </section>

    <section class="categories-index-search-cta">
      <div class="categories-index-search-cta__panel">
        <p class="categories-index-search-cta__eyebrow">
          Catálogo completo
        </p>

        <h2 class="categories-index-search-cta__title">
          ¿Prefieres buscar directamente entre todos los productos?
        </h2>

        <p class="categories-index-search-cta__description">
          También puedes consultar el catálogo completo y encontrar productos concretos
          por nombre, familia o tipo de aplicación.
        </p>

        <NuxtLink
          to="/productos"
          class="categories-index-search-cta__button"
        >
          Ver todos los productos
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
