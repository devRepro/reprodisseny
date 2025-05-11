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
      <!--Cargamos formulario -->
      <FormsProductForms :producto="producto" :formFields="props.formFields" @submit="submitRequest" />

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