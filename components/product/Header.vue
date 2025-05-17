<script setup lang="ts">
<<<<<<< HEAD
import { ref, defineProps } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
=======

>>>>>>> bussines

const props = defineProps<{
  image: string
  alt?: string
  title: string
  formFields?: FormField[]

}>()

// Aquí le pasas el título como nombre del producto
const producto = props.title

function submitRequest() {
  console.log('🧾 Solicitud enviada:', form.value)
  alert('✅ Gracias por tu solicitud. Te contactaremos pronto.')
}

</script>

<template>
  <SharedHeaderSection :image="props.image" :alt="props.alt" :title="props.title">
    <p class="text-muted-foreground">Completa el formulario para solicitar tu presupuesto sin compromiso.</p>

    <form @submit.prevent="submitRequest" class="space-y-4">
      <div class="space-y-1">
        <Label for="nombre">Nombre completo</Label>
        <Input id="nombre" name="nombre" v-model="form.nombre" required placeholder="Tu nombre" />
      </div>

      <div class="space-y-1">
        <Label for="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" v-model="form.email" required placeholder="tucorreo@ejemplo.com" />
      </div>

      <div class="space-y-1">
        <Label for="telefono">Teléfono</Label>
        <Input id="telefono" name="telefono" type="tel" v-model="form.telefono" placeholder="+34 600 000 000" />
      </div>

      <div class="space-y-1">
        <Label for="cantidad">Cantidad</Label>
        <Input id="cantidad" name="cantidad" type="number" min="1" v-model="form.cantidad" />
      </div>

      <Button type="submit" class="w-full">Solicitar presupuesto</Button>
    </form>
  </SharedHeaderSection>
</template>
