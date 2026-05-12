<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "#imports";
import { Loader2 } from "lucide-vue-next";
import RequestSuccessState from "@/components/marketing/quote/RequestSuccessState.vue";
import { usePriceRequests } from "@/composables/usePriceRequests";

type QuoteForm = {
  website: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  spaceType: string;
  glassSurface: string;
  problem: string;
  message: string;
  privacy: boolean;
};

const props = withDefaults(
  defineProps<{
    productName?: string;
    productSlug?: string;
    categorySlug?: string;
  }>(),
  {
    productName: "Láminas solares para cristales",
    productSlug: "laminas-solares",
    categorySlug: "gran-formato",
  }
);

const route = useRoute();
const { sendPriceRequest, isLoading, error } = usePriceRequests();

const success = ref(false);
const validationError = ref("");
const submittedReference = ref<string | null>(null);

const form = reactive<QuoteForm>({
  website: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  spaceType: "",
  glassSurface: "",
  problem: "",
  message: "",
  privacy: false,
});

const sourceUrl = computed(() => {
  const value = import.meta.client ? window.location.href : route.fullPath || "/";
  return String(value).slice(0, 300);
});

const utm = computed(() => {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(route.query || {})) {
    if (!key.toLowerCase().startsWith("utm_")) continue;
    out[key] = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
  }

  return Object.keys(out).length ? out : null;
});

const errorMessage = computed(() => {
  if (validationError.value) return validationError.value;
  if (!error.value) return "";
  return typeof error.value === "string"
    ? error.value
    : "No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al +34 932 749 890.";
});

function resetForm() {
  form.website = "";
  form.name = "";
  form.company = "";
  form.email = "";
  form.phone = "";
  form.spaceType = "";
  form.glassSurface = "";
  form.problem = "";
  form.message = "";
  form.privacy = false;
  validationError.value = "";
  submittedReference.value = null;
}

function handleResetSuccessState() {
  success.value = false;
  resetForm();
}

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

function pushLeadEvent(transactionId?: string | number | null) {
  if (!import.meta.client) return;

  const win = window as Window & { dataLayer?: Record<string, unknown>[] };
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({
    event: "generate_lead",
    form_name: "landing_laminas_solares",
    lead_type: "quote_request",
    page_path: window.location.pathname,
    category_slug: props.categorySlug,
    product_slug: props.productSlug,
    product_name: props.productName,
    transaction_id: transactionId ? String(transactionId) : undefined,
  });
}

