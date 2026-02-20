<!-- layouts/default.vue -->
<script setup lang="ts">
import { computed } from "vue";
import SiteHeader from "@/components/layout/SiteHeader.vue";
import SiteFooter from "@/components/shared/footer/SiteFooter.vue";
import { useCategoriasNav } from "~/composables/useCategoriasNav";

const { data, pending, error } = await useCategoriasNav({
  mode: "nav",
  includeProducts: true,
  productLimit: 6,
});

const menuTree = computed(() => data.value?.tree ?? []);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <SiteHeader :menu-tree="menuTree" :menu-pending="pending" :menu-error="error" />
    <div class="flex-1"><slot /></div>
    <SiteFooter />
  </div>
</template>
