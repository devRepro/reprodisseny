import assert from "node:assert/strict";
import test from "node:test";

import {
  CALENDAR_LANDING_SLUG,
  CALENDAR_PRODUCT_SLUG,
  calendarModels,
  coerceCalendarSizeForModel,
  createCalendarLeadExtras,
  getCalendarSizesForModel,
  isValidCalendarSelection,
} from "../shared/data/calendarProducts";
import { priceRequestPayloadSchema } from "../shared/schemas/priceRequest";

const validContact = {
  name: "Ada Lovelace",
  email: "ada@example.test",
  phone: "+34 600 000 000",
  company: "Ada Lovelace",
  categorySlug: "material-oficina",
  product: {
    name: "Calendarios corporativos",
    slug: CALENDAR_PRODUCT_SLUG,
    sku: null,
    url: "/lp/calendarios",
  },
  consent: true,
  sourceUrl: "/lp/calendarios",
  utm: null,
  tracking: null,
};

test("seleccionar un modelo muestra solo sus medidas", () => {
  assert.deepEqual(
    getCalendarSizesForModel("sobremesa-triangular").map((size) => size.label),
    ["15 × 15 cm", "21 × 10 cm", "A medida"],
  );
});

test("seleccionar otro modelo elimina medidas del modelo anterior", () => {
  const wallSizes = getCalendarSizesForModel("pared-wire-o").map((size) => size.label);

  assert.deepEqual(wallSizes, ["DIN A4", "DIN A3", "34 × 48 cm", "A medida"]);
  assert.equal(wallSizes.includes("15 × 15 cm"), false);
  assert.equal(wallSizes.includes("21 × 10 cm"), false);
});

test("cambiar modelo resetea una medida incompatible", () => {
  assert.equal(coerceCalendarSizeForModel("pared-wire-o", "15x15"), "");
  assert.equal(coerceCalendarSizeForModel("pared-wire-o", "din-a4"), "din-a4");
});

test("payload de calendarios contiene modelo y medida correctos", () => {
  const extras = createCalendarLeadExtras({
    modelId: "sobremesa-triangular",
    sizeId: "15x15",
    quantity: "250",
  });

  assert.deepEqual(extras, {
    landing: CALENDAR_LANDING_SLUG,
    campaign: "calendarios-2027",
    tipoCalendario: "Sobremesa triangular",
    tamano: "15 × 15 cm",
    cantidad: "250",
    calendarModelId: "sobremesa-triangular",
    calendarSizeId: "15x15",
    cmsProductSlug: CALENDAR_PRODUCT_SLUG,
  });
});

test("una combinacion modelo-medida invalida no puede enviarse", () => {
  assert.equal(isValidCalendarSelection("sobremesa-triangular", "din-a3"), false);

  const result = priceRequestPayloadSchema.safeParse({
    ...validContact,
    message: "Solicitud desde landing de calendarios.",
    extras: {
      landing: CALENDAR_LANDING_SLUG,
      tipoCalendario: "Sobremesa triangular",
      tamano: "DIN A3",
      calendarModelId: "sobremesa-triangular",
      calendarSizeId: "din-a3",
    },
  });

  assert.equal(result.success, false);
});

test("una combinacion valida de calendarios supera el contrato del endpoint", () => {
  const extras = createCalendarLeadExtras({
    modelId: calendarModels[0].id,
    sizeId: calendarModels[0].sizes[0].id,
    quantity: "",
  });

  assert.equal(
    priceRequestPayloadSchema.safeParse({
      ...validContact,
      message: "Solicitud desde landing de calendarios.",
      extras,
    }).success,
    true,
  );
});
