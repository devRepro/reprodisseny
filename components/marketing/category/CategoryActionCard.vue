<!-- components/marketing/category/CategoryActionCard.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight } from "lucide-vue-next";

type Props = {
  title: string;
  description?: string;
  /** Internal navigation (NuxtLink) */
  to?: string;
  /** External link (a href) */
  href?: string;
  /** Optional badge/tag */
  badge?: string;
  /** Optional CTA label */
  ctaLabel?: string;
  /** Open external link in new tab */
  newTab?: boolean;
  /** Optional icon component (e.g. from lucide-vue-next) */
  icon?: any;
  /** Visual emphasis */
  variant?: "default" | "primary";
};

const props = withDefaults(defineProps<Props>(), {
  description: "",
  to: undefined,
  href: undefined,
  badge: "",
  ctaLabel: "Més informació",
  newTab: false,
  icon: undefined,
  variant: "default",
});

const isExternal = computed(() => !!props.href && !props.to);
const isInternal = computed(() => !!props.to && !props.href);

const tag = computed(() => {
  if (isInternal.value) return "NuxtLink";
  if (isExternal.value) return "a";
  return "div";
});

const linkAttrs = computed(() => {
  if (isInternal.value) return { to: props.to };
  if (isExternal.value) {
    return {
      href: props.href,
      target: props.newTab ? "_blank" : undefined,
      rel: props.newTab ? "noopener noreferrer" : undefined,
    };
  }
  return {};
});

const cardClass = computed(() => {
  const base =
    "group relative block rounded-2xl border bg-card/60 p-5 shadow-sm transition " +
    "hover:-translate-y-0.5 hover:bg-card hover:shadow-md " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30";
  const variant =
    props.variant === "primary"
      ? " border-primary/25 ring-1 ring-primary/10"
      : " border-border";
  return base + variant;
});
</script>

<template>
  <component :is="tag" v-bind="linkAttrs" :class="cardClass">
    <div class="flex items-start gap-4">
      <div
        v-if="icon"
        class="mt-0.5 grid h-10 w-10 place-items-center rounded-xl border border-border bg-background"
        aria-hidden="true"
      >
        <component :is="icon" class="h-5 w-5" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-base font-semibold leading-6 text-foreground">
            {{ title }}
          </h3>

          <span
            v-if="badge"
            class="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/80"
          >
            {{ badge }}
          </span>
        </div>

        <p v-if="description" class="mt-2 text-sm leading-6 text-muted-foreground">
          {{ description }}
        </p>

        <div
          v-if="isInternal || isExternal"
          class="mt-4 inline-flex items-center gap-2 text-sm font-medium"
        >
          <span class="text-primary group-hover:underline">{{ ctaLabel }}</span>
          <ArrowRight
            class="h-4 w-4 text-primary transition group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </component>
</template>
