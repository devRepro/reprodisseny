<script setup lang="ts">
import { computed } from "vue";

type ProductAttribute = {
  label: string;
  icon?: string | null;
  tone?: string | null;
};

const props = withDefaults(
  defineProps<{
    items?: ProductAttribute[];
  }>(),
  {
    items: () => [],
  }
);

const safeItems = computed(() =>
  (props.items || [])
    .map((item) => ({
      label: String(item?.label || "").trim(),
      icon: item?.icon ? String(item.icon) : null,
      tone: item?.tone ? String(item.tone) : "neutral",
    }))
    .filter((item) => item.label)
    .slice(0, 4)
);

const iconMap: Record<string, string> = {
  headphones: "lucide:headphones",
  "file-check": "lucide:file-check-2",
  zap: "lucide:zap",
  layers: "lucide:layers",
  scissors: "lucide:scissors",
  ruler: "lucide:ruler",
  clock: "lucide:clock-3",
  shield: "lucide:shield-check",
  sparkles: "lucide:sparkles",
};
</script>

<template>
  <ul
    v-if="safeItems.length"
    class="product-attribute-list"
    aria-label="Características destacadas del producto"
  >
    <li
      v-for="item in safeItems"
      :key="item.label"
      class="min-w-0"
    >
      <span class="product-attribute-chip">
        <Icon
          v-if="item.icon && iconMap[item.icon]"
          :name="iconMap[item.icon]"
          class="product-attribute-chip__icon"
          aria-hidden="true"
        />

        <span class="product-attribute-chip__label">
          {{ item.label }}
        </span>
      </span>
    </li>
  </ul>
</template>