import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { toast } from "vue-sonner";
import { useSendContact } from "../composables/useSendContact";
import { createLeadFormTracker } from "../utils/tracking/leadForm";

const payload = {
  nombre: "Persona de prueba", email: "persona@example.test", telefono: "",
  codigoPostal: "08001", consulta: "Consulta de prueba local", consent: true,
  sourceUrl: "/contacto", website: "",
};
const confirmed = {
  ok: true, duplicated: false, item: { id: "42", requestKey: "contact-42" },
};

function setup(t: TestContext, fetch: (...args: any[]) => Promise<unknown>) {
  const runtime = globalThis as Record<string, any>;
  const previous = runtime.$fetch;
  runtime.$fetch = fetch;
  t.after(() => {
    if (previous === undefined) delete runtime.$fetch;
    else runtime.$fetch = previous;
  });
  const notices: string[] = [];
  t.mock.method(toast, "promise", (request: Promise<unknown>, messages: any) => {
    void request.then(
      (value) => { notices.push(typeof messages.success === "function" ? messages.success(value) : messages.success); },
      (error) => { notices.push(messages.error(error)); },
    );
    // Deliberately not a Promise, as in vue-sonner. Awaiting this was the bug.
    return "notification-handle";
  });
  const events: string[] = [];
  const tracker = createLeadFormTracker((event) => { events.push(event); });
  const contact = useSendContact();
  const submit = () => tracker.submitAndTrack(() => contact.sendContact(payload));
  return { contact, notices, events, submit };
}

test("contacto espera HTTP real, bloquea doble envío y confirma/convierta una sola vez", async (t) => {
  let resolve!: (value: unknown) => void;
  let calls = 0;
  const pending = new Promise((done) => { resolve = done; });
  const state = setup(t, async (_url, options) => {
    calls++;
    assert.equal(options.retry, 0);
    return pending;
  });
  const first = state.submit();
  await Promise.resolve();
  assert.equal(state.contact.isLoading.value, true);
  assert.equal(state.contact.success.value, false);
  assert.deepEqual(state.notices, []);
  assert.deepEqual(state.events, []);
  assert.equal(await state.contact.sendContact(payload), null);
  assert.equal(await state.submit(), null);
  assert.equal(calls, 1);
  resolve(confirmed);
  assert.equal((await first)?.itemId, "42");
  assert.equal(state.contact.isLoading.value, false);
  assert.equal(state.contact.success.value, true);
  assert.deepEqual(state.notices, ["Mensaje enviado"]);
  assert.deepEqual(state.events, ["generate_lead"]);
  assert.equal(await state.submit(), null);
  assert.equal(calls, 1);
});

for (const [name, value] of [
  ["rechazo lógico", { ...confirmed, ok: false }],
  ["respuesta incompleta", { ok: true }],
  ["sin identificador", { ...confirmed, item: { requestKey: "key" } }],
  ["sin clave", { ...confirmed, item: { id: "42" } }],
  ["sin estado de duplicado", { ok: true, item: confirmed.item }],
  ["respuesta HTML", "<html>OK</html>"],
]) {
  test(`contacto no confirma ni convierte: ${name}`, async (t) => {
    const state = setup(t, async () => value);
    assert.equal(await state.submit(), null);
    assert.equal(state.contact.success.value, false);
    assert.equal(state.contact.isLoading.value, false);
    assert.ok(state.contact.error.value);
    assert.equal(state.notices.length, 1);
    assert.notEqual(state.notices[0], "Mensaje enviado");
    assert.deepEqual(state.events, []);
  });
}

for (const [name, error] of [
  ["HTTP 503", { statusCode: 503, data: { message: "private upstream data", data: { requestId: "req-safe-123" } } }],
  ["red", new TypeError("private network details")],
]) {
  test(`contacto maneja fallo ${name} sin éxito y permite reintentar`, async (t) => {
    let calls = 0;
    const state = setup(t, async () => {
      if (++calls === 1) throw error;
      return confirmed;
    });
    assert.equal(await state.submit(), null);
    assert.equal(state.contact.success.value, false);
    assert.equal(state.contact.isLoading.value, false);
    assert.doesNotMatch(state.contact.error.value!, /private/);
    if (name === "HTTP 503") assert.match(state.contact.error.value!, /req-safe-123/);
    assert.deepEqual(state.events, []);
    await state.submit();
    assert.equal(state.contact.success.value, true);
    assert.deepEqual(state.events, ["generate_lead"]);
  });
}

test("contacto duplicado se reconoce sin una nueva conversión", async (t) => {
  const state = setup(t, async () => ({ ...confirmed, duplicated: true }));
  assert.equal((await state.submit())?.duplicated, true);
  assert.equal(state.contact.success.value, true);
  assert.deepEqual(state.events, []);
  assert.deepEqual(state.notices, ["La consulta ya estaba registrada"]);
});

test("contacto honeypot no envía, no confirma ni convierte", async (t) => {
  let calls = 0;
  const state = setup(t, async () => { calls++; return confirmed; });
  const tracker = createLeadFormTracker((event) => { state.events.push(event); });
  assert.equal(await tracker.submitAndTrack(() => state.contact.sendContact({ ...payload, website: "filled" })), null);
  assert.equal(calls, 0);
  assert.equal(state.contact.success.value, false);
  assert.deepEqual(state.events, []);
  assert.deepEqual(state.notices, []);
  assert.doesNotMatch(state.contact.error.value!, /spam|bot|website/i);
});

test("contacto bloquea datos inválidos antes del transporte", async (t) => {
  let calls = 0;
  const state = setup(t, async () => { calls++; return confirmed; });
  assert.equal(await state.contact.sendContact({ ...payload, consulta: "corta" }), null);
  assert.equal(calls, 0);
  assert.equal(state.contact.isLoading.value, false);
  assert.equal(state.contact.success.value, false);
});
