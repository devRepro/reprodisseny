<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


const router = useRouter()

const props = defineProps<{
  producto: string
}>()

const emit = defineEmits<{
  (e: 'submit', values: any): void
}>()

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  cantidad: 1,
  producto: props.producto,
  acepta: false,
})

const modalGracias = ref(false)
const modalAviso = ref(false)

function onSubmit() {
  if (!form.value.acepta) {
    modalAviso.value = true
    return
  }

  emit('submit', form.value)

  form.value = {
    nombre: '',
    email: '',
    telefono: '',
    cantidad: 1,
    producto: props.producto,
    acepta: false,
  }

  modalGracias.value = true
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <!-- Nombre -->
    <div>
      <Input v-model="form.nombre" placeholder="Nombre" />
    </div>

    <!-- Email -->
    <div>
      <Input v-model="form.email" placeholder="Correo electrónico" type="email" />
    </div>

    <!-- Teléfono -->
    <div>
      <Input v-model="form.telefono" placeholder="Teléfono (opcional)" />
    </div>

    <!-- Cantidad -->
    <div>
      <Input v-model="form.cantidad" type="number" min="1" />
    </div>

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

    <!-- Botón -->
    <div class="pt-4">
      <Button type="submit" class="w-full">Solicitar presupuesto</Button>
    </div>
  </form>
  <FormsUiModalGracias :open="modalGracias" @close="modalGracias = false; router.push('/categorias')" />
<FormsUiModalAvisoTerminos :open="modalAviso" @close="modalAviso = false" />

</template>
