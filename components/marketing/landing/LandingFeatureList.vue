<script setup lang="ts">
import type { Component } from "vue";
import { computed } from "vue";

type Feature = {
  title: string;
  description: string;
  icon?: Component | string | null;
};

const props = withDefaults(
  defineProps<{
    items?: Feature[];
    layout?: "stack" | "grid";
    tone?: "light" | "dark";
    variant?: "minimal" | "card";
    class?: string;
  }>(),
  {
    items: () => [],
    layout: "stack",
    tone: "light",
    variant: "minimal",
    class: "",
  }
);

const safeItems = computed(() =>
  props.items
    .map((item) => ({
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
      icon: item.icon || null,
    }))
    .filter((item) => item.title && item.description)
);

const listClass = computed(() => [
  props.layout === "grid" ? "grid gap-5 md:grid-cols-2" : "space-y-5",
  props.class,
]);

const itemClass = computed(() => {
  const base = "grid grid-cols-[2.45rem_1fr] gap-4";

  if (props.variant === "card") {
    return [
      base,
      props.tone === "dark"
        ? "rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[0_16px_44px_-34px_rgba(0,0,0,.65)]"
        : "rounded-2xl border border-border/70 bg-white/75 p-4 shadow-sm backdrop-blur-sm",
    ];
  }

  return [base, "p-0"];
});

const iconClass = computed(() => [
  "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl",
  props.tone === "dark" ? "bg-white/10 text-white" : "bg-white/70 text-primary shadow-sm",
]);
</script>

<template>
  <ul v-if="safeItems.length" :class="listClass" role="list">
    <li v-for="item in safeItems" :key="item.title" :class="itemClass">
      <div :class="iconClass" aria-hidden="true">
        <component v-if="item.icon" :is="item.icon" class="h-5 w-5" />
        <span v-else class="h-1.5 w-1.5 rounded-full bg-current" />
      </div>

      <div class="min-w-0">
        <h3
          class="text-[15px] font-semibold leading-5"
          :class="props.tone === 'dark' ? 'text-white' : 'text-foreground'"
        >
          {{ item.title }}
        </h3>
  
      </div>
    </li>
  </ul>
</template>
