<script setup lang="ts">

const props = withDefaults(defineProps<{
  image: string
  alt?: string
  title: string
  description?: string
  ctaText?: string
  ctaLink?: string
}>(), {
  alt: '',
  description: '',
  ctaText: 'Descubre más ventajas',
  ctaLink: '#'
})
</script>

<template>
  <SharedHeaderSection :image="props.image" :alt="props.alt" :title="props.title">
    <p v-if="props.description" class="text-lg text-muted-foreground">{{ props.description }}</p>
    <NuxtLink
      :to="props.ctaLink"
      class="inline-block mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition"
    >
      {{ props.ctaText }}
    </NuxtLink>
  </SharedHeaderSection>
</template>
