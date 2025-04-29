<template>
<NuxtLink
  v-if="cta"
  :to="cta.link"
  class="inline-block mt-4 rounded-lg bg-primary-700 px-6 py-3.5 text-center font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
>
  {{ cta.label }}
</NuxtLink>
</template>
<script setup lang="ts">
    const props = defineProps({
        title: String,
        description: String,
        link: String,
        image: String,
        alt: String,
        structuredData: Object,
        cta: {
            type: Object as PropType<{ label: string, link: string }>,
            required: false
        }
})

</script>
