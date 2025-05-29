<!-- components/forms/FormsProduct.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  producto: string
  formFields?: {
    label: string
    name: string
    type: 'text' | 'number' | 'select'
    required?: boolean
    options?: string[]
  }[]
}>()

const emit = defineEmits<{
  (e: 'submit', values: any): void
}>()

// Estado del formulario
const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  cantidad: 1,
  producto: props.producto,
  acepta: false
})

// Modales
const modalGracias = ref(false)
const modalAviso = ref(false)

// Envío del formulario
async function handleSubmit() {
  if (!form.value.acepta) {
    modalAviso.value = true
    return
  }

  try {
    const response = await fetch('/api/send-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const result = await response.json()

    if (result.status === 'ok') {
      modalGracias.value = true

      // Reset del formulario
      form.value = {
        nombre: '',
        email: '',
        telefono: '',
        cantidad: 1,
        producto: props.producto,
        acepta: false
      }

      // Opcional: emitir los datos a nivel de app
      emit('submit', result)
    } else {
      console.error('❌ Error en la respuesta:', result.message)
      alert('No se pudo enviar el formulario. Inténtalo de nuevo.')
    }
  } catch (error) {
    console.error('❌ Error al enviar los datos:', error)
    alert('Hubo un error al enviar tu solicitud. Revisa la consola.')
  }
}

</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Nombre -->
    <Input v-model="form.nombre" placeholder="Nombre" />

    <!-- Email -->
    <Input v-model="form.email" type="email" placeholder="Correo electrónico" />

    <!-- Teléfono -->
    <Input v-model="form.telefono" placeholder="Teléfono (opcional)" />

     <!-- Campos dinámicos -->
    <div v-if="props.formFields?.length" class="space-y-4">
      <div v-for="field in props.formFields" :key="field.name" class="relative">
        <Input
          v-if="field.type === 'text' || field.type === 'number'"
          v-model="form[field.name]"
          :type="field.type"
          :placeholder="field.label + (field.required ? ' *' : '')"
          class="pl-4"
        />
        <select
          v-else-if="field.type === 'select'"
          v-model="form[field.name]"
          :required="field.required"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option disabled value="">{{ field.label }}{{ field.required ? ' *' : '' }}</option>
          <option v-for="option in field.options" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <div v-else class="text-sm text-gray-500 italic">
      Este producto no tiene campos personalizados configurados.
    </div>

    <!-- Cantidad -->
    <Input v-model="form.cantidad" type="number" min="1" />

    <!-- Acepta términos -->
    <div class="flex items-start gap-2">
      <input
        id="acepta"
        type="checkbox"
        v-model="form.acepta"
        class="mt-1"
      />
      <label for="acepta" class="text-sm text-gray-700">
        He leído y acepto los
        <NuxtLink to="/terms" target="_blank" class="underline text-primary hover:text-primary/80">
          Términos y condiciones
        </NuxtLink>
      </label>
    </div>

    <!-- Botón enviar -->
    <div class="pt-4">
      <Button type="submit" class="w-full">Solicitar presupuesto</Button>
    </div>
  </form>

  <!-- Modales -->
  <FormsUiModalGracias
    :open="modalGracias"
    @close="modalGracias = false; router.push('/categorias')"
  />
  <FormsUiModalAvisoTerminos
    :open="modalAviso"
    @close="modalAviso = false"
  />
</template>
