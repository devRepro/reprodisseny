<script setup lang="ts">

const props = defineProps<{
  image: string
  alt?: string
  title: string
  formFields?: FormField[]

}>()

// Aquí le pasas el título como nombre del producto
const producto = props.title

const submitRequest = async (data: any) => {
  try {
    // Enviar a SendGrid
    const { data: sendEmailResponse, error: sendEmailError } = await useFetch('/api/send-lead', {
      method: 'POST',
      body: data
    })

    if (sendEmailError.value || sendEmailResponse?.status === 'error') {
      console.error('❌ Error enviando correo:', sendEmailError.value || sendEmailResponse?.message)
    } else {
      console.log('✅ Correo enviado correctamente')
    }

    // Enviar a SharePoint
    const { data: spResponse, error: spError } = await useFetch('/api/add-lead', {
      method: 'POST',
      body: data
    })

    if (spError.value || spResponse?.status === 'error') {
      console.error('❌ Error guardando en SharePoint:', spError.value || spResponse?.message)
    } else {
      console.log('✅ Lead guardado en SharePoint. ID:', spResponse.itemId)
    }
  } catch (err) {
    console.error('❌ Error general al enviar solicitud:', err)
  }
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
