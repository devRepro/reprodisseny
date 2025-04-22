<script setup lang="ts">
// forward all attributes to the container
</script>

<template>
  <!-- Container takes sizing classes like h-10 w-auto -->
  <div class="overflow-hidden" v-bind="$attrs">
    <img
      src="@/assets/img/logos/ReproDisseny_negative.png"
      alt="Logo Repro Disseny, imprenta digital, impresión óffset y gran formato"
      class="h-full w-auto object-contain"
    />
  </div>
</template>
