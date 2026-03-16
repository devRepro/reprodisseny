<script setup lang="ts">
import { computed } from "vue";
import MarketingCategoryCard from "@/components/marketing/MarketingCategoryCard.vue";

type CategoryItem = {
  id: string;
  title: string;
  slug: string;
  href: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null;
};

type PlaceholderItem = {
  id: string;
  __placeholder: true;
};

type GridItem = CategoryItem | PlaceholderItem;

const props = withDefaults(
  defineProps<{
    title?: string;
    categories?: CategoryItem[] | null;
    totalSlots?: number;
    pending?: boolean;
    sectionClass?: string;
    containerClass?: string;
  }>(),
  {
    title: "Ofrecemos una amplia gama de productos",
    categories: () => [],
    totalSlots: 8,
    pending: false,
    sectionClass: "",
    containerClass: "mx-auto w-full max-w-[1440px] px-6 lg:px-10 2xl:px-[120px] py-16",
  }
);

const headingId = "home-product-category-grid-title";

const items = computed<CategoryItem[]>(() =>
  Array.isArray(props.categories) ? props.categories.slice(0, props.totalSlots) : []
);

const placeholders = computed<PlaceholderItem[]>(() => {
  if (!props.pending) return [];

  const missing = Math.max(0, props.totalSlots - items.value.length);

  return Array.from({ length: missing }, (_, i) => ({
    id: `__placeholder_${i}`,
    __placeholder: true,
  }));
});

const gridItems = computed<GridItem[]>(() => [...items.value, ...placeholders.value]);

function isPlaceholder(item: GridItem): item is PlaceholderItem {
  return "__placeholder" in item;
}
</script>

<template>
  <section
    :class="['bg-background text-foreground', props.sectionClass]"
    :aria-labelledby="headingId"
  >
    <div :class="props.containerClass">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <h2 :id="headingId" class="text-brand-ink-dark">
          {{ props.title }}
        </h2>
        <div class="h-px w-full bg-brand-ink-medium/30 sm:flex-1" />
      </div>

      <div class="mt-12">
        <ul class="grid grid-cols-1 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4 xl:gap-y-14">
          <li
            v-for="item in gridItems"
            :key="item.id"
            class="w-full max-w-[252px] list-none"
          >
            <div
              v-if="isPlaceholder(item)"
              class="pointer-events-none"
              aria-hidden="true"
            >
              <div class="flex flex-col items-center text-center">
                <div class="overflow-hidden rounded-2xl bg-brand-bg-2">
                  <div class="h-[231px] w-[252px]" />
                </div>
                <div class="mt-3 h-4 w-40 rounded bg-muted/40" />
                <div class="mt-2 h-8 w-28 rounded-full bg-muted/40" />
              </div>
            </div>

            <MarketingCategoryCard
              v-else
              :title="item.title"
              :href="item.href"
              :image="item.image"
            />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>