<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

type ProductAttribute = {
  label: string;
  icon?: string | null;
  tone?: string | null;
};

const props = withDefaults(
  defineProps<{
    items?: ProductAttribute[];
    class?: string;
  }>(),
  {
    items: () => [],
    class: "",
  }
);

const safeItems = computed(() =>
  (props.items || [])
    .map((item) => ({
      label: String(item?.label || "").trim(),
      icon: item?.icon ? String(item.icon).trim() : null,
      tone: item?.tone ? String(item.tone).trim().toLowerCase() : "neutral",
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

function normalizeToneClass(tone: string | null) {
  const value = String(tone || "neutral")
    .trim()
    .toLowerCase();

  const allowed = new Set([
    "neutral",
    "material",
    "format",
    "finish",
    "file",
    "delivery",
  ]);

  return allowed.has(value) ? value : "neutral";
}
</script>

<template>
  <ul
    v-if="safeItems.length"
    :class="cn('product-attribute-list', props.class)"
    aria-label="Características destacadas del producto"
  >
    <li
      v-for="item in safeItems"
      :key="item.label"
      class="min-w-0"
    >
      <span
        :class="[
          'product-attribute-chip',
          `product-attribute-chip--${normalizeToneClass(item.tone)}`,
        ]"
      >
        <span
          class="product-attribute-chip__mark"
          aria-hidden="true"
        >
          <Icon
            v-if="item.icon && iconMap[item.icon]"
            :name="iconMap[item.icon]"
            class="product-attribute-chip__icon"
          />

          <span
            v-else
            class="product-attribute-chip__dot"
          />
        </span>

        <span class="product-attribute-chip__label">
          {{ item.label }}
        </span>
      </span>
    </li>
  </ul>
</template>