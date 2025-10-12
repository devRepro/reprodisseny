<script setup lang="ts">
import { reactive, computed } from "vue";

// Props del contenedor
const props = withDefaults(
  defineProps<{
    title: string; // Título visible
    product: string; // Carpeta en /public/img/productos/<product> (slug)
    headerFile?: string; // Archivo dentro de esa carpeta (por defecto 'header.webp')
    alt?: string;
  }>(),
  {
    headerFile: "header.webp",
    alt: "",
  }
);

// Ruta absoluta a la imagen del header
const headerImage = computed(() => `/img/productos/${props.product}/${props.headerFile}`);
const alt = computed(() => props.alt || props.title);

// Estado del formulario
const form = reactive({
  nombre: "",
  email: "",
  telefono: "",
  cantidad: 1,
  producto: props.title, // útil para el lead
});

const submitRequest = async () => {
  try {
    // 1) SendGrid
    const { data: sendEmailResponse, error: sendEmailError } = await useFetch(
      "/api/send-lead",
      {
        method: "POST",
        body: { ...form },
      }
    );
    if (sendEmailError.value || sendEmailResponse?.value?.status === "error") {
      console.error(
        "❌ Error correo:",
        sendEmailError.value || sendEmailResponse?.value?.message
      );
    } else {
      console.log("✅ Correo enviado");
    }

    // 2) SharePoint
    const { data: spResponse, error: spError } = await useFetch("/api/add-lead", {
      method: "POST",
      body: { ...form },
    });
    if (spError.value || spResponse?.value?.status === "error") {
      console.error("❌ Error SharePoint:", spError.value || spResponse?.value?.message);
    } else {
      console.log("✅ Lead guardado. ID:", spResponse.value?.itemId);
    }
  } catch (err) {
    console.error("❌ Error general:", err);
  }
};
</script>

<template>
  <!-- Tu componente de header que pinta la imagen -->
  <SharedHeaderSection :image="headerImage" :alt="alt" :title="title">
    <p class="text-muted-foreground">
      Completa el formulario para solicitar tu presupuesto sin compromiso.
    </p>

    <form @submit.prevent="submitRequest" class="space-y-4 mt-4">
      <div class="space-y-1">
        <Label for="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          name="nombre"
          v-model="form.nombre"
          required
          placeholder="Tu nombre"
        />
      </div>

      <div class="space-y-1">
        <Label for="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          v-model="form.email"
          required
          placeholder="tucorreo@ejemplo.com"
        />
      </div>

      <div class="space-y-1">
        <Label for="telefono">Teléfono</Label>
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          v-model="form.telefono"
          placeholder="+34 600 000 000"
        />
      </div>

      <div class="space-y-1">
        <Label for="cantidad">Cantidad</Label>
        <Input
          id="cantidad"
          name="cantidad"
          type="number"
          min="1"
          v-model.number="form.cantidad"
        />
      </div>

      <Button type="submit" class="w-full">Solicitar presupuesto</Button>
    </form>
  </SharedHeaderSection>
</template>
