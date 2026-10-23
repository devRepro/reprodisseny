<!-- components/shared/SharedLogo.vue -->
<script setup lang="ts">
  defineOptions({ inheritAttrs: false })
  import type { HTMLAttributes } from "vue"
  import { cn } from "@/lib/utils"

  const props = withDefaults(
    defineProps<{
      variant?: "default" | "negative"
      alt?: string
      class?: HTMLAttributes["class"]
    }>(),
    {
      variant: "default",
      alt: "Logo Repro Disseny, imprenta digital, impresión óffset y gran formato",
    }
  )

  const src = computed(() =>
    props.variant === "negative"
      ? "/img/logo/reprodisseny_blanco.svg"
      : "/img/logo/reprodisseny.svg"
  )
  </script>

  <template>
    <img
      v-bind="$attrs"
      :src="src"
      :alt="props.alt"
      :class="cn('block h-8 w-auto max-w-full', props.class)"
      decoding="async"
      draggable="false"
    />
  </template>

