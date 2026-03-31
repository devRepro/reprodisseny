<script setup lang="ts">
import { computed } from "vue";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";

type CategoryItem = {
  id: string;
  title: string;
  slug: string;
  href: string;
  image: {
    src?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  parentId?: string | null;
  parentSlug?: string | null;
  level?: number | null;
  shortDescription?: string | null;
  description?: string | null;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    categories?: CategoryItem[] | null;
    totalSlots?: number;
    pending?: boolean;
    sectionClass?: string;
    containerClass?: string;
  }>(),
  {
    title: "Ofrecemos una amplia gama de productos",
    description: "",
    categories: () => [],
    totalSlots: 8,
    pending: false,
    sectionClass: "",
    containerClass: "container-content py-10 md:py-14 lg:py-16",
  }
);

const headingId = "home-product-category-grid-title";

function isTopLevelCategory(category: CategoryItem) {
  if (category.level != null) return category.level === 1;
  return !category.parentId && !category.parentSlug;
}

const sourceCategories = computed<CategoryItem[]>(() =>
  Array.isArray(props.categories) ? props.categories : []
);

const visibleItems = computed<CategoryItem[]>(() =>
  sourceCategories.value.filter(isTopLevelCategory).slice(0, props.totalSlots)
);

const skeletonCount = computed(() => {
  if (!props.pending) return 0;
  return Math.max(0, props.totalSlots - visibleItems.value.length);
});
</script>

<template>
  <section
    :class="['bg-background text-foreground', props.sectionClass]"
    :aria-labelledby="headingId"
  >
    <div :class="props.containerClass">
      <header class="space-y-4">
        <SectionHeading
          :id="headingId"
          as="h2"
          :title="props.title"
          title-tone="ink"
          line-tone="ink"
          class="w-full"
        />

        <p
          v-if="props.description"
          class="max-w-2xl text-base leading-7 text-muted-foreground"
        >
          {{ props.description }}
        </p>
      </header>

      <div class="mt-10 md:mt-12">
        <ul class="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          <li
            v-for="item in visibleItems"
            :key="item.id"
            class="h-full list-none"
          >
            <CatalogCard
              :href="item.href"
              :title="item.title"
              :description="item.shortDescription || item.description || ''"
              :image="item.image"
              cta-label="Ver categoría"
              fallback-label="Categoría"
            />
          </li>

          <li
            v-for="n in skeletonCount"
            :key="`home-category-skeleton-${n}`"
            class="h-full list-none"
            aria-hidden="true"
          >
            <article
              class="h-full rounded-3xl border border-border/60 bg-card p-4 shadow-sm md:p-5"
            >
              <div class="overflow-hidden rounded-[1.25rem] border border-border/40 bg-muted/30">
                <div class="aspect-[4/3] animate-pulse bg-muted" />
              </div>

              <div class="space-y-3 px-1 pt-4">
                <div class="h-6 w-3/4 animate-pulse rounded-md bg-muted" />
                <div class="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                <div class="pt-2">
                  <div class="h-10 w-36 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            </article>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>