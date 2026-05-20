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
  }
);

const attrs = useAttrs();

const baseClass = computed(() =>
  cn(
    "inline-flex items-center justify-center whitespace-nowrap select-none",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
  )
);

const pillClass = computed(() =>
  cn(
    "product-form-chip min-h-9 rounded-full px-4 py-2 text-body-s",
    props.active
      ? "border-primary/30 bg-accent text-primary shadow-[0_8px_20px_-16px_hsl(var(--foreground)/0.18)]"
      : "border-border/70 bg-card text-foreground/75 hover:border-primary/24 hover:text-primary hover:shadow-sm"
  )
);

const tabClass = computed(() =>
  cn(
    "min-h-11 rounded-full border px-5 py-2.5 text-body-s font-semibold",
    props.active
      ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-18px_hsl(var(--foreground)/0.18)]"
      : "border-border bg-background text-foreground/80 hover:border-primary/25 hover:bg-accent/40 hover:text-primary"
  )
);

const relatedClass = computed(() =>
  cn(
    "min-h-9 rounded-full border px-4 py-2 text-body-s font-medium shadow-sm",
    props.active
      ? "border-foreground/25 bg-foreground text-background"
      : "border-border/80 bg-secondary/70 text-foreground/80 hover:border-foreground/25 hover:bg-foreground hover:text-background"
  )
);



const chipClass = computed(() =>
  cn(
    baseClass.value,
    props.variant === "tab"
      ? tabClass.value
      : props.variant === "related"
        ? relatedClass.value
        : pillClass.value,
    props.disabled ? "pointer-events-none opacity-50" : "",
    props.class
  )
)

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