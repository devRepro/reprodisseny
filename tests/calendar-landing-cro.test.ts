import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createCalendarLeadExtras,
  isValidCalendarSelection,
} from "../shared/data/calendarProducts";
import { priceRequestPayloadSchema } from "../shared/schemas/priceRequest";
import { createLeadFormTracker } from "../utils/tracking/leadForm";

const landing = await readFile(
  new URL("../pages/calendarios/calendarios-corporativos-2027.vue", import.meta.url),
  "utf8",
);
const form = await readFile(
  new URL("../components/marketing/landing/CalendarQuoteForm.vue", import.meta.url),
  "utf8",
);
const landingLayout = await readFile(
  new URL("../layouts/landing.vue", import.meta.url),
  "utf8",
);
const calendarThankYou = await readFile(
  new URL("../pages/lp/calendarios/gracias.vue", import.meta.url),
  "utf8",
);
const genericThankYou = await readFile(
  new URL("../pages/gracias.vue", import.meta.url),
  "utf8",
);
const solarLanding = await readFile(
  new URL("../pages/lp/laminas-solares.vue", import.meta.url),
  "utf8",
);
const genericQuoteForm = await readFile(
  new URL("../components/marketing/quote/FormSection.vue", import.meta.url),
  "utf8",
);

const template = landing.slice(
  landing.indexOf("<template>"),
  landing.indexOf("<style scoped>"),
);

function count(source: string, pattern: RegExp) {
  return source.match(pattern)?.length ?? 0;
}

function assertSourceOrder(source: string, markers: string[]) {
  let previousIndex = -1;

  for (const marker of markers) {
    const index = source.indexOf(marker);
    assert.ok(index >= 0, `No se encontró el marcador: ${marker}`);
    assert.ok(index > previousIndex, `${marker} está fuera de orden`);
    previousIndex = index;
  }
}

test("la landing mantiene el orden CRO y renderiza un único formulario tras los modelos", () => {
  assertSourceOrder(template, [
    "calendar-hero",
    "calendar-problems-title",
    "calendar-guarantees-title",
    "calendar-promo",
    "calendar-models-title",
    'id="solicitar-presupuesto"',
    "calendar-process-title",
    "calendar-seo-support-title",
    "calendar-why-title",
    "<ClientLogosBand",
    "<LandingFaqs",
  ]);

  assert.equal(count(template, /<CalendarQuoteForm\b/g), 1);
  assert.equal(count(template, /id="solicitar-presupuesto"/g), 1);
  assert.doesNotMatch(template, /id="quote-form"/);
});

