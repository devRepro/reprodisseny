import { isCreatedPriceRequestResponse } from "../priceRequestResponse";

export type LeadFormAnalyticsEvent =
  | "form_start"
  | "form_validation_error"
  | "generate_lead";

export type LeadFormInteraction = {
  trusted: boolean;
  fieldName?: string | null;
  controlType?: string | null;
};

type EventSink = (
  event: LeadFormAnalyticsEvent,
  payload: Record<string, unknown>,
) => void;

const TECHNICAL_FIELD_NAME = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;

export function sanitizeInvalidFieldNames(fields: Iterable<string>) {
  return [...new Set(fields)]
    .filter((field) => TECHNICAL_FIELD_NAME.test(field) && field !== "website")
    .sort();
}

export function createLeadFormTracker(push: EventSink) {
  let started = false;
  let conversionTracked = false;
  let submissionPending = false;

  function trackInteraction(interaction: LeadFormInteraction) {
    if (
      started ||
      !interaction.trusted ||
      !interaction.fieldName ||
      interaction.fieldName === "website" ||
      interaction.controlType === "hidden"
    ) {
      return false;
    }

    started = true;
    push("form_start", {});
    return true;
  }

  function trackValidationError(fields: Iterable<string>) {
    const invalidFields = sanitizeInvalidFieldNames(fields);
    if (invalidFields.length === 0) return false;

    push("form_validation_error", {
      error_type: "client_validation",
      invalid_field_count: invalidFields.length,
      invalid_fields: invalidFields,
    });
    return true;
  }

  function trackConversion(response: unknown) {
    if (conversionTracked || !isCreatedPriceRequestResponse(response)) {
      return false;
    }

    conversionTracked = true;
    push("generate_lead", { lead_type: "quote_request" });
    return true;
  }

  function resetCycle() {
    started = false;
    conversionTracked = false;
  }

  async function submitAndTrack<T>(send: () => Promise<T>) {
    if (submissionPending) return null;

    submissionPending = true;
    try {
      const response = await send();
      trackConversion(response);
      return response;
    } finally {
      submissionPending = false;
    }
  }

  return {
    trackInteraction,
    trackValidationError,
    trackConversion,
    submitAndTrack,
    resetCycle,
  };
}
