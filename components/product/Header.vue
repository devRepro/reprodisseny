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
    const { data: response, error } = await useFetch('/api/sendLead', {
      method: 'POST',
      body: data
    })

    if (error.value) {
      console.error('Error enviando datos:', error.value)
    } else {
      console.log('Solicitud enviada:', data.value)
    }
  } catch (err) {
    console.error('Excepción al enviar datos:', err)
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