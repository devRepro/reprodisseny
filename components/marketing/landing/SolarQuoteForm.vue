<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "#imports";
import AppButton from "@/components/shared/button/AppButton.vue";
import { cn } from "@/lib/utils";
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
  message: string;
  privacy: boolean;
};

type ValidationField = "name" | "email" | "phone" | "privacy" | null;

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
  },
);

const route = useRoute();
const { sendPriceRequest, isLoading, error } = usePriceRequests();

const success = ref(false);
const validationError = ref("");
const validationField = ref<ValidationField>(null);

const form = reactive<QuoteForm>({
  website: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  spaceType: "",
  glassSurface: "",
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

function cleanString(value: string) {
  return String(value || "").trim();
}

function resetForm() {
  form.website = "";
  form.name = "";
  form.company = "";
  form.email = "";
  form.phone = "";
  form.spaceType = "";
  form.glassSurface = "";
  form.message = "";
  form.privacy = false;
  validationError.value = "";
  validationField.value = null;
}

function handleResetSuccessState() {
  success.value = false;
  resetForm();
}

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(cleanString(value));
}

function setValidationError(field: ValidationField, message: string) {
  validationField.value = field;
  validationError.value = message;
}

function controlClass(field?: ValidationField) {
  return cn("rd-form-control", validationField.value === field && "rd-form-control--error");
}

function checkPanelClass(field?: ValidationField) {
  return cn("rd-form-check-panel", validationField.value === field && "rd-form-check-panel--error");
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
  validationField.value = null;
  error.value = null;

  const name = cleanString(form.name);
  const company = cleanString(form.company);
  const email = cleanString(form.email);
  const phone = cleanString(form.phone);
  const spaceType = cleanString(form.spaceType);
  const glassSurface = cleanString(form.glassSurface);
  const message = cleanString(form.message);

  if (cleanString(form.website)) {
    success.value = true;
    return;
  }

  if (!name) {
    setValidationError("name", "Indica tu nombre.");
    return;
  }

  if (!isValidEmail(email)) {
    setValidationError("email", "Introduce un email válido.");
    return;
  }

  if (!phone || phone.length < 9) {
    setValidationError("phone", "Introduce un teléfono válido.");
    return;
  }

  if (!form.privacy) {
    setValidationError("privacy", "Debes aceptar la política de privacidad.");
    return;
  }

  const fallbackMessage = [
    "Solicitud de presupuesto para láminas solares.",
    `Tipo de espacio: ${spaceType || "sin indicar"}.`,
    `Superficie aproximada: ${glassSurface || "sin indicar"}.`,
  ].join(" ");

  const response = await sendPriceRequest(
    {
      website: null,
      name,
      email,
      phone,
      company: company || null,
      message: message || fallbackMessage,
      categorySlug: props.categorySlug,
      product: {
        name: props.productName,
        slug: props.productSlug,
        sku: null,
        url: sourceUrl.value,
      },
      extras: {
        landing: "laminas-solares",
        spaceType: spaceType || null,
        glassSurface: glassSurface || null,
      },
      consent: true,
      sourceUrl: sourceUrl.value,
      utm: utm.value,
      initialStatus: "Nova",
    },
    { file: null, fileKind: "design" },
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

    if (!result?.duplicated) {
      pushLeadEvent(transactionId);
    }

    success.value = true;
    resetForm();
  }
}
</script>
<template>
  <div class="rd-form-frame mx-auto max-w-xl">
    <RequestSuccessState
      v-if="success"
      :product-name="props.productName"
      title="Solicitud enviada correctamente"
      primary-to="/"
      @reset="handleResetSuccessState"
    />

    <form
      v-else
      class="rd-form-shell"
      novalidate
      @submit.prevent="onSubmit"
    >
      <div class="rd-form-body">
        <div class="rd-form-stack">
          <div
            v-if="errorMessage"
            class="rd-form-alert rd-form-alert--destructive"
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

          <label class="rd-form-field">
            <span class="rd-form-label">
              Nombre <span class="rd-form-required">*</span>
            </span>

            <input
              v-model="form.name"
              name="name"
              type="text"
              autocomplete="name"
              required
              :class="controlClass('name')"
            />
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              Empresa <span class="rd-form-inline-note">(Opcional)</span>
            </span>

            <input
              v-model="form.company"
              name="company"
              type="text"
              autocomplete="organization"
              class="rd-form-control"
            />
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              Email <span class="rd-form-required">*</span>
            </span>

            <input
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              :class="controlClass('email')"
            />
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              Teléfono <span class="rd-form-required">*</span>
            </span>

            <input
              v-model="form.phone"
              name="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              required
              :class="controlClass('phone')"
            />
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              Tipo de espacio <span class="rd-form-inline-note">(Opcional)</span>
            </span>

            <select
              v-model="form.spaceType"
              name="spaceType"
              class="rd-form-control"
            >
              <option value="">Selecciona una opción</option>
              <option value="oficina">Oficina</option>
              <option value="comercio-escaparate">Comercio / escaparate</option>
              <option value="hotel-restaurante">Hotel / restaurante</option>
              <option value="vivienda">Vivienda</option>
              <option value="otro">Otro</option>
            </select>
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              Superficie aproximada en m²
              <span class="rd-form-inline-note">(Opcional)</span>
            </span>

            <input
              v-model="form.glassSurface"
              name="glassSurface"
              type="text"
              inputmode="decimal"
              placeholder="Ej. 12 m²"
              class="rd-form-control"
            />
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              Mensaje <span class="rd-form-inline-note">(Opcional)</span>
            </span>

            <textarea
              v-model="form.message"
              name="message"
              rows="5"
              placeholder="Cuéntanos qué necesitas proteger del sol o del calor."
              class="rd-form-textarea"
            />
          </label>

          <p class="rd-form-help-text">
            Los campos marcados con <span class="rd-form-required">*</span> son obligatorios.
          </p>

          <label :class="checkPanelClass('privacy')">
            <input
              v-model="form.privacy"
              type="checkbox"
              required
              class="rd-form-checkbox"
            />

            <span class="rd-form-privacy-text">
              He leído y acepto la
              <NuxtLink
                to="/politica-privacidad"
                target="_blank"
                class="rd-form-link"
              >
                política de privacidad
              </NuxtLink>.
            </span>
          </label>
        </div>
      </div>

      <div class="rd-form-footer">
        <AppButton
          type="submit"
          :disabled="isLoading"
          :loading="isLoading"
          size="lg"
          block
        >
          {{ isLoading ? "Enviando..." : "Solicitar presupuesto" }}
        </AppButton>
      </div>
    </form>
  </div>
</template>
