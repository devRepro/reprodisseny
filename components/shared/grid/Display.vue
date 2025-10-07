<!-- components/shared/grid/Display.vue -->
<template>
  <section class="grid-wrapper">
    <!-- si no hay items -->
    <div v-if="!items || !items.length" class="text-center py-10">
      No hay elementos para mostrar.
    </div>

    <!-- si hay items -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <SharedCard
        v-for="item in items"
        :key="itemKey(item)"
        :title="itemTitle(item)"
        :link="itemLink(item)"
        :image="itemImage(item)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  items: any[] | undefined | null;
  keyFn?: (item: any) => string | number;
  titleFn?: (item: any) => string;
  linkFn?: (item: any) => string;
  imageFn?: (item: any) => string | undefined;
}>();

// funciones por defecto para extraer campos si no se pasan
const itemKey = (item: any): string | number => {
  if (props.keyFn) return props.keyFn(item);
  return item.id ?? item.slug ?? JSON.stringify(item);
};

const itemTitle = (item: any): string => {
  if (props.titleFn) return props.titleFn(item);
  return item.title ?? item.nav ?? item.slug ?? "";
};

const itemLink = (item: any): string => {
  if (props.linkFn) return props.linkFn(item);
  return item.link ?? item.path ?? `/`;
};

const itemImage = (item: any): string => {
  if (props.imageFn) return props.imageFn(item);
  return item.image ?? "";
};

// items list normalizada
const items = computed(() => (Array.isArray(props.items) ? props.items : []));
</script>

<style scoped>
.grid-wrapper {
  padding: 2rem;
}
</style>
