<script setup lang="ts">
defineOptions({ inheritAttrs: false })

import { computed, useAttrs, useSlots, type HTMLAttributes } from "vue"
import { ArrowRight, LoaderCircle } from "lucide-vue-next"
import { cn } from "@/lib/utils"

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "onDark"
  | "ghostOnDark"

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
const slots = useSlots()

const isDisabled = computed(() => props.disabled || props.loading)

const variantClass = computed(() => {
  switch (props.variant) {
    case "primary":
      return "btn-primary"
    case "secondary":
      return "btn-secondary"
    case "outline":
      /**
       * Alias mantenido por compatibilidad con llamadas antiguas.
       * El sistema oficial de diseño usa "secondary".
       */
      return "btn-secondary"
    case "ghost":
      return "btn-ghost"
    case "link":
      return "btn-link"
    case "destructive":
      return "btn-destructive"
    case "onDark":
      return "btn-on-dark"
    case "ghostOnDark":
      return "btn-ghost-on-dark"
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

const showRightArrow = computed(() => {
  return Boolean(props.arrow && !props.loading && !slots["icon-right"])
})

function onDisabledClick(event: MouseEvent) {
  if (!isDisabled.value) return

  event.preventDefault()
  event.stopPropagation()
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :target="target || undefined"
    :rel="externalRel"
    :class="buttonClass"
    :aria-disabled="isDisabled || undefined"
    :tabindex="isDisabled ? -1 : undefined"
    v-bind="attrs"
    @click="onDisabledClick"
  >
    <LoaderCircle v-if="loading" class="btn-icon-svg animate-spin" aria-hidden="true" />
    <slot v-else name="icon-left" />

    <slot />

    <slot name="icon-right" />
    <ArrowRight v-if="showRightArrow" class="btn-icon-svg" aria-hidden="true" />
  </NuxtLink>

  <a
    v-else-if="href"
    :href="isDisabled ? undefined : href"
    :target="target || undefined"
    :rel="externalRel"
    :class="buttonClass"
    :aria-disabled="isDisabled || undefined"
    :tabindex="isDisabled ? -1 : undefined"
    v-bind="attrs"
    @click="onDisabledClick"
  >
    <LoaderCircle v-if="loading" class="btn-icon-svg animate-spin" aria-hidden="true" />
    <slot v-else name="icon-left" />

    <slot />

    <slot name="icon-right" />
    <ArrowRight v-if="showRightArrow" class="btn-icon-svg" aria-hidden="true" />
  </a>

  <button
    v-else
    :type="type"
    :class="buttonClass"
    :disabled="isDisabled"
    v-bind="attrs"
  >
    <LoaderCircle v-if="loading" class="btn-icon-svg animate-spin" aria-hidden="true" />
    <slot v-else name="icon-left" />

    <slot />

    <slot name="icon-right" />
    <ArrowRight v-if="showRightArrow" class="btn-icon-svg" aria-hidden="true" />
  </button>
</template>
