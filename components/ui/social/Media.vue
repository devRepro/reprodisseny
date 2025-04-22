<script setup lang="ts">
import { Icon } from '#components'

// Define las redes sociales y sus respectivas URLs e iconos
const socialLinks = [
  {
    name: 'facebook',
    icon: 'lucide:facebook',
    url: 'https://www.facebook.com/YourPage',
    label: 'Facebook'
  },
  {
    name: 'instagram',
    icon: 'lucide:instagram',
    url: 'https://www.instagram.com/YourProfile',
    label: 'Instagram'
  },
  {
    name: 'twitter',
    icon: 'lucide:twitter',
    url: 'https://twitter.com/YourHandle',
    label: 'Twitter'
  },
  {
    name: 'linkedin',
    icon: 'lucide:linkedin',
    url: 'https://www.linkedin.com/company/YourCompany',
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
      class="hover:text-primary transition-colors"
      :aria-label="link.label"
    >
      <Icon :name="link.icon" class="h-5 w-5" />
    </a>
  </div>
</template>

<style scoped>
/* Ajustes opcionales: cambio de color al hover */
.icon:hover {
  color: theme('colors.primary.DEFAULT');
}
</style>