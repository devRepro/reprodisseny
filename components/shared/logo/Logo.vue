<!-- components/shared/SharedLogo.vue -->
<script setup lang="ts">
  defineOptions({ inheritAttrs: false })
  
  const props = withDefaults(
    defineProps<{
      variant?: "default" | "negative"
      alt?: string
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
      class="block w-auto h-8"
      decoding="async"
      draggable="false"
    />
  </template>
  