<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "#imports";
import { Loader2 } from "lucide-vue-next";
import RequestSuccessState from "@/components/marketing/quote/RequestSuccessState.vue";
import { usePriceRequests } from "@/composables/usePriceRequests";

type Locale = "es" | "ca";

type MaterialOption = {
  value: string;
  label: string;
};

type QuoteForm = {
  website: string;
  name: string;
  center: string;
  email: string;
  phone: string;
  material: string;
  privacy: boolean;
};

const props = withDefaults(
  defineProps<{
    locale?: Locale;
    productName?: string;
    productSlug?: string;
    categorySlug?: string;
  }>(),
  {
    locale: "ca",
    productName: "Material gràfic i senyalística per a centres educatius",
    productSlug: "centres-educatius",
    categorySlug: "publicaciones",
  }
);

const copy = computed(() => {
  if (props.locale === "ca") {
    return {
      successTitle: "Sol·licitud enviada correctament",
      name: "Nom",
      center: "Centre",
      email: "Correu electrònic",
      phone: "Telèfon",
      material: "Quins materials necessiteu per al nou curs?",
      materialPlaceholder: "Selecciona una opció",
      privacyStart: "He llegit i accepto la",
      privacyLink: "política de privacitat",
      submit: "Parla amb un expert",
      submitting: "Enviant...",
      fallback: "Sol·licitud de pressupost per a centres educatius.",
      materialOptions: [
        { value: "apunts", label: "Apunts" },
        { value: "quaderns", label: "Quaderns" },
        { value: "dossiers-de-treball", label: "Dossiers de treball" },
        { value: "fitxes", label: "Fitxes" },
        { value: "avaluacions", label: "Avaluacions" },
        { value: "agendes", label: "Agendes" },
        { value: "senyalistica", label: "Senyalística" },
        { value: "altres", label: "Altres" },
      ] satisfies MaterialOption[],
      errors: {
        name: "Indica el teu nom.",
        center: "Indica el nom del centre.",
        email: "Introdueix un correu electrònic vàlid.",
        phone: "Introdueix un telèfon vàlid.",
        material: "Selecciona quin material necessiteu.",
        privacy: "Has d’acceptar la política de privacitat.",
        generic:
          "No hem pogut enviar la sol·licitud. Torna-ho a intentar o truca’ns al +34 932 749 890.",
      },
    };
  }

  return {
    successTitle: "Solicitud enviada correctamente",
    name: "Nombre",
    center: "Centro",
    email: "Correo electrónico",
    phone: "Teléfono",
    material: "¿Qué materiales necesitáis para el nuevo curso?",
    materialPlaceholder: "Selecciona una opción",
    privacyStart: "He leído y acepto la",
    privacyLink: "política de privacidad",
    submit: "Habla con un experto",
    submitting: "Enviando...",
    fallback: "Solicitud de presupuesto para centros educativos.",
    materialOptions: [
      { value: "apuntes", label: "Apuntes" },
      { value: "cuadernos", label: "Cuadernos" },
      { value: "dossieres-de-trabajo", label: "Dossieres de trabajo" },
      { value: "fichas", label: "Fichas" },
      { value: "evaluaciones", label: "Evaluaciones" },
      { value: "agendas", label: "Agendas" },
      { value: "senaletica", label: "Señalética" },
      { value: "otros", label: "Otros" },
    ] satisfies MaterialOption[],
    errors: {
      name: "Indica tu nombre.",
      center: "Indica el nombre del centro.",
      email: "Introduce un correo electrónico válido.",
      phone: "Introduce un teléfono válido.",
      material: "Selecciona qué material necesitáis.",
      privacy: "Debes aceptar la política de privacidad.",
      generic:
        "No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al +34 932 749 890.",
    },
  };
});

const route = useRoute();
const { sendPriceRequest, isLoading, error } = usePriceRequests();

const success = ref(false);
const validationError = ref("");
const submittedReference = ref<string | null>(null);

