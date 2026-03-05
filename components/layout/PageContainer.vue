<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(
  defineProps<{
    as?: "div" | "section" | "main" | "nav"
    size?: "content" | "wide" | "full" // content=1200, wide=1440, full=100%
    class?: string
  }>(),
  { as: "div", size: "content", class: "" }
)

const base = "mx-auto w-full px-6 md:px-10"
const width = computed(() => {
  if (props.size === "full") return "max-w-none"
  if (props.size === "wide") return "max-w-[1440px]"
  return "max-w-[1200px]"
})
</script>

<template>
  <component :is="as" :class="cn(base, width, props.class)">
    <slot />
  </component>
</template>