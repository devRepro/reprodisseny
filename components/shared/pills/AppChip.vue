<script setup lang="ts">
defineOptions({ inheritAttrs: false });

import { computed, useAttrs } from "vue";
import { cn } from "@/lib/utils";

type AppChipVariant = "pill" | "tab" | "related";

const props = withDefaults(
  defineProps<{
    to?: string | Record<string, unknown> | null;
    href?: string | null;
    target?: string | null;
    rel?: string | null;
    active?: boolean;
    disabled?: boolean;
    variant?: AppChipVariant;
    class?: string;
  }>(),
  {
    to: null,
    href: null,
    target: null,
    rel: null,
    active: false,
    disabled: false,
    variant: "pill",
    class: "",
  },
);

const attrs = useAttrs();

const chipClass = computed(() =>
  cn(
    "rd-chip",
    `rd-chip--${props.variant}`,
    props.active && "rd-chip--active",
    props.disabled && "rd-chip--disabled",
    props.class,
  ),
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
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    :class="chipClass"
    v-bind="attrs"
  >
    <slot />
  </NuxtLink>

  <a
    v-else-if="href"
    :href="disabled ? undefined : href"
    :target="target || undefined"
    :rel="externalRel"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
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