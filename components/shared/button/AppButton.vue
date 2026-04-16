<script setup lang="ts">
defineOptions({ inheritAttrs: false });

import { computed, useAttrs } from "vue";
import { ArrowRight, LoaderCircle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive";

type AppButtonSize = "sm" | "md" | "lg" | "icon";

const props = withDefaults(
  defineProps<{
    to?: string | Record<string, unknown> | null;
    href?: string | null;
    target?: string | null;
    rel?: string | null;
    type?: "button" | "submit" | "reset";
    variant?: AppButtonVariant;
    size?: AppButtonSize;
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
    arrow?: boolean;
    class?: string;
  }>(),
  {
    to: null,
    href: null,
    target: null,
    rel: null,
    type: "button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    block: false,
    arrow: false,
    class: "",
  }
);

const attrs = useAttrs();

const isDisabled = computed(() => props.disabled || props.loading);

const shadcnVariant = computed(() => {
  switch (props.variant) {
    case "primary":
      return "default";
    case "secondary":
      return "secondary";
    case "outline":
      return "outline";
    case "ghost":
      return "ghost";
    case "link":
      return "link";
    case "destructive":
      return "destructive";
    default:
      return "default";
  }
});

const shadcnSize = computed(() => {
  return props.size === "icon" ? "icon" : "default";
});

const sizeClass = computed(() => {
  if (props.variant === "link") {
    return "h-auto px-0 py-0 text-body-s";
  }

  switch (props.size) {
    case "sm":
      return "h-9 px-4 text-body-s";
    case "lg":
      return "h-12 px-6 text-body";
    case "icon":
      return "h-10 w-10 p-0";
    case "md":
    default:
      return "h-11 px-5 text-body-s";
  }
});

const variantClass = computed(() => {
  switch (props.variant) {
    case "primary":
      return [
        "rounded-2xl border border-transparent",
        "bg-primary text-primary-foreground shadow-sm",
        "hover:bg-primary/92",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      ].join(" ");

    case "secondary":
      return [
        "rounded-2xl border border-border",
        "bg-accent text-foreground shadow-sm",
        "hover:bg-accent/80",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      ].join(" ");

    case "outline":
      return [
        "rounded-2xl border border-border",
        "bg-background text-foreground shadow-sm",
        "hover:bg-accent/45",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      ].join(" ");

    case "ghost":
      return [
        "rounded-2xl border border-transparent",
        "bg-transparent text-foreground",
        "hover:bg-accent/45",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      ].join(" ");

    case "link":
      return [
        "rounded-none border-0 bg-transparent shadow-none",
        "text-primary hover:text-primary/80",
        "underline-offset-4 hover:no-underline",
      ].join(" ");

    case "destructive":
      return [
        "rounded-2xl border border-transparent shadow-sm",
      ].join(" ");

    default:
      return "";
  }
});

const buttonClass = computed(() =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200",
    "[&_svg]:shrink-0",
    props.block && props.variant !== "link" ? "w-full" : "",
    isDisabled.value ? "pointer-events-none opacity-50" : "",
    sizeClass.value,
    variantClass.value,
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
  <Button
    v-if="to"
    as-child
    :variant="shadcnVariant"
    :size="shadcnSize"
    :class="buttonClass"
    v-bind="attrs"
  >
    <NuxtLink :to="to" :target="target || undefined" :rel="externalRel">
      <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
      <slot />
      <ArrowRight v-if="arrow && !loading" class="h-4 w-4" />
    </NuxtLink>
  </Button>

  <Button
    v-else-if="href"
    as-child
    :variant="shadcnVariant"
    :size="shadcnSize"
    :class="buttonClass"
    v-bind="attrs"
  >
    <a :href="href" :target="target || undefined" :rel="externalRel">
      <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
      <slot />
      <ArrowRight v-if="arrow && !loading" class="h-4 w-4" />
    </a>
  </Button>

  <Button
    v-else
    :type="type"
    :variant="shadcnVariant"
    :size="shadcnSize"
    :class="buttonClass"
    :disabled="isDisabled"
    v-bind="attrs"
  >
    <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
    <slot />
    <ArrowRight v-if="arrow && !loading" class="h-4 w-4" />
  </Button>
</template>