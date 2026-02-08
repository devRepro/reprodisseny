<script setup lang="ts">
import { reactive, computed } from "vue";
import { useRoute } from "#imports";

const props = withDefaults(
  defineProps<{
    title: string;
    product: string; // slug
    categorySlug?: string; // ✅ pásalo desde la página (mejor)
    headerFile?: string;
    alt?: string;
  }>(),
  {
    headerFile: "header.webp",
    alt: "",
    categorySlug: "",
  }
);

const route = useRoute();

const headerImage = computed(() => `/img/productos/${props.product}/${props.headerFile}`);
const alt = computed(() => props.alt || props.title);

// Estado del formulario (mínimo)
const form = reactive({
  website: "", // ✅ honeypot (debe ir vacío)
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  cantidad: 1,
  comentario: "",
  consent: false, // ✅ requerido por el endpoint moderno
});

const isLoading = reactive({ v: false });
const errorMsg = reactive<{ v: string | null }>({ v: null });
const successMsg = reactive<{ v: boolean }>({ v: false });

async function submitRequest() {
  errorMsg.v = null;
  successMsg.v = false;
  isLoading.v = true;
  try {
    const payload = {
      website: form.website, // honeypot

      name: form.nombre,
      email: form.email,
      phone: form.telefono || null,
      company: form.empresa || null,
      message: form.comentario?.trim()
        ? `Cantidad: ${form.cantidad}\n\n${form.comentario.trim()}`
        : `Cantidad: ${form.cantidad}`,

      categorySlug: props.categorySlug || "",

      product: {
        name: props.title,
        slug: props.product,
        url: route.fullPath,
      },

      extras: {
        cantidad: form.cantidad,
      },

      consent: form.consent,
      sourceUrl: process.client ? location.href : route.fullPath,
      utm: route.query ?? null,
    };

    await $fetch("/api/price-requests", {
      method: "POST",
      body: payload,
    });

    successMsg.v = true;

    // reset
    form.website = "";
    form.nombre = "";
    form.email = "";
    form.telefono = "";
    form.empresa = "";
    form.cantidad = 1;
    form.comentario = "";
    form.consent = false;
  } catch (e: any) {
    errorMsg.v = e?.data?.statusMessage || e?.message || "Error al enviar";
  } finally {
    isLoading.v = false;
  }
}
</script>

<template>
  <SharedHeaderSection :image="headerImage" :alt="alt" :title="title">
    <p class="text-muted-foreground">
      Completa el formulario para solicitar tu presupuesto sin compromiso.
    </p>

    <form @submit.prevent="submitRequest" class="space-y-4 mt-4" novalidate>
      <!-- Honeypot invisible -->
      <input
        v-model="form.website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        class="hidden"
      />

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
        <Label for="empresa">Empresa</Label>
        <Input
          id="empresa"
          name="empresa"
          v-model="form.empresa"
          placeholder="Empresa (opcional)"
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

      <div class="space-y-1">
        <Label for="comentario">Detalles</Label>
        <Textarea
          id="comentario"
          name="comentario"
          rows="4"
          v-model="form.comentario"
          placeholder="Medidas, materiales, plazos, etc."
        />
      </div>

      <div class="flex items-start gap-2">
        <input
          id="consent"
          type="checkbox"
          v-model="form.consent"
          class="mt-1 h-4 w-4 rounded border"
        />
        <label for="consent" class="text-sm text-muted-foreground">
          He leído y acepto la política de privacidad.
        </label>
      </div>

      <Button type="submit" class="w-full" :disabled="isLoading.v || !form.consent">
        {{ isLoading.v ? "Enviando…" : "Solicitar presupuesto" }}
      </Button>

      <p v-if="errorMsg.v" class="text-sm text-destructive">{{ errorMsg.v }}</p>
      <p v-if="successMsg.v" class="text-sm text-emerald-600">
        Solicitud enviada correctamente.
      </p>
    </form>
  </SharedHeaderSection>
</template>
