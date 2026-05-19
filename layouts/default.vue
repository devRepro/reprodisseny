<script setup lang="ts">
import SiteHeader from "@/components/layout/SiteHeader.vue";
import SiteFooter from "@/components/shared/footer/SiteFooter.vue";
import SolarFilmPromo from "@/components/marketing/promo/SolarFilmPromo.vue";
import { useCategoriasNav } from "~/composables/useCategoriasNav";

const { tree, pending, error } = await useCategoriasNav({
  includeProducts: true,
  productLimit: 6,
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <SiteHeader :menu-tree="tree" :menu-pending="pending" :menu-error="error" />
    <div class="flex-1">
      <slot />
    </div>
    <SiteFooter />
    <SolarFilmPromo />
  </div>
</template>
