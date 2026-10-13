import assert from "node:assert/strict";
import test from "node:test";

import {
  CALENDAR_LANDING_SLUG,
  CALENDAR_PRODUCT_SLUG,
  calendarModels,
  coerceCalendarSizeForModel,
  createCalendarLeadExtras,
  getCalendarSizesForModel,
  isValidCalendarQuantity,
  isValidCalendarSelection,
} from "../shared/data/calendarProducts";
import {
  normalizePriceRequestSourceUrl,
  PRICE_REQUEST_LIMITS,
  priceRequestPayloadSchema,
  priceRequestPhoneSchema,
} from "../shared/schemas/priceRequest";

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

test("todos los valores ofrecidos por los selectores cumplen el contrato del endpoint", () => {
  for (const model of calendarModels) {
    for (const size of model.sizes) {
      const extras = createCalendarLeadExtras({
        modelId: model.id,
        sizeId: size.id,
        quantity: "200",
      });

      const result = priceRequestPayloadSchema.safeParse({
        ...validContact,
        message: "Solicitud desde landing de calendarios.",
        extras,
      });

      assert.equal(
        result.success,
        true,
        `${model.id}/${size.id} debe ser una combinación válida`,
      );
    }
  }
});

test("el caso DIN A5 de la captura es válido con formatos telefónicos españoles habituales", () => {
  const extras = createCalendarLeadExtras({
    modelId: "sobremesa-wire-o",
    sizeId: "din-a5",
    quantity: "200",
  });

  for (const phone of ["612345678", "612 345 678", "+34 612 345 678", "932 74 98 90"]) {
    const result = priceRequestPayloadSchema.safeParse({
      ...validContact,
      name: "Empresa de prueba",
      email: "persona@example.test",
      phone,
      message: "Solicitud desde landing de calendarios.",
      extras,
      consent: true,
    });

    assert.equal(result.success, true, `${phone} debe ser válido`);
  }

  assert.equal(priceRequestPhoneSchema.safeParse("612.345.678").success, false);
  assert.equal(priceRequestPhoneSchema.safeParse("").success, false);
});

test("cantidad y consentimiento inválidos se rechazan con su campo específico", () => {
  assert.equal(isValidCalendarQuantity(""), true);
  assert.equal(isValidCalendarQuantity("200"), true);
  assert.equal(isValidCalendarQuantity("0"), false);
  assert.equal(isValidCalendarQuantity("1.5"), false);
  assert.equal(isValidCalendarQuantity("10000000"), false);

  const extras = createCalendarLeadExtras({
    modelId: "sobremesa-wire-o",
    sizeId: "din-a5",
    quantity: "0",
  });
  const invalidQuantity = priceRequestPayloadSchema.safeParse({
    ...validContact,
    message: "Solicitud desde landing de calendarios.",
    extras,
  });
  assert.equal(invalidQuantity.success, false);
  if (!invalidQuantity.success) {
    assert.deepEqual(invalidQuantity.error.issues[0]?.path, ["extras", "cantidad"]);
  }

  const invalidConsent = priceRequestPayloadSchema.safeParse({
    ...validContact,
    message: "Solicitud desde landing de calendarios.",
    extras: createCalendarLeadExtras({
      modelId: "sobremesa-wire-o",
      sizeId: "din-a5",
      quantity: "200",
    }),
    consent: false,
  });
  assert.equal(invalidConsent.success, false);
  if (!invalidConsent.success) {
    assert.equal(invalidConsent.error.issues.some(({ path }) => path[0] === "consent"), true);
  }
});

test("una URL larga de Google Ads se normaliza sin perder el payload válido", () => {
  const campaignUrl =
    "https://reprodisseny.com/calendarios/calendarios-corporativos-2027" +
    `?utm_source=google&utm_medium=cpc&utm_campaign=${"calendarios-".repeat(20)}` +
    `&gclid=${"A".repeat(180)}`;
  const sourceUrl = normalizePriceRequestSourceUrl(campaignUrl);

  assert.ok(campaignUrl.length > PRICE_REQUEST_LIMITS.sourceUrlMax);
  assert.equal(sourceUrl.length, PRICE_REQUEST_LIMITS.sourceUrlMax);
  assert.equal(
    priceRequestPayloadSchema.safeParse({
      ...validContact,
      sourceUrl,
      message: "Solicitud desde landing de calendarios.",
      extras: createCalendarLeadExtras({
        modelId: "sobremesa-wire-o",
        sizeId: "din-a5",
        quantity: "200",
      }),
    }).success,
    true,
  );
});
