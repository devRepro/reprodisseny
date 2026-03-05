<script setup lang="ts">
import { cn } from "@/lib/utils"

withDefaults(
  defineProps<{
    class?: string
    gap?: "tight" | "normal" | "loose"
  }>(),
  { class: "", gap: "normal" }
)

const gaps = {
  tight: "space-y-6 md:space-y-8",
  normal: "space-y-8 md:space-y-10 lg:space-y-14", // 👈 tu recomendado: 32/40/56
  loose: "space-y-10 md:space-y-14 lg:space-y-20",
}
</script>

<template>
  <div>
    <slot />
  </div>
</template>