<script setup lang="ts">
defineOptions({ inheritAttrs: false })

import { computed, useAttrs, type HTMLAttributes } from "vue"
import { ArrowRight, LoaderCircle } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"

type AppButtonSize = "sm" | "md" | "lg" | "icon"

const props = withDefaults(
  defineProps<{
    to?: string | Record<string, unknown> | null
    href?: string | null
    target?: string | null
    rel?: string | null
    type?: "button" | "submit" | "reset"
    variant?: AppButtonVariant
    size?: AppButtonSize
    loading?: boolean
    disabled?: boolean
    block?: boolean
    arrow?: boolean
    class?: HTMLAttributes["class"]
  }>(),
  {
    to: null,
    href: null,
    target: null,
    rel: null,
    type: "button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    block: false,
    arrow: false,
    class: "",
  },
)

const attrs = useAttrs()

const isDisabled = computed(() => props.disabled || props.loading)

const shadcnVariant = computed(() => {
  /**
   * Usamos shadcn como primitivo estructural.
   * El look real lo controla main.scss con .btn-*.
   */
  return "ghost"
})

const shadcnSize = computed(() => {
  return props.size === "icon" ? "icon" : "default"
})

const variantClass = computed(() => {
  switch (props.variant) {
    case "primary":
      return "btn-primary"
    case "secondary":
      return "btn-secondary"
    case "outline":
      return "btn-outline"
    case "ghost":
      return "btn-ghost"
    case "link":
      return "btn-link"
    case "destructive":
      return "btn-destructive"
    default:
      return "btn-primary"
  }
})

const sizeClass = computed(() => {
  if (props.variant === "link") return ""

  switch (props.size) {
    case "sm":
      return "btn-sm"
    case "lg":
      return "btn-lg"
    case "icon":
      return "btn-icon"
    case "md":
    default:
      return "btn-md"
  }
})

const buttonClass = computed(() =>
  cn(
    "btn",
    variantClass.value,
    sizeClass.value,
    props.block && props.variant !== "link" ? "btn-block" : "",
    isDisabled.value ? "btn-disabled" : "",
    props.class,
  ),
)

const externalRel = computed(() => {
  if (props.rel) return props.rel
  if (props.target === "_blank") return "noopener noreferrer"

  return undefined
})
</script>

<template>
  <Button
    v-if="to"
    as-child
    :variant="shadcnVariant"
    :size="shadcnSize"
    :class="buttonClass"
    v-bind="attrs"
  >
    <NuxtLink
  :to="to"
  :target="target || undefined"
  :rel="externalRel"
  :aria-disabled="isDisabled || undefined"
  :tabindex="isDisabled ? -1 : undefined"
  @click="isDisabled && $event.preventDefault()"
>
      <LoaderCircle v-if="loading" class="btn-icon-svg animate-spin" />
      <slot />
      <ArrowRight v-if="arrow && !loading" class="btn-icon-svg" />
    </NuxtLink>
  </Button>

  <Button
    v-else-if="href"
    as-child
    :variant="shadcnVariant"
    :size="shadcnSize"
    :class="buttonClass"
    v-bind="attrs"
  >
    <a
  :href="isDisabled ? undefined : href"
  :target="target || undefined"
  :rel="externalRel"
  :aria-disabled="isDisabled || undefined"
  :tabindex="isDisabled ? -1 : undefined"
>
      <LoaderCircle v-if="loading" class="btn-icon-svg animate-spin" />
      <slot />
      <ArrowRight v-if="arrow && !loading" class="btn-icon-svg" />
    </a>
  </Button>

  <Button
    v-else
    :type="type"
    :variant="shadcnVariant"
    :size="shadcnSize"
    :class="buttonClass"
    :disabled="isDisabled"
    v-bind="attrs"
  >
    <LoaderCircle v-if="loading" class="btn-icon-svg animate-spin" />
    <slot />
    <ArrowRight v-if="arrow && !loading" class="btn-icon-svg" />
  </Button>
</template>