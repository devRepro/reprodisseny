<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(
  defineProps<{
    class?: string
    gap?: "tight" | "normal" | "loose"
  }>(),
  { class: "", gap: "normal" }
)

const gaps = {
  tight: "space-y-6 md:space-y-8",
  normal: "space-y-8 md:space-y-10 lg:space-y-14",
  loose: "space-y-10 md:space-y-14 lg:space-y-20",
}

const classes = computed(() => cn(gaps[props.gap], props.class))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>