test("todos los CTA de la landing apuntan al ancla estable y compensan la cabecera fija", () => {
  assert.equal(count(template, /href="#solicitar-presupuesto"/g), 2);
  assert.equal(count(template, /@click\.prevent="scrollToQuote"/g), 2);
  assert.match(landing, /document\.querySelector\("#solicitar-presupuesto"\)/);
  assert.match(landing, /\.calendar-form-section\s*\{[\s\S]*?scroll-margin-top:\s*84px/);
  assert.match(
    landingLayout,
    /document\.querySelector\("#solicitar-presupuesto, #quote-form"\)/,
  );
});

test("las tarjetas seleccionan el modelo, lo sincronizan con el formulario y conservan controles accesibles", () => {
  assert.match(
    template,
    /<button[\s\S]*?v-for="model in modelCards"[\s\S]*?:aria-pressed="selectedModelId === model\.id"[\s\S]*?@click="selectCalendarModel\(model\.id\)"/,
  );
  assert.match(
    landing,
    /function selectCalendarModel\(modelId: string\)\s*\{\s*selectedModelId\.value = modelId;\s*scrollToQuote\(\);\s*\}/,
  );
  assert.match(template, /:preselected-model-id="selectedModelId"/);
  assert.match(template, /@model-change="selectedModelId = \$event"/);
  assert.match(
    form,
    /watch\([\s\S]*?props\.preselectedModelId[\s\S]*?form\.modelId = model\.id;[\s\S]*?resetIncompatibleSize\(\);/,
  );
  const preselectionWatcher = form.slice(
    form.indexOf("watch("),
    form.indexOf("function controlClass"),
  );
  assert.doesNotMatch(
    preselectionWatcher,
    /form\.(?:quantity|nameOrCompany|email|phone|privacy)\s*=/,
  );
  assert.equal(isValidCalendarSelection("sobremesa-triangular", "15x15"), true);
  assert.equal(isValidCalendarSelection("sobremesa-triangular", "din-a3"), false);
});

test("el formulario conserva los campos obligatorios y no convierte cantidad en obligatoria", () => {
  for (const field of ["modelId", "sizeId", "nameOrCompany", "email", "phone", "privacy"]) {
    const control = form.match(
      new RegExp(`<(?:input|select)[^>]*name="${field}"[^>]*>`),
    )?.[0];
    assert.ok(control, `No se encontró el control ${field}`);
    assert.match(control, /\srequired(?:\s|\n|>)/);
  }
  const quantityControl = form.match(/<input[^>]*name="quantity"[^>]*>/)?.[0];
  assert.ok(quantityControl);
  assert.doesNotMatch(quantityControl, /\srequired(?:\s|\n|>)/);

  const extras = createCalendarLeadExtras({
    modelId: "sobremesa-triangular",
    sizeId: "15x15",
    quantity: "",
  });
  assert.ok(extras);

  const validPayload = {
    name: "Empresa de prueba",
    email: "equipo@example.test",
    phone: "+34 600 000 000",
    company: "Empresa de prueba",
    message: "Solicitud de prueba local",
    categorySlug: "material-oficina",
    product: {
      name: "Calendarios corporativos",
      slug: "calendarios-personalizados",
      sku: null,
      url: "/calendarios/calendarios-corporativos-2027",
    },
    extras,
    consent: true,
    sourceUrl: "/calendarios/calendarios-corporativos-2027",
    utm: null,
  };

  assert.equal(priceRequestPayloadSchema.safeParse(validPayload).success, true);
  assert.equal(
    priceRequestPayloadSchema.safeParse({ ...validPayload, phone: "" }).success,
    false,
  );
  assert.equal(
    priceRequestPayloadSchema.safeParse({ ...validPayload, consent: false }).success,
    false,
  );
  assert.equal(
    priceRequestPayloadSchema.safeParse({
      ...validPayload,
      extras: { ...extras, calendarSizeId: "din-a3", tamano: "DIN A3" },
    }).success,
    false,
  );
});

test("los errores de validación se muestran junto al campo y desplazan el foco", () => {
  assert.match(form, /import \{ computed, nextTick, reactive, ref, watch \} from "vue"/);
  assert.match(form, /control\.focus\(\{ preventScroll: true \}\)/);
  assert.match(
    form,
    /control\.scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/,
  );

  for (const field of ["model", "size", "quantity", "name", "email", "phone", "privacy"]) {
    assert.match(form, new RegExp(`aria-describedby="[^"]*calendar-${field}-error`));
    assert.match(form, new RegExp(`id="calendar-${field}-error"`));
  }

  assert.match(form, /Introduce un teléfono válido\./);
  assert.match(form, /Debes aceptar la política de privacidad\./);
});

test("solo una creación confirmada genera conversión y los errores o duplicados no convierten", async () => {
  const events: string[] = [];
  const tracker = createLeadFormTracker((event) => {
    events.push(event);
  });
  const createdResponse = {
    ok: true as const,
    duplicated: false,
    itemId: "calendar-test-1",
    requestKey: "calendar-request-test-1",
  };

  await assert.rejects(
    tracker.submitAndTrack(async () => {
      throw new Error("fallo simulado");
    }),
    /fallo simulado/,
  );
  await tracker.submitAndTrack(async () => ({ ...createdResponse, duplicated: true }));
  await tracker.submitAndTrack(async () => createdResponse);
  tracker.trackConversion(createdResponse);

  assert.deepEqual(events, ["generate_lead"]);
  assert.match(form, /leadTracking\.submitAndTrack\(/);
  assert.match(form, /\{ waitForTracking: true \}/);
  assert.ok(form.indexOf("leadTracking.submitAndTrack") < form.lastIndexOf("await navigateTo"));
});

test("la página de gracias no vuelve a registrar conversiones al recargarse", () => {
  assert.doesNotMatch(calendarThankYou, /generate_lead|thankYouConversion/);
  assert.doesNotMatch(genericThankYou, /generate_lead|thankYouConversion/);
  assert.doesNotMatch(form, /conversion:\s*["']calendar_quote["']/);
});

test("el cambio del layout conserva el formulario y CTA de la landing solar", () => {
  assert.match(solarLanding, /id="quote-form"/);
  assert.match(solarLanding, /document\.querySelector\("#quote-form"\)/);
  assert.match(
    landingLayout,
    /document\.querySelector\("#solicitar-presupuesto, #quote-form"\)/,
  );
  assert.match(genericQuoteForm, /leadTracking\.submitAndTrack\(/);
  assert.match(genericQuoteForm, /path:\s*"\/gracias"/);
});

test("el formulario conserva el comportamiento responsive existente", () => {
  assert.match(form, /max-w-\[560px\]/);
  assert.match(form, /<AppButton[\s\S]*?type="submit"[\s\S]*?block/);
  assert.match(landing, /\.calendar-page\s*\{[\s\S]*?overflow-x:\s*clip/);
  assert.match(
    landing,
    /@media \(max-width: 639px\)[\s\S]*?\.calendar-models-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  );
});

test("se conserva el contenido SEO y se actualiza únicamente la promesa del formulario", () => {
  assert.match(landing, /useSeoMeta\(/);
  assert.match(landing, /rel:\s*"canonical"/);
  assert.match(template, /<h1\b/);
  assert.match(landing, /"@type":\s*"FAQPage"/);
  assert.match(
    template,
    /Cuéntanos qué necesitas y te prepararemos un presupuesto personalizado, sin compromiso/,
  );
  assert.doesNotMatch(template, /Recibirás tu presupuesto en pocos minutos/);
});
