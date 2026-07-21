<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "#imports";

import { cn } from "@/lib/utils";
import AppButton from "@/components/shared/button/AppButton.vue";
import { usePriceRequests } from "@/composables/usePriceRequests";
import { useTracking } from "@/composables/useTracking";
import type { TrackingContext, TrackingEventName } from "~/types/tracking";
import { string } from "zod";

type QuoteForm = {
  website: string;
  name: string;
  center: string;
  email: string;
  phone: string;
  materialType: string;
  deadline: string;
  message: string;
  privacy: boolean;
};

type ValidationField = "name" | "center" | "email" | "phone" | "privacy" | null;

type PriceRequestResult = {
  ok?: boolean;
  duplicated?: boolean;
  itemId?: string | number | null;
  requestKey?: string | null;
  reference?: string | null;
  requestId?: string | null;
  id?: string | number | null;
} | null;

const props = withDefaults(
  defineProps<{
    productName?: string;
    productSlug?: string;
    categorySlug?: string;
    trackingContext?: TrackingContext;
  }>(),
  {
    productName: "Material gràfic i senyalística per a centres educatius",
    productSlug: "centres-educatius",
    categorySlug: "publicaciones",
    trackingContext: undefined,
  },
);

const route = useRoute();
const { sendPriceRequest, isLoading, error } = usePriceRequests();
const tracking = useTracking();

const success = ref(false);
const validationError = ref("");
const validationField = ref<ValidationField>(null);
const submittedReference = ref<string | null>(null);

const form = reactive<QuoteForm>({
  website: "",
  name: "",
  center: "",
  email: "",
  phone: "",
  materialType: "",
  deadline: "",
  message: "",
  privacy: false,
});

const copy = {
  successTitle: "Sol·licitud enviada correctament",
  successMessage:
    "Hem rebut la teva sol·licitud. Ens posarem en contacte amb tu en menys de 24 hores laborables.",
  referenceLabel: "Referència",
  sendAnother: "Enviar una altra sol·licitud",
  notProvided: "no indicat",
  genericError:
    "No hem pogut enviar la sol·licitud. Torna-ho a intentar o truca’ns al +34 932 749 890.",
  name: "Nom i cognoms *",
  center: "Centre educatiu *",
  email: "Email *",
  phone: "Telèfon *",
  materialType: "Tipus de material",
  materialPlaceholder: "Selecciona una opció",
  deadline: "Data aproximada d’entrega",
  deadlinePlaceholder: "Ex. abans del 5 de setembre",
  message: "Missatge",
  messagePlaceholder:
    "Explica’ns què necessiteu: dossiers, vinils, cartells, senyalística, quantitats aproximades...",
  requiredNote: "Els camps marcats amb",
  requiredNoteEnd: "són obligatoris.",
  privacyPrefix: "He llegit i accepto la",
  privacyLink: "política de privacitat",
  submit: "Sol·licitar pressupost",
  sending: "Enviant...",
  errors: {
    name: "Indica el teu nom.",
    center: "Indica el nom del centre educatiu.",
    email: "Introdueix un email vàlid.",
    phone: "Introdueix un telèfon vàlid.",
    privacy: "Has d’acceptar la política de privacitat.",
  },
};

const sourceUrl = computed(() => {
  const value = import.meta.client ? window.location.href : route.fullPath || "/";
  return String(value).slice(0, 300);
});

const routeUtm = computed(() => {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(route.query || {})) {
    const normalizedKey = key.toLowerCase();

    if (
      !normalizedKey.startsWith("utm_") &&
      !["gclid", "gbraid", "wbraid", "fbclid", "msclkid"].includes(normalizedKey)
    ) {
      continue;
    }

    out[key] = Array.isArray(value)
      ? String(value[0] ?? "")
      : String(value ?? "");
  }

  return Object.keys(out).length ? out : null;
});

const errorMessage = computed(() => {
  if (validationError.value) return validationError.value;
  if (!error.value) return "";

  return typeof error.value === "string" ? error.value : copy.genericError;
});

function controlClass(field: ValidationField) {
  return cn(
    "rd-form-control",
    validationField.value === field && "rd-form-control--error",
  );
}

function textareaClass() {
  return "rd-form-textarea";
}

function checkPanelClass(field: ValidationField) {
  return cn(
    "rd-form-check-panel",
    validationField.value === field && "rd-form-check-panel--error",
  );
}

function getTrackingContext(): TrackingContext {
  return {
    pageType: "landing",
    pageLanguage: "ca",
    contentGroup: "educacion",
    serviceName: "Centres educatius",
    campaignName: "centres-educatius-2026",
    productSlug: props.productSlug,
    categorySlug: props.categorySlug,
    formId: "education_quote_form_ca",
    formName: "education_quote_form",
    ...props.trackingContext,
  };
}

function resetFormFields() {
  form.website = "";
  form.name = "";
  form.center = "";
  form.email = "";
  form.phone = "";
  form.materialType = "";
  form.deadline = "";
  form.message = "";
  form.privacy = false;

  validationError.value = "";
  validationField.value = null;
}

function handleResetSuccessState() {
  success.value = false;
  submittedReference.value = null;
  resetFormFields();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9;
}

function resolveRequestReference(result: PriceRequestResult) {
  return (
    result?.reference ||
    result?.requestId ||
    result?.requestKey ||
    result?.id ||
    result?.itemId ||
    null
  );
}

function pushLeadEvent(transactionId?: string | number | null) {
  const requestKey = transactionId ? String(transactionId) : null;
  const context = getTrackingContext();

  tracking.pushEvent(
    "generate_lead" as TrackingEventName,
    {
      lead_type: "quote_request",
      request_key: requestKey,
      lead_id: requestKey,
      transaction_id: requestKey,
      product_name: props.productName,
      page_path: import.meta.client ? window.location.pathname : route.path,
    },
    context,
  );
}

