<script setup lang="ts">
import { Icon } from '#components'

// Define las redes sociales y sus respectivas URLs e iconos
const socialLinks = [
  {
    name: 'instagram',
    icon: 'lucide:instagram',
    url: 'https://www.instagram.com/reprodissenybcn/?hl=es',
    label: 'Instagram'
  },
  {
    name: 'linkedin',
    icon: 'lucide:linkedin',
    url: 'https://es.linkedin.com/company/repro-disseny-s.l',
    label: 'LinkedIn'
  }
]
</script>

<template>
  <div class="flex space-x-4">
    <a
      v-for="link in socialLinks"
      :key="link.name"
      :href="link.url"
      target="_blank"
      rel="noopener noreferrer"
      class="text-white hover:text-primary transition-colors"
      :aria-label="link.label"
    >
      <Icon :name="link.icon" class="h-5 w-5" />
    </a>
  </div>
</template>
