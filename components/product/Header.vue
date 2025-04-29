<script setup lang="ts">
import { defineProps, ref } from 'vue'

const props = defineProps<{
  image: string
  alt?: string
  title: string
}>()

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  cantidad: 1
})

function submitRequest() {
  console.log('Solicitud enviada:', form.value)
  alert('¡Gracias! Te contactaremos en breve con más información.')
}
</script>

<template>
  <section class="bg-white text-gray-800 py-12 px-6 md:px-20 flex flex-col md:flex-row items-start gap-10">
    <!-- Imagen -->
    <figure class="w-full md:w-1/2">
      <img
        :src="props.image"
        :alt="props.alt || `Imagen de ${props.title}`"
        class="rounded-xl shadow-lg w-full h-auto object-cover"
        loading="lazy"
        decoding="async"
      />
      <figcaption class="sr-only">{{ props.title }}</figcaption>
    </figure>

    <!-- Contenido -->
    <div class="w-full md:w-1/2">
      <header class="mb-6">
        <h1 class="text-3xl md:text-4xl font-bold leading-tight">{{ props.title }}</h1>
        <p class="text-gray-600 mt-2 text-lg">Solicita tu presupuesto personalizado en segundos.</p>
      </header>

      <form @submit.prevent="submitRequest" class="space-y-5" novalidate>
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            v-model="form.nombre"
            name="nombre"
            id="nombre"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            v-model="form.email"
            name="email"
            id="email"
            type="email"
            required
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
          <input
            v-model="form.telefono"
            name="telefono"
            id="telefono"
            type="tel"
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
            placeholder="+34 600 000 000"
          />
        </div>

        <div>
          <label for="cantidad" class="block text-sm font-medium text-gray-700">Cantidad</label>
          <input
            v-model="form.cantidad"
            name="cantidad"
            id="cantidad"
            type="number"
            min="1"
            required
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>

        <button
          type="submit"
          class="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition duration-200"
        >
          Solicitar presupuesto
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
/* Puedes definir colores aquí o en tu tailwind.config.js */
.bg-primary {
  background-color: #2563eb; /* azul Tailwind */
}
.bg-primary-dark {
  background-color: #1e40af;
}
</style>
