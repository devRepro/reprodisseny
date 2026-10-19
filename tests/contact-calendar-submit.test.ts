import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { createLeadFormTracker } from "../utils/tracking/leadForm";

// Execute the actual SFC submit handler with simulated collaborators, without
// mounting a browser or allowing HTTP calls. AST extraction preserves its flow.
async function loadSubmit(path: string, bindings: Record<string, unknown>) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const script = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)![1];
  const ast = ts.createSourceFile(path, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statement = ast.statements.find((node) =>
    (ts.isFunctionDeclaration(node) && node.name?.text === "onSubmit") ||
    (ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) =>
      ts.isIdentifier(declaration.name) && declaration.name.text === "onSubmit")));
  assert.ok(statement, "SFC submit handler must exist");
  const code = ts.transpileModule(statement.getText(ast), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  return new Function(...Object.keys(bindings), `${code}\nreturn onSubmit;`)(...Object.values(bindings));
}

test("calendarios: honeypot no llama al transporte, navegación ni conversión", async () => {
  const calls: string[] = [];
  const error = { value: null as string | null };
  const onSubmit = await loadSubmit("../components/marketing/landing/CalendarQuoteForm.vue", {
    isLoading: { value: false }, error,
    clearValidation: () => undefined,
    cleanString: (value: string) => value.trim(),
    form: { website: " filled " },
    validateForm: () => { calls.push("validation"); throw new Error("unexpected validation"); },
    navigateTo: () => { calls.push("navigation"); },
    sendPriceRequest: () => { calls.push("HTTP"); },
    leadTracking: { submitAndTrack: () => { calls.push("conversion"); } },
  });
  await onSubmit();
  assert.deepEqual(calls, []);
  assert.equal(error.value, "No hemos podido enviar la solicitud. Inténtalo de nuevo.");
});

const values = {
  nombre: "Persona de prueba", email: "persona@example.test", telefono: "",
  codigoPostal: "", consulta: "Consulta local de prueba", consent: true, website: "",
};
const confirmed = { ok: true, duplicated: false, itemId: "42", requestKey: "contact-42" };

for (const result of [confirmed, { ...confirmed, duplicated: true }, null]) {
  test(`contacto: navegación y conversión dependen de confirmación ${result?.duplicated ?? "fallida"}`, async () => {
    const calls: string[] = [];
    const success = { value: false };
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => { finish = resolve; });
    const tracker = createLeadFormTracker(async (event) => { calls.push(event); });
    const onSubmit = await loadSubmit("../components/marketing/contact/ContactForm.vue", {
      handleSubmit: (handler: unknown) => handler,
      isLoading: { value: false }, success,
      tracking: { getTrackingPayloadForLead: () => ({}) },
      getTrackingContext: () => ({}),
      route: { fullPath: "/contacto" },
      leadTracking: tracker,
      sendContact: async () => {
        calls.push("HTTP");
        await pending;
        success.value = Boolean(result);
        return result;
      },
      navigateTo: async (target: unknown) => {
        assert.deepEqual(target, { path: "/gracias", query: { kind: "contacto" } });
        calls.push("navigation");
      },
    });
    const first = onSubmit(values);
    await Promise.resolve();
    await onSubmit(values);
    assert.deepEqual(calls, ["HTTP"]);
    finish();
    await first;
    assert.deepEqual(calls, result
      ? result.duplicated ? ["HTTP", "navigation"] : ["HTTP", "generate_lead", "navigation"]
      : ["HTTP"]);
  });
}
