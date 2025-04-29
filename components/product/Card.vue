<template>
  <NuxtLink
    :to="`/categorias/${product.category}/${product.slug}`"∫
    class="block overflow-hidden rounded-xl bg-background shadow transition hover:shadow-lg"
  >
    <NuxtImg
      v-if="product.image"
      :src="product.image"
      :alt="product.alt || product.title"
      width="600"
      height="400"
      format="webp"
      class="w-full h-48 object-cover"
      loading="lazy"
    />

    <div class="p-4">
      <h3 class="text-lg font-semibold text-foreground">
        {{ product.title }}
      </h3>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ product.description }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: any
}>()
</script>
