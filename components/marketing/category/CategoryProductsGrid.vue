<script setup lang="ts">
import { computed, ref } from "vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";
import { Button } from "@/components/ui/button";

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
    initialLimit?: number;
    loadMoreStep?: number;
  }>(),
  {
    products: () => [],
    eyebrow: "Productos",
    title: "Explora los productos de esta categoría",
    description: "Consulta formatos y soluciones disponibles dentro de esta categoría.",
    containerClass: "container-content py-8 md:py-10",
    initialLimit: 8,
    loadMoreStep: 8,
  }
);

const visibleCount = ref(props.initialLimit);

const visibleProducts = computed(() =>
  (props.products ?? []).filter(
    (item) =>
      Boolean(item) &&
      Boolean(item?.title || item?.name) &&
      Boolean(item?.path || item?.slug)
  )
);

const displayedProducts = computed(() =>
  visibleProducts.value.slice(0, visibleCount.value)
);

const remainingCount = computed(() =>
  Math.max(0, visibleProducts.value.length - displayedProducts.value.length)
);

const canLoadMore = computed(() => remainingCount.value > 0);

const gridClass = computed(() => {
  const count = displayedProducts.value.length;

  if (count <= 1) return "mx-auto max-w-[420px] grid-cols-1";
  if (count === 2) return "mx-auto max-w-[920px] grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
});

function loadMore() {
  visibleCount.value += props.loadMoreStep;
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
      </div>

      <ul :class="['mt-6 grid auto-rows-fr gap-5 md:gap-6', gridClass]">
        <li
          v-for="product in displayedProducts"
          :key="product.path || product.slug || product.title || product.name"
          class="h-full list-none"
        >
          <CatalogCard
            :href="product.path || `/productos/${product.slug}`"
            :title="product.title || product.name || ''"
            :description="product.shortDescription || product.description || ''"
            :image="
              product.image ||
              (product.imageSrc
                ? {
                    src: product.imageSrc,
                    alt: product.title || product.name || 'Producto',
                  }
                : null)
            "
            cta-label="Ver producto"
            fallback-label="Producto"
            image-sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
          />
        </li>
      </ul>

      <div v-if="canLoadMore" class="mt-8 flex justify-center">
        <Button
          type="button"
          variant="outline"
          class="rounded-full px-6"
          @click="loadMore"
        >
          Mostrar {{ Math.min(loadMoreStep, remainingCount) }} productos más
        </Button>
      </div>
    </div>
  </section>
</template>
