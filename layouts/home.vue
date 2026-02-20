<!-- layouts/home.vue -->
<script setup lang="ts">
import { computed, provide } from "vue";
import SiteHeader from "@/components/layout/SiteHeader.vue";
import SiteFooter from "@/components/shared/footer/SiteFooter.vue";
import { useCategoriasNav } from "~/composables/useCategoriasNav";

const { data, pending, error } = await useCategoriasNav({
  mode: "nav",
  includeProducts: true,
  productLimit: 6,
});

const menuTree = computed(() => data.value?.tree ?? []);

// ✅ Proveemos refs (y el árbol computed) en un solo objeto
provide("navMenu", {
  tree: menuTree, // ComputedRef<CategoriaNode[]>
  pending, // Ref<boolean>
  error, // Ref<unknown>
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <SiteHeader
      :menu-tree="menuTree"
      :menu-pending="pending"
      :menu-error="error"
      :show-menu="false"
    />

    <div class="flex-1">
      <slot />
    </div>

    <SiteFooter />
  </div>
</template>
