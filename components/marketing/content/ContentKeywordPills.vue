<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import type { KeywordPillItem } from "@/utils/relatedKeywordPills";

const props = withDefaults(
  defineProps<{
    items?: KeywordPillItem[];
    ariaLabel?: string;
    class?: string;
  }>(),
  {
    items: () => [],
    ariaLabel: "Productos relacionados",
    class: "",
  }
);

const normalizedItems = computed(() => {
  const seen = new Set<string>();

  return (props.items || [])
    .filter((item) => {
      const label = String(item?.label || "").trim();
      const to = String(item?.to || "").trim();

      if (!label || !to || seen.has(to)) return false;
      seen.add(to);
      return true;
    })
    .slice(0, 3);
});
</script>

<template>
  <nav
    v-if="normalizedItems.length"
    :aria-label="ariaLabel"
    :class="cn('w-full', props.class)"
  >
    <ul class="flex flex-wrap gap-2.5">
      <li v-for="item in normalizedItems" :key="item.to">
        <NuxtLink
          :to="item.to"
          :aria-label="item.ariaLabel || item.label"
          class="inline-flex min-h-10 items-center rounded-full border border-primary/12 bg-background px-4 py-2 text-body-s font-medium text-primary shadow-[0_8px_20px_-16px_hsl(var(--foreground)/0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/22 hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2"
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
