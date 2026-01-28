<template>
  <div>
    <SiteHeader :nav-items="navItems" />
    <slot />
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import SiteHeader from "@/components/marketing/SiteHeader.vue";
import SiteFooter from "@/components/marketing/SiteFooter.vue";
import { getNavItemsFromCategories } from "~/server/utils/catalogContent";

const { data: navItems } = await useAsyncData(
  "navItems",
  () => getNavItemsFromCategories(),
  {
    default: () => [],
  }
);
</script>