const form = reactive<QuoteForm>({
  website: "",
  name: "",
  center: "",
  email: "",
  phone: "",
  material: "",
  privacy: false,
});

const selectedMaterialLabel = computed(() => {
  return copy.value.materialOptions.find((item) => item.value === form.material)?.label || "";
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
  return typeof error.value === "string" ? error.value : copy.value.errors.generic;
});

function clearInputs() {
  form.website = "";
  form.name = "";
  form.center = "";
  form.email = "";
  form.phone = "";
  form.material = "";
  form.privacy = false;
  validationError.value = "";
}

function handleResetSuccessState() {
  success.value = false;
  submittedReference.value = null;
  clearInputs();
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
    form_name:
      props.locale === "ca"
        ? "landing_ensenyament"
        : "landing_centros_educativos",
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

  // Honeypot: si un bot rellena este campo, no enviamos nada.
  if (form.website.trim()) {
    success.value = true;
    return;
  }

  if (!form.name.trim()) {
    validationError.value = copy.value.errors.name;
    return;
  }

  if (!form.center.trim()) {
    validationError.value = copy.value.errors.center;
    return;
  }

  if (!isValidEmail(form.email)) {
    validationError.value = copy.value.errors.email;
    return;
  }

  if (!form.phone.trim() || form.phone.trim().replace(/\D/g, "").length < 9) {
    validationError.value = copy.value.errors.phone;
    return;
  }

  if (!form.material.trim()) {
    validationError.value = copy.value.errors.material;
    return;
  }

  if (!form.privacy) {
    validationError.value = copy.value.errors.privacy;
    return;
  }

  const materialLabel = selectedMaterialLabel.value;
  const message = [
    copy.value.fallback,
    `Centre: ${form.center.trim()}.`,
    `Material seleccionat: ${materialLabel}.`,
  ].join("\n");

  const response = await sendPriceRequest(
    {
      website: null,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.center.trim(),
      message,
      categorySlug: props.categorySlug,
      product: {
        name: props.productName,
        slug: props.productSlug,
        sku: null,
        url: sourceUrl.value,
      },
      extras: {
        landing: props.locale === "ca" ? "ensenyament" : "centros-educativos",
        locale: props.locale,
        center: form.center.trim(),
        selectedMaterial: materialLabel,
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

  if (error.value) return;

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
  clearInputs();
}
</script>

<template>
  <div class="education-quote-form">
    <RequestSuccessState
      v-if="success"
      :product-name="props.productName"
      :title="copy.successTitle"
      primary-to="/"
      @reset="handleResetSuccessState"
    />

    <form
      v-else
      class="education-quote-form__form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <div
        v-if="errorMessage"
        class="education-quote-form__error"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <input
        v-model="form.website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        class="education-quote-form__honeypot"
        aria-hidden="true"
      />

      <label class="education-quote-form__field">
        <span class="education-quote-form__label">
          {{ copy.name }} <span aria-hidden="true">*</span>
        </span>

        <input
          v-model="form.name"
          name="name"
          type="text"
          autocomplete="name"
          required
          class="education-quote-form__control"
        />
      </label>

      <label class="education-quote-form__field">
        <span class="education-quote-form__label">
          {{ copy.center }} <span aria-hidden="true">*</span>
        </span>

        <input
          v-model="form.center"
          name="center"
          type="text"
          autocomplete="organization"
          required
          class="education-quote-form__control"
        />
      </label>

      <label class="education-quote-form__field">
        <span class="education-quote-form__label">
          {{ copy.email }} <span aria-hidden="true">*</span>
        </span>

        <input
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="education-quote-form__control"
        />
      </label>

      <label class="education-quote-form__field">
        <span class="education-quote-form__label">
          {{ copy.phone }} <span aria-hidden="true">*</span>
        </span>

        <input
          v-model="form.phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          required
          class="education-quote-form__control"
        />
      </label>

      <label class="education-quote-form__field">
        <span class="education-quote-form__label">
          {{ copy.material }} <span aria-hidden="true">*</span>
        </span>

        <span class="education-quote-form__select-wrap">
          <select
            v-model="form.material"
            name="material"
            required
            class="education-quote-form__control education-quote-form__control--select"
          >
            <option value="" disabled>
              {{ copy.materialPlaceholder }}
            </option>

            <option
              v-for="option in copy.materialOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </span>
      </label>

      <label class="education-quote-form__privacy">
        <input
          v-model="form.privacy"
          type="checkbox"
          required
        />

        <span>
          {{ copy.privacyStart }}
          <NuxtLink
            to="/politica-privacidad"
            target="_blank"
          >
            {{ copy.privacyLink }}
          </NuxtLink>.
        </span>
      </label>

      <button
        type="submit"
        class="education-quote-form__submit"
        :disabled="isLoading"
      >
        <Loader2
          v-if="isLoading"
          class="education-quote-form__loader"
          aria-hidden="true"
        />
        {{ isLoading ? copy.submitting : copy.submit }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.education-quote-form {
  width: min(100%, 515px);
  margin-inline: auto;
  font-family: Figtree, var(--font-sans);
  color: #212121;
}

.education-quote-form__form {
  display: grid;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.education-quote-form__field {
  display: grid;
  gap: 4px;
}

.education-quote-form__label {
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
}

.education-quote-form__label span {
  color: #e00000;
}

.education-quote-form__control {
  display: block;
  width: 515px;
  max-width: 100%;
  height: 43px;
  border: 1px solid #a2a2a2;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
  padding: 0 14px;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.education-quote-form__control:focus {
  border-color: hsl(var(--brand-base));
  box-shadow:
    0 4px 4px rgb(0 0 0 / 25%),
    0 0 0 3px hsl(var(--brand-base) / 18%);
}

.education-quote-form__select-wrap {
  position: relative;
  display: block;
  width: 515px;
  max-width: 100%;
}

.education-quote-form__select-wrap::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 15px;
  width: 9px;
  height: 9px;
  pointer-events: none;
  border-right: 1.6px solid #212121;
  border-bottom: 1.6px solid #212121;
  transform: translateY(-65%) rotate(45deg);
}

.education-quote-form__control--select {
  appearance: none;
  padding-right: 42px;
  cursor: pointer;
}

.education-quote-form__privacy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 6px;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
}

.education-quote-form__privacy input {
  width: 16px;
  height: 16px;
  margin: 1px 0 0;
  flex: 0 0 auto;
  border: 1px solid #a2a2a2;
  border-radius: 3px;
  background: #ffffff;
}

.education-quote-form__privacy a {
  color: #212121;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.education-quote-form__submit {
  display: inline-flex;
  width: 515px;
  max-width: 100%;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  border: 0;
  border-radius: 10px;
  background: hsl(var(--brand-base));
  color: hsl(var(--brand-white));
  font-family: Figtree, var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    transform 160ms ease,
    opacity 160ms ease;
}

.education-quote-form__submit:hover {
  background: hsl(var(--brand-base-dark));
  transform: translateY(-1px);
}

.education-quote-form__submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.education-quote-form__loader {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  animation: education-quote-form-spin 900ms linear infinite;
}

.education-quote-form__error {
  border: 1px solid rgb(185 28 28 / 24%);
  border-radius: 10px;
  background: rgb(254 226 226 / 75%);
  padding: 10px 12px;
  color: #991b1b;
  font-family: Figtree, var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.education-quote-form__honeypot {
  display: none;
}

@keyframes education-quote-form-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .education-quote-form {
    width: 100%;
  }

  .education-quote-form__form {
    gap: 10px;
  }

  .education-quote-form__label {
    font-size: 14px;
  }

  .education-quote-form__control,
  .education-quote-form__select-wrap,
  .education-quote-form__submit {
    width: 100%;
  }

  .education-quote-form__submit {
    min-height: 48px;
    font-size: 14px;
  }
}
</style>
