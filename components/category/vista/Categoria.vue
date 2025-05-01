<script setup lang="ts">
import type { Categoria } from '@/types'
import { resolveImageUrl } from '@/utils/images'

const props = defineProps<{ data: Categoria }>()

const imageUrl = resolveImageUrl(props.data.image, props.data.type)
const altText = props.data.alt || props.data.title
</script>

<template>
  <section>
    <SharedHeaderSection
      :title="props.data.title"
      :alt="altText"
      :image="imageUrl"
    >
      <template #right>
        <p class="text-lg text-muted-foreground">
          {{ props.data.description }}
        </p>
        <NuxtLink
          to="#productos"
          class="inline-block mt-4 px-6 py-3 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Ver productos
        </NuxtLink>
      </template>
    </SharedHeaderSection>
  </section>
</template>

