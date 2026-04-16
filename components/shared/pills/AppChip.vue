<script setup lang="ts">
defineOptions({ inheritAttrs: false });

import { computed, useAttrs } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    to?: string | Record<string, unknown> | null;
    href?: string | null;
    target?: string | null;
    rel?: string | null;
    active?: boolean;
    disabled?: boolean;
    class?: string;
  }>(),
  {
    to: null,
    href: null,
    target: null,
    rel: null,
    active: false,
    disabled: false,
    class: "",
  }
);

const attrs = useAttrs();

const chipClass = computed(() =>
  cn(
    "product-form-chip transition-all duration-200",
    "hover:border-primary/28 hover:shadow-sm",
    props.active ? "border-primary/30 bg-accent text-primary" : "",
    props.disabled ? "pointer-events-none opacity-50" : "",
    props.class
  )
);

const externalRel = computed(() => {
  if (props.rel) return props.rel;
  if (props.target === "_blank") return "noopener noreferrer";
  return undefined;
});
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :target="target || undefined"
    :rel="externalRel"
    :class="chipClass"
    v-bind="attrs"
  >
    <slot />
  </NuxtLink>

  <a
    v-else-if="href"
    :href="href"
    :target="target || undefined"
    :rel="externalRel"
    :class="chipClass"
    v-bind="attrs"
  >
    <slot />
  </a>

  <button
    v-else
    type="button"
    :disabled="disabled"
    :class="chipClass"
    v-bind="attrs"
  >
    <slot />
  </button>
</template>