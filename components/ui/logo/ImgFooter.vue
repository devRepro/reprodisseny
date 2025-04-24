<script setup lang="ts">
// forward all attributes to the container
// Use defineOptions({ inheritAttrs: false }) if you apply $attrs manually deeper
</script>

<template>
  <div class="overflow-hidden" v-bind="$attrs">
    <img
      src="@/assets/img/logos/ReproDisseny_negative.svg"
      alt="Logo Repro Disseny, imprenta digital, impresión óffset y gran formato"
      class="block h-full w-auto" />
  </div>
</template>