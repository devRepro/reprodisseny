<script setup lang="ts">
import { NuxtLink } from '#components'
import { useRoute } from 'vue-router'
import { PhoneCall } from 'lucide-vue-next'

// Ruta actual para marcar el enlace activo
const route = useRoute()

const links = [
  {
    name: 'Teléfono',
    href: 'tel:+34932749890',
    icon: PhoneCall,
    label: '+34 93 274 98 90'
  },
  { name: 'Contacto', to: '/contacto' },
  { name: 'Novedades', to: '/novedades' },
  { name: 'Blog', to: '/blog' },
]

// Función para saber si el enlace está activo
const isActive = (to: string) => route.path === to
</script>

<template>
  <nav class="flex items-center space-x-5 text-sm">
    <template v-for="link in links" :key="link.name">
      
      <!-- Enlaces internos (NuxtLink) -->
      <NuxtLink
        v-if="link.to"
        :to="link.to"
        :aria-label="`Ir a ${link.name}`"
        :class="[
          'transition-colors duration-150 underline decoration-transparent underline-offset-4',
          'text-gray-400 hover:text-gray-800 hover:decoration-blue-600',
          { 'text-gray-800 decoration-blue-600': isActive(link.to) }
        ]"
      >
        {{ link.name }}
      </NuxtLink>

      <!-- Enlaces externos (teléfono) -->
      <a
        v-else
        :href="link.href"
        class="flex items-center gap-1 transition-colors duration-150 underline decoration-transparent underline-offset-4 text-gray-400 hover:text-gray-800 hover:decoration-blue-600"
        aria-label="Llamar por teléfono"
      >
        <component :is="link.icon" class="w-4 h-4 flex-shrink-0" />
        {{ link.label }}
      </a>

    </template>
  </nav>
</template>
