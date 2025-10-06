<!-- components/ui/menu/HeaderContacto.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PhoneCall } from 'lucide-vue-next'

const route = useRoute()

const links = [
  {
    name: 'Teléfono',
    href: 'tel:+34932749890',
    icon: PhoneCall,
    label: '+34 93 274 98 90'
  },
  { name: 'Contacto', to: '/contacto' },
  { name: 'Novedades', to: '/novedades' },
  { name: 'Blog', to: '/blog' },
]

const isActive = (to?: string) => to === route.path
</script>

<template>
  <nav class="flex items-center space-x-6 text-sm">
    <template v-for="link in links" :key="link.name">
      <!-- enlaces internos -->
      <NuxtLink
        v-if="link.to"
        :to="link.to"
        :class="[
          '!text-gray',                /* color gris claro inicial */
          '!no-underline',             /* sin subrayado por defecto */
          'transition-colors duration-150 underline-offset-4',
          'decoration-transparent',     /* subrayado transparente */
          'hover:!underline',          /* on-hover: subrayado */
          'hover:decoration-blue-600', /* on-hover: línea azul */
          'hover:!text-secondary-foreground', /* on-hover: texto gris oscuro */
          { 
            /* enlace activo */
            'text-secondary-foreground decoration-blue-600': isActive(link.to) 
          }
        ]"
      >
        {{ link.name }}
      </NuxtLink>

      <!-- enlaces externos (teléfono) -->
      <a
        v-else
        :href="link.href"
        class="flex items-center
               !text-gray !no-underline
               transition-colors duration-150 underline-offset-4
               decoration-transparent
               hover:!underline hover:decoration-blue-600 hover:!text-secondary-foreground"
      >
        <component :is="link.icon" class="mr-1 w-4 h-4 flex-shrink-0" />
        {{ link.label }}
      </a>
    </template>
  </nav>
</template>
