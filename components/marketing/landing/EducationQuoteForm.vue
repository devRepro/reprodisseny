<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "#imports";
import { Loader2 } from "lucide-vue-next";

import { usePriceRequests } from "@/composables/usePriceRequests";
import { useTracking } from "@/composables/useTracking";
import type { TrackingContext, TrackingEventName } from "~/types/tracking";

type EducationLocale = "ca" | "es";

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
    locale?: EducationLocale;
    productName?: string;
    productSlug?: string;
    categorySlug?: string;
    trackingContext?: TrackingContext;
  }>(),
  {
    locale: "ca",
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

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      successTitle: "Solicitud enviada correctamente",
      genericError:
        "No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al +34 932 749 890.",
      name: "Nombre *",
      center: "Centro educativo *",
      email: "Email *",
      phone: "Teléfono *",
      materialType: "Tipo de material",
      materialPlaceholder: "Selecciona una opción",
      deadline: "Fecha aproximada de entrega",
      deadlinePlaceholder: "Ej. antes del 5 de septiembre",
      message: "Mensaje",
      messagePlaceholder: "Cuéntanos qué necesitáis: dossiers, vinilos, carteles, señalética, cantidades aproximadas...",
      requiredNote: "Los campos marcados con",
      requiredNoteEnd: "son obligatorios.",
      privacyPrefix: "He leído y acepto la",
      privacyLink: "política de privacidad",
      submit: "Solicitar presupuesto",
      sending: "Enviando...",
      errors: {
        name: "Indica tu nombre.",
        center: "Indica el nombre del centro educativo.",
        email: "Introduce un email válido.",
        phone: "Introduce un teléfono válido.",
        privacy: "Debes aceptar la política de privacidad.",
      },
    };
  }

  return {
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
});

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

    out[key] = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
  }

  return Object.keys(out).length ? out : null;
});

const errorMessage = computed(() => {
  if (validationError.value) return validationError.value;
  if (!error.value) return "";

  return typeof error.value === "string" ? error.value : copy.value.genericError;
});

function getTrackingContext(): TrackingContext {
  return {
    pageType: "landing",
    pageLanguage: props.locale,
    contentGroup: "educacion",
    serviceName: "Centres educatius",
    campaignName: "centres-educatius-2026",
    campaignId: null,
    productSlug: props.productSlug,
    categorySlug: props.categorySlug,
    formId: props.locale === "ca" ? "education_quote_form_ca" : "education_quote_form_es",
    formName: "education_quote_form",
    ...props.trackingContext,
  };
}

function resetForm() {
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
  submittedReference.value = null;
}

function handleResetSuccessState() {
  success.value = false;
  resetForm();
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
  validationError.value = "";
  error.value = null;

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

  if (!isValidPhone(form.phone)) {
    validationError.value = copy.value.errors.phone;
    return;
  }

  if (!form.privacy) {
    validationError.value = copy.value.errors.privacy;
    return;
  }

  const fallbackMessage = [
    props.locale === "ca"
      ? "Sol·licitud de pressupost per a centre educatiu."
      : "Solicitud de presupuesto para centro educativo.",
    `${props.locale === "ca" ? "Centre" : "Centro"}: ${form.center.trim()}.`,
    `${props.locale === "ca" ? "Tipus de material" : "Tipo de material"}: ${form.materialType || "sin indicar"}.`,
    `${props.locale === "ca" ? "Data aproximada" : "Fecha aproximada"}: ${form.deadline || "sin indicar"}.`,
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
        locale: props.locale,
        center: form.center.trim(),
        materialType: form.materialType || null,
        deadline: form.deadline || null,
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
  submittedReference.value = transactionId ? String(transactionId) : null;

  if (!result?.duplicated) {
    pushLeadEvent(transactionId);
  }

  success.value = true;
  resetForm();
}
</script>

<template>
  <div class="mx-auto w-full max-w-[480px]">
    <div
  v-if="success"
  class="rounded-xl border border-primary/15 bg-white px-6 py-7 text-center shadow-sm"
  role="status"
  aria-live="polite"
>
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

  <button
    type="button"
    class="mt-5 inline-flex h-10 items-center justify-center rounded-[6px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
    @click="handleResetSuccessState"
  >
    {{ copy.sendAnother }}
  </button>
</div>

    <form v-else class="space-y-4" novalidate @submit.prevent="onSubmit">
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
        <span class="mb-1.5 block text-sm font-medium text-foreground">{{ copy.name }}</span>
        <input
          v-model="form.name"
          name="name"
          type="text"
          autocomplete="name"
          required
          class="h-10 w-full rounded-[6px] border border-border bg-white px-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-foreground">{{ copy.center }}</span>
        <input
          v-model="form.center"
          name="center"
          type="text"
          autocomplete="organization"
          required
          class="h-10 w-full rounded-[6px] border border-border bg-white px-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-foreground">{{ copy.email }}</span>
        <input
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="h-10 w-full rounded-[6px] border border-border bg-white px-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-foreground">{{ copy.phone }}</span>
        <input
          v-model="form.phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          required
          class="h-10 w-full rounded-[6px] border border-border bg-white px-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-foreground">{{ copy.materialType }}</span>
        <select
          v-model="form.materialType"
          name="materialType"
          class="h-10 w-full rounded-[6px] border border-border bg-white px-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">{{ copy.materialPlaceholder }}</option>
          <option value="material-didactic">Material didàctic</option>
          <option value="senyalistica">Senyalística</option>
          <option value="cartelleria">Cartelleria</option>
          <option value="vinils">Vinils</option>
          <option value="altres">Altres</option>
        </select>
      </label>

      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-foreground">{{ copy.deadline }}</span>
        <input
          v-model="form.deadline"
          name="deadline"
          type="text"
          :placeholder="copy.deadlinePlaceholder"
          class="h-10 w-full rounded-[6px] border border-border bg-white px-3 text-[15px] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-foreground">{{ copy.message }}</span>
        <textarea
          v-model="form.message"
          name="message"
          rows="5"
          :placeholder="copy.messagePlaceholder"
          class="w-full resize-y rounded-[6px] border border-border bg-white px-3 py-2.5 text-[15px] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <p class="text-xs leading-5 text-muted-foreground">
        {{ copy.requiredNote }}
        <span class="font-semibold text-foreground">*</span>
        {{ copy.requiredNoteEnd }}
      </p>

      <label class="flex items-start gap-2 pt-1 text-xs leading-5 text-foreground/75">
        <input
          v-model="form.privacy"
          type="checkbox"
          required
          class="mt-1 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/20"
        />
        <span>
          {{ copy.privacyPrefix }}
          <NuxtLink
            to="/politica-privacidad"
            target="_blank"
            class="font-semibold text-primary hover:underline"
          >
            {{ copy.privacyLink }}
          </NuxtLink>.
        </span>
      </label>

      <button
        type="submit"
        :disabled="isLoading"
        class="inline-flex h-11 w-full items-center justify-center rounded-[6px] bg-primary px-4 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        {{ isLoading ? copy.sending : copy.submit }}
      </button>
    </form>
  </div>
</template>
