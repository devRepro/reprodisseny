<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "#imports";

import AppButton from "@/components/shared/button/AppButton.vue";
import { cn } from "@/lib/utils";
import {
  getPriceRequestClientValidationFields,
  usePriceRequests,
} from "@/composables/usePriceRequests";
import { useLeadFormTracking } from "@/composables/useLeadFormTracking";
import { useTracking } from "@/composables/useTracking";
import type { TrackingContext } from "~/types/tracking";
import {
  priceRequestEmailSchema,
  priceRequestNameSchema,
  priceRequestPhoneSchema,
} from "~/shared/schemas/priceRequest";
import {
  CALENDAR_LANDING_CAMPAIGN,
  CALENDAR_PRODUCT_SLUG,
  CALENDAR_QUOTE_CONVERSION,
  calendarModels,
  coerceCalendarSizeForModel,
  createCalendarLeadExtras,
  getCalendarModel,
  getCalendarSizesForModel,
  isValidCalendarSelection,
} from "~/shared/data/calendarProducts";

type QuoteForm = {
  website: string;
  modelId: string;
  sizeId: string;
  quantity: string;
  nameOrCompany: string;
  email: string;
  phone: string;
  privacy: boolean;
};

type ValidationField =
  | "modelId"
  | "sizeId"
  | "quantity"
  | "nameOrCompany"
  | "email"
  | "phone"
  | "privacy"
  | null;

const props = withDefaults(
  defineProps<{
    productName?: string;
    productSlug?: string;
    categorySlug?: string;
    preselectedModelId?: string;
    trackingContext?: TrackingContext;
  }>(),
  {
    productName: "Calendarios corporativos",
    productSlug: CALENDAR_PRODUCT_SLUG,
    categorySlug: "material-oficina",
    preselectedModelId: "",
    trackingContext: undefined,
  },
);

const emit = defineEmits<{
  "model-change": [modelId: string];
}>();

const route = useRoute();
const { sendPriceRequest, isLoading, error } = usePriceRequests();
const tracking = useTracking();

const validationError = ref("");
const validationField = ref<ValidationField>(null);

const form = reactive<QuoteForm>({
  website: "",
  modelId: "",
  sizeId: "",
  quantity: "",
  nameOrCompany: "",
  email: "",
  phone: "",
  privacy: false,
});

const selectedModel = computed(() => getCalendarModel(form.modelId));
const availableSizes = computed(() => getCalendarSizesForModel(form.modelId));

const sourceUrl = computed(() => {
  const value = import.meta.client ? window.location.href : route.fullPath || "/";
  return String(value).slice(0, 300);
});

const errorMessage = computed(() => {
  if (validationError.value) return validationError.value;
  if (!error.value) return "";

  return typeof error.value === "string"
    ? error.value
    : "No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al +34 932 749 890.";
});

function getTrackingContext(): TrackingContext {
  return {
    pageType: "landing",
    pageLanguage: "es",
    contentGroup: "material-oficina",
    serviceName: "Calendarios corporativos",
    campaignName: CALENDAR_LANDING_CAMPAIGN,
    productSlug: props.productSlug,
    categorySlug: props.categorySlug,
    formId: "calendar_quote_form",
    formName: "calendar_quote_form",
    ...props.trackingContext,
  };
}

const leadTracking = useLeadFormTracking(getTrackingContext);

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function clearValidation() {
  validationError.value = "";
  validationField.value = null;
}

function resetIncompatibleSize() {
  form.sizeId = coerceCalendarSizeForModel(form.modelId, form.sizeId);
}

function handleModelChange(event: Event) {
  form.modelId = (event.target as HTMLSelectElement).value;
  resetIncompatibleSize();
  clearValidation();
  emit("model-change", form.modelId);
}

function handleSizeChange(event: Event) {
  form.sizeId = (event.target as HTMLSelectElement).value;
  clearValidation();
}

watch(
  () => props.preselectedModelId,
  (modelId) => {
    const model = getCalendarModel(modelId);
    if (!model || form.modelId === model.id) return;

    form.modelId = model.id;
    resetIncompatibleSize();
    clearValidation();
  },
  { immediate: true },
);

function controlClass(field?: ValidationField) {
  return cn("rd-form-control", validationField.value === field && "rd-form-control--error");
}

function checkPanelClass(field?: ValidationField) {
  return cn("rd-form-check-panel", validationField.value === field && "rd-form-check-panel--error");
}

function setValidationError(field: ValidationField, message: string) {
  validationField.value = field;
  validationError.value = message;
}

function isValidQuantity(value: string) {
  const normalized = cleanString(value);
  if (!normalized) return true;
  return /^\d{1,7}$/.test(normalized) && Number(normalized) > 0;
}

