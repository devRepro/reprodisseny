<!-- components/shared/SharedLogo.vue -->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "default" | "negative";
    alt?: string;
  }>(),
  {
    variant: "default",
    alt: "Logo Repro Disseny, imprenta digital, impresión óffset y gran formato",
  }
);

const src = computed(() =>
  props.variant === "negative"
    ? "/img/logo/ReproDisseny_negative.svg"
    : "/img/logo/ReproDisseny.svg"
);
</script>

<template>
  <div class="overflow-hidden" v-bind="$attrs">
    <NuxtImg
      :src="src"
      :alt="props.alt"
      class="block h-full w-auto"
      decoding="async"
      draggable="false"
    />
  </div>
</template>
