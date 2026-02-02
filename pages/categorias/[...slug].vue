<script setup lang="ts">
import CategoryHero from "@/components/marketing/category/CategoryHero.vue";
import CategoryActionsGrid from "@/components/marketing/category/CategoryActionsGrid.vue";
import CategoryIntro from "@/components/marketing/category/CategoryIntro.vue";
import CategoryTabs from "@/components/marketing/category/CategoryTabs.vue";
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue";
import CategoryGuideCTA from "@/components/marketing/category/CategoryGuideCTA.vue";
import CategoryRelatedWorks from "@/components/marketing/category/CategoryRelatedWorks.vue";

const route = useRoute();
const slug = route.params.slug;

const { data } = await useAsyncData(
  () => `cat:${leafSlug.value}`,
  () => $fetch(`/api/cms/category/${leafSlug.value}`),
  { server: true }
);
</script>

<template>
  <main>
    <CategoryHero :category="category" />
    <CategoryActionsGrid :items="category?.actions || []" />
    <CategoryIntro :category="category" />
    <CategoryTabs :tabs="category?.tabs || []" />
    <CategoryFaq :items="category?.faq || []" />
    <CategoryGuideCTA />
    <CategoryRelatedWorks :items="category?.relatedWorks || []" />
  </main>
</template>
