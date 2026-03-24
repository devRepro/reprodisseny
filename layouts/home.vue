<script setup lang="ts">
import SiteHeader from "@/components/layout/SiteHeader.vue";
import SiteFooter from "@/components/shared/footer/SiteFooter.vue";
import { useCategoriasNav } from "~/composables/useCategoriasNav";

const { tree: menuTree, pending: menuPending, error: menuError } = useCategoriasNav({
  productLimit: 6,
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <SiteHeader
      :menu-tree="menuTree"
      :menu-pending="menuPending"
      :menu-error="menuError"
      :show-menu="true"
    />

    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
