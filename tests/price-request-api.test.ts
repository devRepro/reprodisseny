import assert from "node:assert/strict";
import test from "node:test";

import { createApp, eventHandler, toWebHandler } from "h3";

import {
  normalizePriceRequestPayloadForTransport,
  type CreatePriceRequestInput,
} from "../shared/schemas/priceRequest";
import { LEAD_TRACKING_LIMITS } from "../shared/tracking/leadTrackingLimits";
import { createPriceRequestApiHandler } from "../server/services/priceRequests/priceRequestApiHandler.server";
import { normalizeServerLeadTracking } from "../server/services/priceRequests/leadTrackingNormalization";

const cleanPayload: CreatePriceRequestInput = {
  name: "Persona de prueba",
  email: "persona@example.test",
  phone: "+34 600 000 000",
  company: "Empresa de prueba",
  message: "Solicitud de presupuesto",
  categorySlug: "presupuesto",
  product: {
    name: "Presupuesto genérico",
    slug: null,
    sku: null,
    url: "/pedir-presupuesto",
  },
  extras: {},
  consent: true,
  sourceUrl: "https://reprodisseny.com/pedir-presupuesto",
  utm: null,
  tracking: null,
};

type HandlerOverrides = Partial<
  Parameters<typeof createPriceRequestApiHandler>[0]
>;

async function callApi(
  payload: unknown,
  overrides: HandlerOverrides = {},
) {
  const capturedInputs: any[] = [];
  const logs: Array<Record<string, unknown>> = [];
  const handler = createPriceRequestApiHandler({
    createPriceRequest: async (_event, input) => {
      capturedInputs.push(input);
      return {
        ok: true,
        duplicated: false,
        itemId: "42",
        requestKey: "request-42",
      };
    },
    getClientIp: () => "127.0.0.1",
    ipHash: () => "safe-ip-hash",
    normalizeTracking: normalizeServerLeadTracking,
    rateLimit: async () => ({ ok: true }),
    createRequestId: () => "req-safe-123",
    logError: (_message, metadata) => logs.push(metadata),
    ...overrides,
  });
  const app = createApp();
  app.use(eventHandler(handler));
  const webHandler = toWebHandler(app);
  const body = new FormData();
  body.append("payload", JSON.stringify(payload));
  const response = await webHandler(
    new Request("https://reprodisseny.test/api/price-requests", {
      method: "POST",
      body,
    }),
  );
  const json = (await response.json()) as Record<string, any>;
  return { response, json, capturedInputs, logs };
}

test("sesión limpia y sesión sin almacenamiento publicitario crean el mismo contacto", async () => {
  const normal = await callApi(cleanPayload);
  const privateSession = await callApi({
    ...cleanPayload,
    utm: null,
    tracking: null,
  });

  assert.equal(normal.response.status, 200);
  assert.equal(privateSession.response.status, 200);
  assert.equal(normal.capturedInputs.length, 1);
  assert.equal(privateSession.capturedInputs.length, 1);
  assert.equal(privateSession.capturedInputs[0].consent, true);
});

test("Google Ads largo llega acotado al mock de SharePoint y conserva IDs permitidos", async () => {
  const gclid = "G".repeat(450);
  const gbraid = "B".repeat(450);
  const wbraid = "W".repeat(450);
  const sourceUrl =
    "https://reprodisseny.com/calendarios/calendarios-corporativos-2027" +
    `?utm_source=google&utm_medium=cpc&utm_campaign=calendarios-2027` +
    `&gclid=${gclid}&gbraid=${gbraid}&wbraid=${wbraid}`;
  const payload = normalizePriceRequestPayloadForTransport({
    ...cleanPayload,
    sourceUrl,
    product: {
      ...cleanPayload.product,
      name: "Calendarios corporativos",
    },
    utm: {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "calendarios-2027",
      gclid,
      gbraid,
      wbraid,
    },
    tracking: {
      context: { formName: "calendar_quote_form" },
      attribution: {
        first: { source: "google", medium: "cpc", gclid, gbraid, wbraid, landingUrl: sourceUrl },
        last: null,
      },
      routeUtm: { gclid, gbraid, wbraid },
      sourceUrl,
      SourceUrl: sourceUrl,
      UtmJson: "X".repeat(100_000),
    },
  });
  const result = await callApi(payload);

  assert.equal(result.response.status, 200);
  assert.equal(result.capturedInputs.length, 1);
  assert.equal(
    result.capturedInputs[0].sourceUrl.length,
    LEAD_TRACKING_LIMITS.sourceUrlMax,
  );
  assert.ok(
    result.capturedInputs[0].tracking.utmJson.length <=
      LEAD_TRACKING_LIMITS.sharePointJsonMax,
  );
  assert.doesNotThrow(() => JSON.parse(result.capturedInputs[0].tracking.utmJson));
  assert.equal(result.capturedInputs[0].tracking.selectedTouch.gclid, gclid);
  assert.equal(result.capturedInputs[0].tracking.selectedTouch.gbraid, gbraid);
  assert.equal(result.capturedInputs[0].tracking.selectedTouch.wbraid, wbraid);
});

