<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <!-- Mostrar campos dinámicos -->
    <div v-for="(options, label) in variantes" :key="label">
      <label :for="label" class="block font-semibold text-gray-700">{{ label }}</label>
      <select
        :id="label"
        v-model="form[label]"
        class="w-full border border-gray-300 rounded-lg px-4 py-2"
      >
        <option disabled value="">Selecciona una opción</option>
        <option v-for="option in options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>

    <!-- Datos del cliente -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" v-model="form.nombre" placeholder="Tu nombre" required class="input" />
      <input type="email" v-model="form.email" placeholder="Tu email" required class="input" />
    </div>

    <textarea
      v-model="form.comentarios"
      placeholder="Comentarios adicionales"
      class="w-full border border-gray-300 rounded-lg px-4 py-2"
      rows="3"
    ></textarea>

    <button type="submit" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark">
      Enviar solicitud
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const form = ref<any>({
  nombre: '',
  email: '',
  comentarios: ''
})

const variantes = ref<Record<string, string[]>>({})

watchEffect(async () => {
  const categoria = route.params.category
  const producto = route.params.product

  try {
    const json = await import(`~/data/opciones/${categoria}.json`)
    variantes.value = json.default?.[producto] || {}
  } catch (e) {
    variantes.value = {}
  }

  // Inicializa los selects
  for (const key of Object.keys(variantes.value)) {
    if (!(key in form.value)) {
      form.value[key] = ''
    }
  }
})

function submitForm() {
  // Aquí podrías enviar el formulario por email, a Netlify, Formspree, etc.
  console.log('Formulario enviado:', form.value)
}
</script>

<style scoped>
.input {
  @apply w-full border border-gray-300 rounded-lg px-4 py-2;
}
</style>
