<script setup lang="ts">
import { computed } from "vue";

import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";
import CatalogPagination from "@/components/shared/navigation/CatalogPagination.vue";

type ProductItem = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  image?: {
    src?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  imageSrc?: string | null;
};

const props = withDefaults(
  defineProps<{
    products?: ProductItem[] | null;
    eyebrow?: string;
    title?: string;
    description?: string;
    containerClass?: string;
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    basePath?: string;
  }>(),
  {
    products: () => [],
    eyebrow: "Productos",
    title: "Explora los productos de esta categoría",
    description: "Consulta formatos y soluciones disponibles dentro de esta categoría.",
    containerClass: "container-content py-8 md:py-10",
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    basePath: "/categorias",
  }
);

const visibleProducts = computed(() =>
  (props.products ?? []).filter(
    (item): item is ProductItem =>
      Boolean(item) && Boolean(item.title || item.name) && Boolean(item.path || item.slug)
  )
);

const gridClass = computed(() => {
  const count = visibleProducts.value.length;

  if (count <= 1) {
    return "mx-auto max-w-[420px] grid-cols-1";
  }

  if (count === 2) {
    return "mx-auto max-w-[920px] grid-cols-1 sm:grid-cols-2";
  }

  if (count === 3) {
    return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  }

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
});

const resultSummary = computed(() => {
  if (props.totalItems <= 0) {
    return "";
  }

  if (props.totalPages <= 1) {
    return `${props.totalItems} ${props.totalItems === 1 ? "producto" : "productos"}`;
  }

  return `${props.totalItems} productos · Página ${props.currentPage} de ${props.totalPages}`;
});

function productHref(product: ProductItem): string {
  const path = String(product.path || "").trim();

  if (path) {
    return path;
  }

  const slug = String(product.slug || "").trim();

  return `/productos/${encodeURIComponent(slug)}`;
}

function productTitle(product: ProductItem): string {
  return String(product.title || product.name || "").trim();
}

function productDescription(product: ProductItem): string {
  return String(product.shortDescription || product.description || "").trim();
}
</script>

<template>
  <section
    v-if="visibleProducts.length"
    id="productos"
    class="bg-background"
    aria-label="Productos de la categoría"
  >
    <div :class="containerClass">
      <div class="max-w-3xl">
        <ContentSectionIntro
          :eyebrow="eyebrow"
          :title="title"
          :description="description"
          heading-tag="h2"
          heading-size="section"
          :line="false"
          title-tone="foreground"
        />

        <p v-if="resultSummary" class="mt-3 text-body-s text-muted-foreground">
          {{ resultSummary }}
        </p>
      </div>

      <ul :class="['mt-6 grid auto-rows-fr gap-5 md:gap-6', gridClass]">
        <li
          v-for="product in visibleProducts"
          :key="product.path || product.slug || product.title || product.name"
          class="h-full list-none"
        >
          <CatalogCard
            :href="productHref(product)"
            :title="productTitle(product)"
            :description="productDescription(product)"
            :image="
              product.image ||
              (product.imageSrc
                ? {
                    src: product.imageSrc,
                    alt: productTitle(product) || 'Producto',
                  }
                : null)
            "
            cta-label="Ver producto"
            fallback-label="Producto"
          />
        </li>
      </ul>

      <CatalogPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :base-path="basePath"
      />
    </div>
  </section>
</template>