async function onSubmit() {
  validationError.value = "";
  error.value = null;

  if (form.website.trim()) {
    success.value = true;
    return;
  }

  if (!form.name.trim()) {
    validationError.value = "Indica tu nombre.";
    return;
  }

  if (!isValidEmail(form.email)) {
    validationError.value = "Introduce un email válido.";
    return;
  }

  if (!form.phone.trim() || form.phone.trim().length < 9) {
    validationError.value = "Introduce un teléfono válido.";
    return;
  }

  if (!form.privacy) {
    validationError.value = "Debes aceptar la política de privacidad.";
    return;
  }

  const fallbackMessage = [
    "Solicitud de presupuesto para láminas solares.",
    `Tipo de espacio: ${form.spaceType || "sin indicar"}.`,
    `Superficie aproximada: ${form.glassSurface || "sin indicar"}.`,
    `Problema principal: ${form.problem || "sin indicar"}.`,
  ].join(" ");

  const response = await sendPriceRequest(
    {
      website: null,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim() || null,
      message: form.message.trim() || fallbackMessage,
      categorySlug: props.categorySlug,
      product: {
        name: props.productName,
        slug: props.productSlug,
        sku: null,
        url: sourceUrl.value,
      },
      extras: {
        landing: "laminas-solares",
        spaceType: form.spaceType || null,
        glassSurface: form.glassSurface || null,
        problem: form.problem || null,
      },
      consent: true,
      sourceUrl: sourceUrl.value,
      utm: utm.value,
      initialStatus: "Nova",
    },
    { file: null, fileKind: "design" }
  );

  const result = response as {
    ok?: boolean;
    duplicated?: boolean;
    itemId?: string | number | null;
    requestKey?: string | null;
    reference?: string | null;
    requestId?: string | null;
    id?: string | number | null;
  } | null;

  if (!error.value) {
    const transactionId =
      result?.reference ||
      result?.requestId ||
      result?.id ||
      result?.itemId ||
      result?.requestKey ||
      null;

    submittedReference.value = transactionId ? String(transactionId) : null;

    if (!result?.duplicated) {
      pushLeadEvent(transactionId);
    }

    success.value = true;
    resetForm();
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[460px]">
    <RequestSuccessState
      v-if="success"
      :product-name="props.productName"
      title="Solicitud enviada correctamente"
      primary-to="/"
      @reset="handleResetSuccessState"
    />

    <form v-else class="space-y-3" novalidate @submit.prevent="onSubmit">
      <div
        v-if="errorMessage"
        class="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
      >
        {{ errorMessage }}
      </div>

      <input
        v-model="form.website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        class="hidden"
        aria-hidden="true"
      />

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">Nombre *</span>
        <input
          v-model="form.name"
          name="name"
          type="text"
          autocomplete="name"
          class="h-8 w-full rounded-[4px] border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">Empresa</span>
        <input
          v-model="form.company"
          name="company"
          type="text"
          autocomplete="organization"
          class="h-8 w-full rounded-[4px] border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">Email *</span>
        <input
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          class="h-8 w-full rounded-[4px] border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">Teléfono *</span>
        <input
          v-model="form.phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          class="h-8 w-full rounded-[4px] border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">Tipo de espacio</span>
        <select
          v-model="form.spaceType"
          name="spaceType"
          class="h-8 w-full rounded-[4px] border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">Selecciona una opción</option>
          <option value="oficina">Oficina</option>
          <option value="comercio-escaparate">Comercio / escaparate</option>
          <option value="hotel-restaurante">Hotel / restaurante</option>
          <option value="vivienda">Vivienda</option>
          <option value="otro">Otro</option>
        </select>
      </label>

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">Superficie aproximada en m²</span>
        <input
          v-model="form.glassSurface"
          name="glassSurface"
          type="text"
          inputmode="decimal"
          placeholder="Ej. 12 m²"
          class="h-8 w-full rounded-[4px] border border-border bg-white px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">¿Qué problema quieres resolver?</span>
        <select
          v-model="form.problem"
          name="problem"
          class="h-8 w-full rounded-[4px] border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">Selecciona una opción</option>
          <option value="calor-excesivo">Calor excesivo</option>
          <option value="reflejos-pantallas">Reflejos en pantallas</option>
          <option value="proteccion-uv">Protección UV</option>
          <option value="privacidad">Privacidad</option>
          <option value="varios">Varios problemas</option>
        </select>
      </label>

      <label class="block">
        <span class="mb-1 block text-[13px] font-medium text-foreground">Mensaje</span>
        <textarea
          v-model="form.message"
          name="message"
          rows="5"
          class="w-full resize-y rounded-[4px] border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="flex items-start gap-2 pt-1 text-[11px] leading-4 text-foreground/75">
        <input
          v-model="form.privacy"
          type="checkbox"
          class="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border text-primary focus:ring-primary/20"
        />
        <span>
          He leído y acepto la
          <NuxtLink
            to="/politica-privacidad"
            target="_blank"
            class="font-semibold text-primary hover:underline"
          >
            política de privacidad </NuxtLink
          >.
        </span>
      </label>

      <button
        type="submit"
        :disabled="isLoading"
        class="inline-flex h-10 w-full items-center justify-center rounded-[6px] bg-primary px-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        {{ isLoading ? "Enviando..." : "Solicitar presupuesto" }}
      </button>
    </form>
  </div>
</template>
