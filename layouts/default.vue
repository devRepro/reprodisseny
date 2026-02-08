<!-- layouts/default.vue -->
<script setup lang="ts">
import { computed } from "vue";
import SiteFooter from "@/components/marketing/SiteFooter.vue";
import CategoriasMenu from "@/components/shared/menu/Categorias.vue";
import { useCategoriasNav } from "~/composables/useCategoriasNav";

// ✅ mega menú con productos limitados
const { data, pending, error } = await useCategoriasNav({
  mode: "nav",
  includeProducts: true,
  productLimit: 6,
});

const menuTree = computed(() => data.value?.tree ?? []);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <CategoriasMenu :tree="menuTree" :pending="pending" :error="error" />

    <div class="flex-1">
      <slot />
    </div>

    <SiteFooter />
  </div>
</template>
