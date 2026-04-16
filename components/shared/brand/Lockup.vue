<script setup lang="ts">
import SharedLogo from "@/components/shared/logo/Logo.vue";

const props = withDefaults(
  defineProps<{
    tagline?: string;
    showTagline?: boolean;
  }>(),
  {
    tagline: "Hacemos posible la comunicación gráfica.",
    showTagline: true,
  }
);
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <SharedLogo class="h-7 w-auto md:h-9 lg:h-10" />

    <p
      v-if="props.showTagline"
      class="hidden xl:block text-[11px] leading-4 text-slate-500 max-w-[16rem]"
    >
      <!--{{ props.tagline }}-->
    </p>
  </div>
</template>