function validateForm() {
  const modelId = cleanString(form.modelId);
  const sizeId = cleanString(form.sizeId);
  const quantity = cleanString(form.quantity);
  const nameOrCompany = cleanString(form.nameOrCompany);
  const email = cleanString(form.email);
  const phone = cleanString(form.phone);

  const invalidFields: Exclude<ValidationField, null>[] = [];
  if (!getCalendarModel(modelId)) invalidFields.push("modelId");
  if (!isValidCalendarSelection(modelId, sizeId)) invalidFields.push("sizeId");
  if (!isValidQuantity(quantity)) invalidFields.push("quantity");
  if (!priceRequestNameSchema.safeParse(nameOrCompany).success) invalidFields.push("nameOrCompany");
  if (!priceRequestEmailSchema.safeParse(email).success) invalidFields.push("email");
  if (!priceRequestPhoneSchema.safeParse(phone).success) invalidFields.push("phone");
  if (!form.privacy) invalidFields.push("privacy");

  if (!invalidFields.length) {
    return {
      ok: true as const,
      values: { modelId, sizeId, quantity, nameOrCompany, email, phone },
    };
  }

  const first = invalidFields[0];
  const messages: Record<Exclude<ValidationField, null>, string> = {
    modelId: "Selecciona un modelo de calendario.",
    sizeId: "Selecciona una medida disponible para ese modelo.",
    quantity: "Indica una cantidad válida.",
    nameOrCompany: "Indica un nombre o empresa válido.",
    email: "Introduce un email válido.",
    phone: "Introduce un teléfono válido.",
    privacy: "Debes aceptar la política de privacidad.",
  };

  setValidationError(first, messages[first]);
  leadTracking.trackValidationError(invalidFields);

  return { ok: false as const };
}

async function onSubmit() {
  if (isLoading.value) return;

  clearValidation();
  error.value = null;

  if (cleanString(form.website)) {
    await navigateTo({ path: "/gracias", query: { kind: "presupuesto" } });
    return;
  }

  const validation = validateForm();
  if (!validation.ok) return;

  const extras = createCalendarLeadExtras({
    modelId: validation.values.modelId,
    sizeId: validation.values.sizeId,
    quantity: validation.values.quantity,
  });

  const model = selectedModel.value;
  const size = model ? availableSizes.value.find((item) => item.id === validation.values.sizeId) : null;

  if (!extras || !model || !size) {
    setValidationError("sizeId", "La combinación de modelo y medida no es válida.");
    leadTracking.trackValidationError(["modelId", "sizeId"]);
    return;
  }

  const fallbackMessage = [
    "Solicitud desde landing de calendarios personalizados.",
    `Modelo: ${model.label}.`,
    `Medida: ${size.label}.`,
    `Cantidad: ${validation.values.quantity || "sin indicar"}.`,
  ].join(" ");

  try {
    const trackingPayload = tracking.getTrackingPayloadForLead(getTrackingContext());

    const response = await sendPriceRequest(
      {
        website: null,
        name: validation.values.nameOrCompany,
        email: validation.values.email,
        phone: validation.values.phone,
        company: validation.values.nameOrCompany,
        message: fallbackMessage,
        categorySlug: props.categorySlug,
        product: {
          name: props.productName,
          slug: props.productSlug,
          sku: null,
          url: sourceUrl.value,
        },
        extras,
        consent: true,
        sourceUrl: trackingPayload.sourceUrl || sourceUrl.value,
        utm: trackingPayload.routeUtm,
        tracking: trackingPayload,
        initialStatus: "Nova",
      },
      { file: null, fileKind: "design" },
    );

    if (!response || error.value) return;

    await navigateTo({
      path: "/gracias",
      query: {
        kind: "presupuesto",
        conversion: CALENDAR_QUOTE_CONVERSION,
      },
    });
  } catch (submitError) {
    const fields = getPriceRequestClientValidationFields(submitError);
    if (fields) leadTracking.trackValidationError(fields);
  }
}
</script>

