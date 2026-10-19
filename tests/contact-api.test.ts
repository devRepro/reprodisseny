import assert from "node:assert/strict";
import test from "node:test";
import { createApp, eventHandler, toWebHandler } from "h3";
import { createContactApiHandler } from "../server/services/priceRequests/contactApiHandler.server";
import { normalizeServerLeadTracking } from "../server/services/priceRequests/leadTrackingNormalization";
import { contactFormSchema } from "../shared/schemas/contact";

const payload = {
  nombre: " Persona de prueba ", email: "persona@example.test", telefono: "+34 600 000 000",
  codigoPostal: "08001", consulta: " Consulta de prueba local ", consent: true,
  sourceUrl: "https://reprodisseny.test/contacto",
};
const created = { ok: true, duplicated: false, itemId: "42", requestKey: "contact-42" };
type Overrides = Partial<Parameters<typeof createContactApiHandler>[0]>;

async function callApi(body: unknown, overrides: Overrides = {}) {
  const inputs: any[] = [];
  const logs: Record<string, unknown>[] = [];
  const app = createApp();
  app.use(eventHandler(createContactApiHandler({
    createPriceRequest: async (_event, input) => { inputs.push(input); return created; },
    getClientIp: () => "127.0.0.1",
    ipHash: () => "test-hash",
    rateLimit: async () => ({ ok: true }),
    normalizeTracking: normalizeServerLeadTracking,
    createRequestId: () => "req-contact-123",
    logError: (_message, data) => { logs.push(data); },
    ...overrides,
  })));
  const response = await toWebHandler(app)(new Request("https://reprodisseny.test/api/cms/contact", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  }));
  return { response, json: await response.json() as any, inputs, logs };
}

test("API contacto confirma 201 con identificadores y normaliza el contenido", async () => {
  const { response, json, inputs } = await callApi(payload);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("x-request-id"), "req-contact-123");
  assert.deepEqual(json.item, { id: "42", requestKey: "contact-42" });
  assert.equal(json.duplicated, false);
  assert.equal(inputs[0].name, "Persona de prueba");
  assert.equal(inputs[0].message, "Consulta de prueba local");
  assert.equal(inputs[0].extras.postalCode, "08001");
});

test("API contacto conserva duplicados y aliases legacy", async () => {
  const result = await callApi({ ...payload, codigoPostal: undefined, cp: "08002", consulta: undefined, comentario: "Mensaje legacy de prueba", company: "Empresa de prueba" });
  assert.equal(result.response.status, 201);
  assert.equal(result.inputs[0].extras.postalCode, "08002");
  assert.equal(result.inputs[0].company, "Empresa de prueba");
  const duplicate = await callApi(payload, { createPriceRequest: async () => ({ ...created, duplicated: true }) });
  assert.equal(duplicate.response.status, 200);
  assert.equal(duplicate.json.duplicated, true);
});

for (const invalid of [
  { nombre: "  " }, { nombre: "x".repeat(121) }, { email: "invalid" },
  { telefono: "abc" }, { codigoPostal: "1234" }, { consulta: "corta" },
  { consulta: "Origen: texto técnico suficiente" }, { consent: false }, { consent: "true" },
]) {
  test(`cliente y API rechazan ${JSON.stringify(Object.keys(invalid))}: ${Object.values(invalid)[0]}`, async () => {
    const input = { ...payload, ...invalid };
    assert.equal(contactFormSchema.safeParse(input).success, false);
    const result = await callApi(input);
    assert.equal(result.response.status, 400);
    assert.equal(result.inputs.length, 0);
    assert.equal(result.json.data.requestId, "req-contact-123");
    assert.doesNotMatch(JSON.stringify(result.logs), /persona@example|Consulta de prueba/);
  });
}

test("API contacto honeypot es neutro y no registra una solicitud", async () => {
  const result = await callApi({ ...payload, website: "filled" });
  assert.equal(result.response.status, 200);
  assert.equal(result.json.ok, false);
  assert.equal(result.json.item, undefined);
  assert.equal(result.inputs.length, 0);
  assert.doesNotMatch(result.json.message, /spam|bot|website/i);
});

for (const value of [{ ...created, ok: false }, { ...created, itemId: "" }, { ...created, requestKey: "" }, { ok: true }, null]) {
  test(`API contacto rechaza confirmación incompleta ${JSON.stringify(value)}`, async () => {
    const result = await callApi(payload, { createPriceRequest: async () => value });
    assert.equal(result.response.status, 500);
    assert.equal(result.json.ok, undefined);
    assert.equal(result.json.data.requestId, "req-contact-123");
  });
}

test("API contacto limita frecuencia sin crear solicitud", async () => {
  const result = await callApi(payload, { rateLimit: async () => ({ ok: false, retryAfterSec: 60 }) });
  assert.equal(result.response.status, 429);
  assert.equal(result.response.headers.get("retry-after"), "60");
  assert.equal(result.inputs.length, 0);
});

for (const status of [400, 401, 403, 429, 500]) {
  test(`API contacto oculta datos externos de HTTP ${status} y conserva correlación`, async () => {
    const result = await callApi(payload, { createPriceRequest: async () => {
      throw Object.assign(new Error("private-token persona@example.test"), {
        response: { status, headers: new Headers({ "request-id": "upstream-123" }),
          _data: { error: { code: "AccessDenied", message: "private-token persona@example.test" } } },
      });
    } });
    assert.equal(result.response.status, [401, 403, 429].includes(status) ? 503 : 502);
    assert.doesNotMatch(JSON.stringify([result.json, result.logs]), /private-token|persona@example/);
    assert.equal(result.logs[0].upstreamRequestId, "upstream-123");
    assert.equal(result.logs[0].upstreamStatus, status);
    assert.equal(result.json.data.requestId, "req-contact-123");
  });
}
