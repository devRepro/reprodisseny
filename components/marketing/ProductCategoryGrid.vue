<script setup lang="ts">
import { computed } from "vue";
import MarketingCategoryCard from "@/components/marketing/MarketingCategoryCard.vue";

type ImageDto = { src: string; alt?: string; width?: number; height?: number } | null;
type CategoryItem = {
  slug: string;
  title: string;
  image?: ImageDto;
  path?: string;
  href?: string;
};
type FilledItem = CategoryItem & { __placeholder?: boolean };

const props = withDefaults(
  defineProps<{
    title?: string;
    categories?: CategoryItem[] | null;
    totalSlots?: number;
    sectionClass?: string;
    containerClass?: string;
  }>(),
  {
    title: "Ofrecemos una amplia gama de productos",
    categories: () => [],
    totalSlots: 8,
    sectionClass: "",
    containerClass: "",
  }
);

const normalized = computed(() =>
  Array.isArray(props.categories) ? props.categories : []
);

const filled = computed<FilledItem[]>(() => {
  const base = normalized.value.slice(0, props.totalSlots);
  const missing = Math.max(0, props.totalSlots - base.length);
  return [
    ...base,
    ...Array.from({ length: missing }, (_, i) => ({
      slug: `__placeholder_${i}`,
      title: "",
      image: null,
      __placeholder: true,
    })),
  ];
});

function categoryHref(c: CategoryItem) {
  return c.href || c.path || `/categorias/${c.slug}`;
}
</script>

<template>
  <section :class="['bg-background text-foreground', props.sectionClass]">
    <div :class="['container py-16', props.containerClass]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <h2>{{ props.title }}</h2>
        <div class="h-px w-full bg-foreground/20 sm:flex-1" />
      </div>

      <div class="mt-12">
        <div
          class="grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-12 md:gap-y-14"
        >
          <template v-for="(c, idx) in filled" :key="c.slug + ':' + idx">
            <div class="w-full md:w-[252px]">
              <div v-if="c.__placeholder" class="pointer-events-none" aria-hidden="true">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="h-[231px] w-full rounded-lg bg-muted/40 ring-1 ring-border"
                  />
                  <div class="h-4 w-40 rounded bg-muted/40" />
                  <!-- simula el botón -->
                  <div class="h-9 w-28 rounded-md bg-muted/40" />
                </div>
              </div>

              <MarketingCategoryCard
                v-else
                :title="c.title"
                :href="categoryHref(c)"
                :image="c.image ?? null"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