<template>
  <div class="calendar-quote-form rd-form-frame mx-auto max-w-[560px]">
    <form
      id="calendar_quote_form"
      class="rd-form-shell"
      novalidate
      @submit.prevent="onSubmit"
      @pointerdown.capture="leadTracking.onFormInteraction"
      @keydown.capture="leadTracking.onFormInteraction"
      @input.capture="leadTracking.onFormInteraction"
      @change.capture="leadTracking.onFormInteraction"
    >
      <div class="rd-form-body">
        <div class="rd-form-stack">
          <div
            v-if="errorMessage"
            id="calendar-form-error"
            class="rd-form-alert rd-form-alert--destructive"
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
            class="hidden"
            aria-hidden="true"
          />

          <div class="rd-form-field">
            <label for="calendar-model" class="rd-form-label">
              Modelo de calendario <span class="rd-form-required">*</span>
            </label>

            <select
              id="calendar-model"
              :value="form.modelId"
              name="modelId"
              required
              :class="controlClass('modelId')"
              :aria-invalid="validationField === 'modelId'"
              :aria-describedby="validationField === 'modelId' ? 'calendar-form-error' : undefined"
              @change="handleModelChange"
            >
              <option value="">Selecciona una opción</option>
              <option v-for="model in calendarModels" :key="model.id" :value="model.id">
                {{ model.label }}
              </option>
            </select>
          </div>

          <div class="rd-form-field">
            <label for="calendar-size" class="rd-form-label">
              Tamaño
            </label>

            <select
              id="calendar-size"
              :value="form.sizeId"
              name="sizeId"
              required
              :disabled="!selectedModel"
              :class="controlClass('sizeId')"
              :aria-invalid="validationField === 'sizeId'"
              :aria-describedby="validationField === 'sizeId' ? 'calendar-form-error' : undefined"
              @change="handleSizeChange"
            >
              <option value="">
                {{ selectedModel ? "Selecciona una medida" : "Selecciona primero un modelo" }}
              </option>
              <option v-for="size in availableSizes" :key="size.id" :value="size.id">
                {{ size.label }}
              </option>
            </select>
          </div>

          <div class="rd-form-field">
            <label for="calendar-quantity" class="rd-form-label">
              Cantidad <span class="rd-form-inline-note">(Opcional)</span>
            </label>

            <input
              id="calendar-quantity"
              v-model="form.quantity"
              name="quantity"
              type="number"
              inputmode="numeric"
              min="1"
              :class="controlClass('quantity')"
              :aria-invalid="validationField === 'quantity'"
              :aria-describedby="validationField === 'quantity' ? 'calendar-form-error' : undefined"
            />
          </div>

          <div class="rd-form-field">
            <label for="calendar-name" class="rd-form-label">
              Nombre / empresa <span class="rd-form-required">*</span>
            </label>

            <input
              id="calendar-name"
              v-model="form.nameOrCompany"
              name="nameOrCompany"
              type="text"
              autocomplete="organization"
              required
              :class="controlClass('nameOrCompany')"
              :aria-invalid="validationField === 'nameOrCompany'"
              :aria-describedby="validationField === 'nameOrCompany' ? 'calendar-form-error' : undefined"
            />
          </div>

          <div class="rd-form-field">
            <label for="calendar-email" class="rd-form-label">
              Email <span class="rd-form-required">*</span>
            </label>

            <input
              id="calendar-email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              :class="controlClass('email')"
              :aria-invalid="validationField === 'email'"
              :aria-describedby="validationField === 'email' ? 'calendar-form-error' : undefined"
            />
          </div>

          <div class="rd-form-field">
            <label for="calendar-phone" class="rd-form-label">
              Teléfono <span class="rd-form-required">*</span>
            </label>

            <input
              id="calendar-phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              required
              :class="controlClass('phone')"
              :aria-invalid="validationField === 'phone'"
              :aria-describedby="validationField === 'phone' ? 'calendar-form-error' : undefined"
            />
          </div>

          <label :class="checkPanelClass('privacy')" for="calendar-privacy">
            <input
              id="calendar-privacy"
              v-model="form.privacy"
              name="privacy"
              type="checkbox"
              required
              class="rd-form-checkbox"
              :aria-invalid="validationField === 'privacy'"
              :aria-describedby="validationField === 'privacy' ? 'calendar-form-error' : undefined"
            />

            <span class="rd-form-privacy-text">
              He leído y acepto la
              <NuxtLink to="/politica-privacidad" target="_blank" class="rd-form-link">
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
          class="calendar-quote-form__submit"
        >
          {{ isLoading ? "Enviando..." : "Solicitar presupuesto" }}
        </AppButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.calendar-quote-form :deep(.rd-form-shell) {
  border-radius: 8px;
  box-shadow: 0 14px 32px rgb(0 0 0 / 6%);
}

.calendar-quote-form :deep(.rd-form-body) {
  padding: 24px;
}

.calendar-quote-form :deep(.rd-form-footer) {
  padding: 0 24px 24px;
  border-top: 0;
}

.calendar-quote-form__submit {
  min-height: 50px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
}

@media (max-width: 639px) {
  .calendar-quote-form :deep(.rd-form-body) {
    padding: 20px;
  }

  .calendar-quote-form :deep(.rd-form-footer) {
    padding: 0 20px 20px;
  }
}
</style>
