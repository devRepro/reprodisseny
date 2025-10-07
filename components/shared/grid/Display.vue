<!-- ===============================
components/shared/grid/Display.vue (refactor)
- Fluid grid using CSS grid auto-fit.
- Slots to fully control internal renderers.
- Sensible defaults using mapping fns.
================================== -->
<template>
  <section class="grid-wrapper">
    <div v-if="!items || !items.length" class="py-10 text-center text-muted-foreground">
      No hay elementos para mostrar.
    </div>

    <div
      v-else
      class="grid grid-flow-row gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] md:gap-7"
    >
      <slot v-for="item in normalized" :key="itemKey(item)" name="item" :item="item">
        <!-- Default renderer: CategoryCard -->
        <CategoryCard
          :title="itemTitle(item)"
          :href="itemLink(item)"
          :image="itemImage(item)"
          :excerpt="itemExcerpt(item)"
          :count="itemCount(item)"
          :badges="itemBadges(item)"
        />
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CategoryCard from "@/components/shared/card/CategoryCard.vue";

const props = defineProps<{
  items: any[] | null | undefined;
  keyFn?: (item: any) => string | number;
  titleFn?: (item: any) => string;
  linkFn?: (item: any) => string;
  imageFn?: (item: any) => string | undefined;
  excerptFn?: (item: any) => string | undefined;
  countFn?: (item: any) => number | undefined;
  badgesFn?: (item: any) => string[] | undefined;
}>();

const normalized = computed(() => (Array.isArray(props.items) ? props.items : []));

const itemKey = (item: any): string | number =>
  props.keyFn ? props.keyFn(item) : item.id ?? item.slug ?? JSON.stringify(item);
const itemTitle = (item: any): string =>
  props.titleFn ? props.titleFn(item) : item.title ?? item.nav ?? item.slug ?? "";
const itemLink = (item: any): string =>
  props.linkFn ? props.linkFn(item) : item.link ?? item.path ?? "/";
const itemImage = (item: any): string =>
  props.imageFn ? props.imageFn(item) : item.image ?? "";
const itemExcerpt = (item: any): string =>
  props.excerptFn ? props.excerptFn(item) : item.excerpt ?? item.description ?? "";
const itemCount = (item: any): number =>
  props.countFn
    ? Number(props.countFn(item))
    : Number(item.count ?? item.productsCount ?? NaN);
const itemBadges = (item: any): string[] =>
  props.badgesFn ? props.badgesFn(item) || [] : item.badges || [];
</script>

<style scoped>
.grid-wrapper {
  padding: 1.25rem;
}
@media (min-width: 768px) {
  .grid-wrapper {
    padding: 1.5rem;
  }
}
@media (min-width: 1024px) {
  .grid-wrapper {
    padding: 2rem;
  }
}
</style>
