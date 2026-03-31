<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    maxColumns?: 2 | 3 | 4;
    gapClass?: string;
  }>(),
  {
    maxColumns: 4,
    gapClass: "gap-6 md:gap-8",
  }
);

const gridClass = computed(() => {
  if (props.maxColumns === 2) return "grid-cols-1 md:grid-cols-2";
  if (props.maxColumns === 3) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
});
</script>

<template>
  <div :class="['grid auto-rows-fr items-stretch', gridClass, gapClass]">
    <slot />
  </div>
</template>