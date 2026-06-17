<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

type ProductAttributeTone =
  | "neutral"
  | "material"
  | "format"
  | "finish"
  | "file"
  | "delivery";

type ProductAttribute = {
  label: string;
  icon?: string | null;
  tone?: ProductAttributeTone | string | null;
};

const props = withDefaults(
  defineProps<{
    items?: ProductAttribute[];
    class?: string;
    limit?: number;
  }>(),
  {
    items: () => [],
    class: "",
    limit: 4,
  },
);

const ATTRIBUTE_TONES = new Set<ProductAttributeTone>([
  "neutral",
  "material",
  "format",
  "finish",
  "file",
  "delivery",
]);

const ATTRIBUTE_ICON_MAP: Record<string, string> = {
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

function normalizeTone(tone?: string | null): ProductAttributeTone {
  const value = String(tone || "neutral")
    .trim()
    .toLowerCase() as ProductAttributeTone;

  return ATTRIBUTE_TONES.has(value) ? value : "neutral";
}

function normalizeIcon(icon?: string | null) {
  const value = String(icon || "")
    .trim()
    .toLowerCase();

  return value ? ATTRIBUTE_ICON_MAP[value] || null : null;
}

const safeItems = computed(() =>
  (props.items || [])
    .map((item) => {
      const label = String(item?.label || "").trim();

      return {
        label,
        icon: normalizeIcon(item?.icon),
        tone: normalizeTone(item?.tone),
      };
    })
    .filter((item) => item.label)
    .slice(0, Math.max(0, props.limit)),
);
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
          `product-attribute-chip--${item.tone}`,
        ]"
      >
        <span
          class="product-attribute-chip__mark"
          aria-hidden="true"
        >
          <Icon
            v-if="item.icon"
            :name="item.icon"
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