<template>
    <!-- Botón con NuxtLink -->
    <NuxtLink 
      v-if="to"
      :to="to" 
      class="bg-black text-white rounded px-4 py-2 transition-all duration-300 hover:bg-gray-800 hover:shadow-md"
      :class="customClass"
    >
      {{ text }}
    </NuxtLink>
  
    <!-- Alternativa: botón con @click si NuxtLink no funciona -->
    <button 
      v-else 
      @click="goToPage"
      class="bg-black text-white rounded px-4 py-2 transition-all duration-300 hover:bg-gray-800 hover:shadow-md"
      :class="customClass"
    >
      {{ text }}
    </button>
  </template>
  
  <script setup lang="ts">
  import { navigateTo } from '#app'
  
  // Definimos props correctamente
  const props = defineProps({
    text: { type: String, required: true },
    to: { type: String, required: false, default: '' }, // Permitimos que sea opcional
    customClass: { type: String, default: '' }
  })
  
  // Función alternativa en caso de que `NuxtLink` no funcione
  const goToPage = () => {
    if (props.to) {
      navigateTo(props.to)
    }
  }
  </script>