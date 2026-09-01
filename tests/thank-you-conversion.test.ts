import assert from "node:assert/strict";
import test from "node:test";

import {
  getCalendarQuoteThankYouTrackingContext,
  isCalendarQuoteThankYouConversion,
} from "../utils/tracking/thankYouConversion";

test("submit o thank-you no marcada no dispara conversion de calendarios", () => {
  assert.equal(isCalendarQuoteThankYouConversion({ kind: "presupuesto" }), false);
  assert.equal(
    isCalendarQuoteThankYouConversion({ kind: "presupuesto", conversion: "otra" }),
    false,
  );
});

test("la conversion de calendarios se dispara solo desde la thank-you marcada", () => {
  assert.equal(
    isCalendarQuoteThankYouConversion({
      kind: "presupuesto",
      conversion: "calendar_quote",
    }),
    true,
  );
  assert.equal(
    isCalendarQuoteThankYouConversion({
      kind: "contacto",
      conversion: "calendar_quote",
    }),
    false,
  );
});

test("el contexto de conversion usa metadatos tecnicos de calendarios", () => {
  assert.deepEqual(getCalendarQuoteThankYouTrackingContext(), {
    pageType: "crm",
    pageLanguage: "es",
    contentGroup: "material-oficina",
    serviceName: "Calendarios corporativos",
    campaignName: "calendarios-2027",
    productSlug: "calendarios-personalizados",
    categorySlug: "material-oficina",
    formId: "calendar_quote_form",
    formName: "calendar_quote_form",
  });
});
