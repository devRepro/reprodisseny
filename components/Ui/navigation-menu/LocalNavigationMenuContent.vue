<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  type NavigationMenuContentEmits,
  type NavigationMenuContentProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<NavigationMenuContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<NavigationMenuContentEmits>()

// quitamos `class` de los props antes de delegar
const delegatedProps = computed(() => {
  const { class: _, ...rest } = props
  return rest
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <!--
    1. Ya no usamos <NavigationMenuContent> de reka-ui, 
       sino un <div> plano para que no teleporte.
    2. Ponemos absolute + top-full + left-0 para que 
       se abra justo bajo el trigger.
  -->
  <div
    v-bind="forwarded"
    :class="cn(
      'absolute top-full left-0 bg-white border shadow-md rounded-md min-w-[420px] p-4 space-y-4 z-50',
      props.class
    )"
  >
    <slot />
  </div>
</template>

<!--
<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  NavigationMenuViewport,
  type NavigationMenuViewportProps,
  useForwardProps,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<NavigationMenuViewportProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <div class="absolute left-0 top-full flex justify-center">
    <NavigationMenuViewport
      v-bind="forwardedProps"
      :class="
        cn(
          'origin-top-center relative mt-1.5 h-[--reka-navigation-menu-viewport-height] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[--reka-navigation-menu-viewport-width]',
          props.class,
        )
      "
    />
  </div>
</template>

-->
