<script setup lang="ts">
import { defineProps, ref } from 'vue'

// Props para imagen y título
const props = defineProps<{
  image: string
  alt?: string
  title: string
}>()

// Datos del formulario
const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  cantidad: 1
})

// Función submit
function submitRequest() {
  // Aquí puedes integrar tu lógica de envío (API, correo, etc.)
  console.log('Solicitud enviada:', form.value)
  // Resetea formulario o muestra mensaje de éxito
  alert('¡Solicitud de precio enviada! Nos pondremos en contacto contigo pronto.')
}
</script>

<template>
  <section class="flex flex-col md:flex-row items-start bg-white px-6 pt-6 pb-6 md:px-12 md:pt-8 md:pb-12">
    <!-- Imagen a la izquierda -->
    <div class="w-full md:w-1/3">
      <img
        :src="props.image"
        :alt="props.alt || props.title"
        class="w-full max-h-64 object-cover rounded-lg shadow-md"
      />
    </div>
    <!-- Título y formulario a la derecha -->
    <div class="w-full md:w-1/2 mt-6 md:mt-0 md:pl-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{{ props.title }}</h1>
      <form @submit.prevent="submitRequest" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            v-model="form.nombre"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            v-model="form.telefono"
            type="tel"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Cantidad</label>
          <input
            v-model="form.cantidad"
            type="number"
            min="1"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <button
          type="submit"
          class="w-full inline-flex justify-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark focus:outline-none"
        >
          Solicitar precio
        </button>
      </form>
    </div>
  </section>
</template>
