<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

type ProductAttributeTone =
  | "neutral"
  | "material"
  | "format"
  | "finish"
  | "file"
  | "delivery"

type ProductAttribute = {
  label: string
  icon?: string | null
  tone?: ProductAttributeTone | string | null
}

const props = withDefaults(
  defineProps<{
    items?: ProductAttribute[]
    class?: HTMLAttributes["class"]
    limit?: number
  }>(),
  {
    items: () => [],
    class: "",
    limit: 4,
  },
)

const ATTRIBUTE_TONES = new Set<ProductAttributeTone>([
  "neutral",
  "material",
  "format",
  "finish",
  "file",
  "delivery",
])

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
}

function normalizeTone(tone?: string | null): ProductAttributeTone {
  const value = String(tone || "neutral")
    .trim()
    .toLowerCase() as ProductAttributeTone

  return ATTRIBUTE_TONES.has(value) ? value : "neutral"
}

function normalizeIcon(icon?: string | null) {
  const value = String(icon || "")
    .trim()
    .toLowerCase()

  return value ? ATTRIBUTE_ICON_MAP[value] || null : null
}

const safeLimit = computed(() => Math.max(0, Number(props.limit) || 0))

const safeItems = computed(() =>
  (props.items || [])
    .map((item) => {
      const label = String(item?.label || "").trim()

      return {
        label,
        icon: normalizeIcon(item?.icon),
        tone: normalizeTone(item?.tone),
      }
    })
    .filter((item) => item.label)
    .slice(0, safeLimit.value),
)

function getChipClass(tone: ProductAttributeTone) {
  const base =
    "inline-flex min-h-10 w-full items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold leading-5 shadow-sm transition-colors duration-200"

  switch (tone) {
    case "material":
      return cn(
        base,
        "border-primary/20 bg-primary/10 text-primary",
      )

    case "format":
      return cn(
        base,
        "border-sky-200 bg-sky-50 text-sky-800",
      )

    case "finish":
      return cn(
        base,
        "border-violet-200 bg-violet-50 text-violet-800",
      )

    case "file":
      return cn(
        base,
        "border-amber-200 bg-amber-50 text-amber-800",
      )

    case "delivery":
      return cn(
        base,
        "border-emerald-200 bg-emerald-50 text-emerald-800",
      )

    case "neutral":
    default:
      return cn(
        base,
        "border-border bg-background text-foreground",
      )
  }
}

function getMarkClass(tone: ProductAttributeTone) {
  switch (tone) {
    case "material":
      return "bg-primary text-primary-foreground"

    case "format":
      return "bg-sky-600 text-white"

    case "finish":
      return "bg-violet-600 text-white"

    case "file":
      return "bg-amber-600 text-white"

    case "delivery":
      return "bg-emerald-600 text-white"

    case "neutral":
    default:
      return "bg-muted text-muted-foreground"
  }
}
</script>

<template>
  <ul
    v-if="safeItems.length"
    :class="cn('grid gap-2 sm:grid-cols-2 lg:grid-cols-4', props.class)"
    aria-label="Características destacadas del producto"
  >
    <li
      v-for="item in safeItems"
      :key="`${item.tone}-${item.label}`"
      class="min-w-0 list-none"
    >
      <span :class="getChipClass(item.tone)">
        <span
          :class="
            cn(
              'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
              getMarkClass(item.tone)
            )
          "
          aria-hidden="true"
        >
          <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />

          <span v-else class="h-2 w-2 rounded-full bg-current" />
        </span>

        <span class="min-w-0 truncate">
          {{ item.label }}
        </span>
      </span>
    </li>
  </ul>
</template>
