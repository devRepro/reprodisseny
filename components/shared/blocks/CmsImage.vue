<script setup lang="ts">
import { computed } from "vue";
import { normalizeCmsMediaSrc } from "~/utils/cmsMedia";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt?: string | null;
    width?: number | string;
    height?: number | string;
    eager?: boolean;
  }>(),
  {
    src: "",
    alt: "",
    eager: false,
  }
);

const resolvedSrc = computed(() => normalizeCmsMediaSrc(props.src));
const resolvedAlt = computed(() => String(props.alt || "").trim());
</script>

<template>
  <img
    v-if="resolvedSrc"
    v-bind="$attrs"
    :src="resolvedSrc"
    :alt="resolvedAlt"
    :width="width"
    :height="height"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : undefined"
    decoding="async"
  />
</template>
