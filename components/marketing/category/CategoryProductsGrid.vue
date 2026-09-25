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
    id?: string;
    variant?: "catalog" | "featured";
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
    id: "productos",
    variant: "catalog",
    products: () => [],
    eyebrow: "Productos",
    title: "Explora los productos de esta categoría",
    description: "Consulta formatos y soluciones disponibles dentro de esta categoría.",
    containerClass: "category-products-grid__container",
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

const isFeatured = computed(() => props.variant === "featured");

const gridClass = computed(() => {
  const count = visibleProducts.value.length;

  if (count <= 1) return "category-products-grid__list--single";
  if (count === 2) return "category-products-grid__list--pair";
  if (count === 3) return "category-products-grid__list--trio";

  return "category-products-grid__list--catalog";
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
    :id="id"
    :class="[
      'category-products-grid',
      isFeatured && 'category-products-grid--featured',
    ]"
    :aria-label="isFeatured ? 'Productos destacados' : 'Productos de la categoría'"
  >
    <div :class="containerClass">
      <div class="category-products-grid__intro">
        <ContentSectionIntro
          :eyebrow="eyebrow"
          :title="title"
          :description="description"
          heading-tag="h2"
          heading-size="section"
          :line="false"
          title-tone="foreground"
        />

        <p v-if="resultSummary" class="category-products-grid__summary">
          {{ resultSummary }}
        </p>
      </div>

      <ul
        :class="[
          'category-products-grid__list',
          isFeatured && 'category-products-grid__list--featured',
          gridClass,
        ]"
      >
        <li
          v-for="(product, index) in visibleProducts"
:key="
  product.path ||
  product.slug ||
  product.title ||
  product.name ||
  `product-${index}`
"
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
            :variant="isFeatured ? 'featured' : 'product'"
            :badge="isFeatured ? 'Destacado' : ''"
            :image-aspect-class="
              isFeatured ? 'catalog-card__media-frame--featured-product' : 'catalog-card__media-frame--product'
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
