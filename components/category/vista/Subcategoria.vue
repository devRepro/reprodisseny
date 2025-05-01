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
          {{ props.data.description || 'Próximamente más información sobre esta subcategoría.' }}
        </p>
      </template>
    </SharedHeaderSection>

    <div class="text-center text-muted-foreground py-10">
      Vista de subcategoría en desarrollo…
    </div>
  </section>
</template>