test("el peor tracking permitido produce JSON válido compatible con UtmJson", async () => {
  const clickIds = {
    gclid: "G".repeat(LEAD_TRACKING_LIMITS.clickIdMax),
    gbraid: "B".repeat(LEAD_TRACKING_LIMITS.clickIdMax),
    wbraid: "W".repeat(LEAD_TRACKING_LIMITS.clickIdMax),
    fbclid: "F".repeat(LEAD_TRACKING_LIMITS.clickIdMax),
    msclkid: "M".repeat(LEAD_TRACKING_LIMITS.clickIdMax),
  };
  const technicalValue = "T".repeat(LEAD_TRACKING_LIMITS.technicalValueMax);
  const attributionUrl = `https://example.test/${"u".repeat(
    LEAD_TRACKING_LIMITS.attributionUrlMax,
  )}`;
  const payload = normalizePriceRequestPayloadForTransport({
    ...cleanPayload,
    product: {
      ...cleanPayload.product,
      slug: "p".repeat(20_000),
    },
    utm: {
      utm_source: technicalValue,
      utm_medium: technicalValue,
      utm_campaign: technicalValue,
      ...clickIds,
    },
    tracking: {
      context: {
        formName: "f".repeat(LEAD_TRACKING_LIMITS.contextValueMax),
      },
      attribution: {
        first: {
          source: technicalValue,
          medium: technicalValue,
          campaign: technicalValue,
          campaignId: technicalValue,
          landingUrl: attributionUrl,
          referrer: attributionUrl,
          ...clickIds,
        },
        last: null,
      },
      routeUtm: clickIds,
      sourceUrl: attributionUrl,
    },
  });
  const result = await callApi(payload);

  assert.equal(result.response.status, 200);
  assert.ok(
    String(result.capturedInputs[0].product.slug).length <=
      LEAD_TRACKING_LIMITS.technicalValueMax,
  );

  const utmJson = result.capturedInputs[0].tracking.utmJson;
  assert.ok(utmJson.length <= LEAD_TRACKING_LIMITS.sharePointJsonMax);
  const parsed = JSON.parse(utmJson);
  for (const [key, expected] of Object.entries(clickIds)) {
    assert.equal(parsed.selectedTouch[key], expected);
  }
});

test("el endpoint rechaza ProductSlug mayor que su columna antes de SharePoint", async () => {
  const result = await callApi({
    ...cleanPayload,
    product: {
      ...cleanPayload.product,
      slug: "p".repeat(LEAD_TRACKING_LIMITS.technicalValueMax + 1),
    },
  });

  assert.equal(result.response.status, 400);
  assert.equal(result.json.data.errorCode, "PRICE_REQUEST_INVALID");
  assert.equal(result.capturedInputs.length, 0);
});

test("el endpoint rechaza tracking fuera de contrato antes del mock de SharePoint", async () => {
  const result = await callApi({
    ...cleanPayload,
    utm: { gclid: "G".repeat(LEAD_TRACKING_LIMITS.clickIdMax + 1) },
  });

  assert.equal(result.response.status, 400);
  assert.equal(result.json.data.errorCode, "PRICE_REQUEST_INVALID");
  assert.equal(result.capturedInputs.length, 0);
});

