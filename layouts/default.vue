<template>
  <div>
    <SiteHeader :nav-items="menuTree" />
    <slot />
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import SiteFooter from "@/components/marketing/SiteFooter.vue"


const { data } = await useAsyncData("megaMenu", () =>
  $fetch("/api/cms/catalog?mode=nav")
)

const menuTree = computed(() => data.value?.tree ?? [])

</script>
