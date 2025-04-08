<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <!-- Campos personalizados del producto -->
    <div v-for="field in producto?.formFields || []" :key="field.name">
      <label :for="field.name" class="block font-semibold text-gray-700">{{ field.label }}</label>

      <input
        v-if="field.type === 'text'"
        type="text"
        :id="field.name"
        v-model="form[field.name]"
        class="input"
        :required="field.required"
      />

      <input
        v-else-if="field.type === 'number'"
        type="number"
        :id="field.name"
        v-model="form[field.name]"
        class="input"
        :required="field.required"
      />

      <select
        v-else-if="field.type === 'select'"
        :id="field.name"
        v-model="form[field.name]"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200"
        :required="field.required"
      >
        <option disabled value="">Selecciona una opción</option>
        <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
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
      class="input"
      rows="3"
    ></textarea>

    <button type="submit" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark">
      Enviar solicitud
    </button>
  </form>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Recibir props del producto
const props = defineProps<{ producto: any }>()

const form = ref<Record<string, any>>({
  nombre: '',
  email: '',
  comentarios: ''
})

// ✅ Cargar los campos dinámicos del producto al detectar cambios
watch(
  () => props.producto?.formFields,
  (fields) => {
    if (fields && Array.isArray(fields)) {
      for (const field of fields) {
        if (!(field.name in form.value)) {
          form.value[field.name] = field.type === 'select' ? '' : ''
        }
      }
    }
  },
  { immediate: true } // importante para que también lo haga la primera vez
)

function submitForm() {
  console.log('Formulario enviado:', form.value)
}
</script>

<style scoped lang="scss">


</style>

