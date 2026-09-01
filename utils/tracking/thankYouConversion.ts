import type { TrackingContext } from "~/types/tracking";
import {
  CALENDAR_LANDING_CAMPAIGN,
  CALENDAR_PRODUCT_SLUG,
  CALENDAR_QUOTE_CONVERSION,
} from "~/shared/data/calendarProducts";

type QueryLike = Record<string, unknown>;

function firstQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value ?? "");
}

export function isCalendarQuoteThankYouConversion(query: QueryLike) {
  return (
    firstQueryValue(query.kind) === "presupuesto" &&
    firstQueryValue(query.conversion) === CALENDAR_QUOTE_CONVERSION
  );
}

export function getCalendarQuoteThankYouTrackingContext(): TrackingContext {
  return {
    pageType: "crm",
    pageLanguage: "es",
    contentGroup: "material-oficina",
    serviceName: "Calendarios corporativos",
    campaignName: CALENDAR_LANDING_CAMPAIGN,
    productSlug: CALENDAR_PRODUCT_SLUG,
    categorySlug: "material-oficina",
    formId: "calendar_quote_form",
    formName: "calendar_quote_form",
  };
}