function getLeadTrackingPayload() {
  const context = getTrackingContext();

  return {
    ...tracking.getTrackingPayloadForLead(context),
    routeUtm: routeUtm.value,
    sourceUrl: sourceUrl.value,
  };
}

async function onSubmit() {
  validationField.value = null;
  validationError.value = "";
  error.value = null;

  if (form.website.trim()) {
    success.value = true;
    return;
  }

  if (!form.name.trim()) {
    validationField.value = "name";
    validationError.value = copy.errors.name;
    return;
  }

  if (!form.center.trim()) {
    validationField.value = "center";
    validationError.value = copy.errors.center;
    return;
  }

  if (!isValidEmail(form.email)) {
    validationField.value = "email";
    validationError.value = copy.errors.email;
    return;
  }

  if (!isValidPhone(form.phone)) {
    validationField.value = "phone";
    validationError.value = copy.errors.phone;
    return;
  }

  if (!form.privacy) {
    validationField.value = "privacy";
    validationError.value = copy.errors.privacy;
    return;
  }

  const materialType = form.materialType.trim() || copy.notProvided;
  const deadline = form.deadline.trim() || copy.notProvided;

  const fallbackMessage = [
    "Sol·licitud de pressupost per a centre educatiu.",
    `Centre: ${form.center.trim()}.`,
    `Tipus de material: ${materialType}.`,
    `Data aproximada: ${deadline}.`,
  ].join(" ");

  const trackingPayload = getLeadTrackingPayload();

  const priceRequestPayload = {
    website: null,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    company: form.center.trim(),
    message: form.message.trim() || fallbackMessage,
    categorySlug: props.categorySlug,
    product: {
      name: props.productName,
      slug: props.productSlug,
      sku: null,
      url: sourceUrl.value,
    },
    extras: {
      landing: "centres-educatius",
      locale: "ca",
      center: form.center.trim(),
      materialType: form.materialType.trim() || null,
      deadline: form.deadline.trim() || null,
    },
    consent: true,
    sourceUrl: sourceUrl.value,
    utm: routeUtm.value,
    tracking: trackingPayload,
    initialStatus: "Nova",
  };

  const response = await sendPriceRequest(
    priceRequestPayload as unknown as Parameters<typeof sendPriceRequest>[0],
    { file: null, fileKind: "design" },
  );

  const result = response as PriceRequestResult;

  if (error.value) return;

  const transactionId = resolveRequestReference(result);

  if (!result?.duplicated) {
    pushLeadEvent(transactionId);
  }

  resetFormFields();
  submittedReference.value = transactionId ? String(transactionId) : null;
  success.value = true;
}
</script>

<template>
  <div class="rd-form-frame mx-auto max-w-xl">
    <div
      v-if="success"
      class="rd-form-shell"
      role="status"
      aria-live="polite"
    >
      <div class="rd-form-body text-center">
        <h3 class="text-xl font-semibold text-foreground">
          {{ copy.successTitle }}
        </h3>

        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          {{ copy.successMessage }}
        </p>

        <p
          v-if="submittedReference"
          class="mt-3 text-xs font-medium text-muted-foreground"
        >
          {{ copy.referenceLabel }}: {{ submittedReference }}
        </p>
      </div>

      <div class="rd-form-footer">
        <AppButton
          type="button"
          size="lg"
          block
          @click="handleResetSuccessState"
        >
          {{ copy.sendAnother }}
        </AppButton>
      </div>
    </div>

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
              {{ copy.name }}
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
              {{ copy.center }}
            </span>

            <input
              v-model="form.center"
              name="center"
              type="text"
              autocomplete="organization"
              required
              :class="controlClass('center')"
            />
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              {{ copy.email }}
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
              {{ copy.phone }}
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
              {{ copy.materialType }}
              <span class="rd-form-inline-note">(Opcional)</span>
            </span>

            <select
              v-model="form.materialType"
              name="materialType"
              class="rd-form-control"
            >
              <option value="">{{ copy.materialPlaceholder }}</option>
              <option value="material-didactic">Material didàctic</option>
              <option value="senyalistica">Senyalística</option>
              <option value="cartelleria">Cartelleria</option>
              <option value="vinils">Vinils</option>
              <option value="altres">Altres</option>
            </select>
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              {{ copy.deadline }}
              <span class="rd-form-inline-note">(Opcional)</span>
            </span>

            <input
              v-model="form.deadline"
              name="deadline"
              type="text"
              :placeholder="copy.deadlinePlaceholder"
              class="rd-form-control"
            />
          </label>

          <label class="rd-form-field">
            <span class="rd-form-label">
              {{ copy.message }}
              <span class="rd-form-inline-note">(Opcional)</span>
            </span>

            <textarea
              v-model="form.message"
              name="message"
              rows="5"
              :placeholder="copy.messagePlaceholder"
              :class="textareaClass()"
            />
          </label>

          <p class="rd-form-help-text">
            {{ copy.requiredNote }}
            <span class="rd-form-required">*</span>
            {{ copy.requiredNoteEnd }}
          </p>

          <label :class="checkPanelClass('privacy')">
            <input
              v-model="form.privacy"
              type="checkbox"
              required
              class="rd-form-checkbox"
            />

            <span class="rd-form-privacy-text">
              {{ copy.privacyPrefix }}
              <NuxtLink
                to="/politica-privacidad"
                target="_blank"
                class="rd-form-link"
              >
                {{ copy.privacyLink }}
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
          {{ isLoading ? copy.sending : copy.submit }}
        </AppButton>
      </div>
    </form>
  </div>
</template>