test("creación nueva y duplicado mantienen el contrato del endpoint", async () => {
  const created = await callApi(cleanPayload);
  const duplicated = await callApi(cleanPayload, {
    createPriceRequest: async () => ({
      ok: true,
      duplicated: true,
      itemId: "42",
      requestKey: "request-42",
    }),
  });

  assert.deepEqual(
    {
      ok: created.json.ok,
      duplicated: created.json.duplicated,
      itemId: created.json.itemId,
      requestKey: created.json.requestKey,
    },
    { ok: true, duplicated: false, itemId: "42", requestKey: "request-42" },
  );
  assert.equal(duplicated.response.status, 200);
  assert.equal(duplicated.json.ok, true);
  assert.equal(duplicated.json.duplicated, true);
});

test("una creación incompleta se convierte en 500 y no se confirma", async () => {
  const result = await callApi(cleanPayload, {
    createPriceRequest: async () => ({
      ok: true,
      duplicated: false,
      itemId: "",
      requestKey: "request-42",
    }),
  });

  assert.equal(result.response.status, 500);
  assert.equal(result.json.data.errorCode, "PRICE_REQUEST_INTERNAL");
  assert.notEqual(result.json.ok, true);
});

for (const scenario of [
  {
    name: "validación 400",
    expectedStatus: 400,
    expectedCode: "PRICE_REQUEST_INVALID",
    overrides: {},
    payload: { ...cleanPayload, consent: false },
  },
  {
    name: "dependencia 422",
    expectedStatus: 422,
    expectedCode: "PRICE_REQUEST_INVALID",
    overrides: {
      createPriceRequest: async () => {
        throw Object.assign(new Error("invalid"), { statusCode: 422 });
      },
    },
    payload: cleanPayload,
  },
  {
    name: "rate limit 429",
    expectedStatus: 429,
    expectedCode: "PRICE_REQUEST_RATE_LIMITED",
    overrides: { rateLimit: async () => ({ ok: false, retryAfterSec: 30 }) },
    payload: cleanPayload,
  },
  {
    name: "excepción previa a SharePoint 500",
    expectedStatus: 500,
    expectedCode: "PRICE_REQUEST_INTERNAL",
    overrides: {
      normalizeTracking: () => {
        throw new Error("normalization failed");
      },
    },
    payload: cleanPayload,
  },
] as const) {
  test(`${scenario.name} devuelve error seguro y correlacionable`, async () => {
    const result = await callApi(scenario.payload, scenario.overrides);

    assert.equal(result.response.status, scenario.expectedStatus);
    assert.equal(result.response.headers.get("x-request-id"), "req-safe-123");
    assert.equal(result.json.data.errorCode, scenario.expectedCode);
    assert.equal(result.json.data.requestId, "req-safe-123");
    assert.doesNotMatch(JSON.stringify(result.json), /normalization failed|persona@example/i);
  });
}

test("un rechazo de Graph se convierte en 502 sin exponer su mensaje", async () => {
  const graphError = Object.assign(new Error("Graph included a private field value"), {
    statusCode: 400,
    response: {
      status: 400,
      headers: new Headers({ "request-id": "graph-request-456" }),
      _data: {
        error: {
          code: "invalidRequest",
          message: "Graph included persona@example.test in this diagnostic",
        },
      },
    },
  });
  const result = await callApi(cleanPayload, {
    createPriceRequest: async () => {
      throw graphError;
    },
  });

  assert.equal(result.response.status, 502);
  assert.equal(result.json.data.errorCode, "PRICE_REQUEST_UPSTREAM_REJECTED");
  assert.equal(result.json.data.requestId, "req-safe-123");
  assert.doesNotMatch(JSON.stringify(result.json), /private field|persona@example/i);
  assert.equal(result.logs[0].upstreamRequestId, "graph-request-456");
  assert.equal(result.logs[0].upstreamCode, "invalidRequest");
  assert.doesNotMatch(JSON.stringify(result.logs), /private field|persona@example/i);
});
