import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { resolve, sep, join } from "node:path";
import { fileURLToPath } from "node:url";

// Run after npm run build. Every price-request POST is intercepted in Chrome.
const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const port = 3200 + Math.floor(Math.random() * 1000);
const base = "http://127.0.0.1:" + port;
const server = spawn(process.execPath, [join(repoRoot, ".output/server/index.mjs")], {
  cwd: repoRoot,
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
});
const browserPath = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find(existsSync);
assert.ok(browserPath, "Chrome or Edge is required");
const profile = mkdtempSync(join(tmpdir(), "rd-quote-smoke-"));
const chrome = spawn(browserPath, [
  "--headless=new", "--disable-gpu", "--disable-extensions", "--no-first-run",
  "--no-default-browser-check", "--remote-debugging-port=9338",
  "--user-data-dir=" + profile, "about:blank",
]);
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const wait = async (predicate, label, timeout = 45000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) return;
    await pause(150);
  }
  throw new Error("Timed out: " + label);
};
let ws;
try {
  await wait(async () => {
    try { return (await fetch(base + "/api/ping")).ok; }
    catch { return false; }
  }, "local production server", 30000);
  await wait(async () => {
    try { return (await fetch("http://127.0.0.1:9338/json/version")).ok; }
    catch { return false; }
  }, "Chrome CDP", 20000);
  const target = await (await fetch("http://127.0.0.1:9338/json/new?about:blank", { method: "PUT" })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((yes, no) => { ws.onopen = yes; ws.onerror = no; });
  let callId = 0;
  const pending = new Map();
  const requests = [];
  let mode = "ok";
  let delayMs = 0;
  const send = (method, params = {}) => new Promise((yes, no) => {
    const id = ++callId;
    const timer = setTimeout(() => { pending.delete(id); no(new Error("CDP timeout " + method)); }, 15000);
    pending.set(id, (msg) => { clearTimeout(timer); msg.error ? no(new Error(msg.error.message)) : yes(msg.result); });
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.onmessage = (event) => {
    const msg = JSON.parse(String(event.data));
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method !== "Fetch.requestPaused") return;
    const item = msg.params;
    requests.push(item.request);
    void (async () => {
      if (delayMs) await pause(delayMs);
      if (mode === "network") {
        await send("Fetch.failRequest", { requestId: item.requestId, errorReason: "Failed" });
      } else {
        const status = mode === "error" ? 500 : 200;
        const body = status === 500
          ? { statusCode: 500, message: "Servidor de prueba no disponible" }
          : { ok: true, duplicated: false, itemId: 100 + requests.length, requestKey: "mock-" + requests.length };
        await send("Fetch.fulfillRequest", {
          requestId: item.requestId, responseCode: status,
          responseHeaders: [{ name: "content-type", value: "application/json" }],
          body: Buffer.from(JSON.stringify(body)).toString("base64"),
        });
      }
    })().catch((error) => console.error(error));
  };
  const evalPage = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const nav = async (path, selector) => {
    await send("Page.navigate", { url: base + path });
    await wait(() => evalPage("document.readyState === 'complete' && !!document.querySelector(" + JSON.stringify(selector) + ") && document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false"), path, 60000);
  };
  const fill = (selector, value) => evalPage("(() => { const el = document.querySelector(" + JSON.stringify(selector) + "); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set; setter.call(el, " + JSON.stringify(value) + "); el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); return true; })()");
  const check = (selector) => evalPage("(() => { const el = document.querySelector(" + JSON.stringify(selector) + "); if (!el) return false; el.checked=true; el.dispatchEvent(new Event('change', {bubbles:true})); return true; })()");
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*api/price-requests", requestStage: "Request" }] });

  await nav("/calendarios/calendarios-corporativos-2027", "#calendar_quote_form");
  await evalPage("document.querySelector('.calendar-hero__cta').click()");
  assert.equal(await evalPage("location.hash"), "#quote-form");
  await evalPage("document.querySelector('#calendar_quote_form button[type=submit]').click()");
  await wait(() => evalPage("!!document.querySelector('#calendar-form-error')"), "calendar validation");
  assert.equal(requests.length, 0);
  assert.equal(await fill("#calendar-model", "pared-wire-o"), true);
  await wait(() => evalPage("document.querySelector('#calendar-size option[value=\"din-a4\"]') !== null"), "calendar sizes");
  await fill("#calendar-size", "din-a4");
  await fill("#calendar-name", "Prueba Local");
  await fill("#calendar-email", "local@example.test");
  await fill("#calendar-phone", "+34 600 000 000");
  await check("#calendar-privacy");
  delayMs = 400;
  await evalPage("document.querySelector('#calendar_quote_form button[type=submit]').click(); document.querySelector('#calendar_quote_form button[type=submit]').click()");
  await wait(() => evalPage("location.pathname === '/lp/calendarios/gracias'"), "calendar confirmation");
  assert.equal(requests.length, 1, "double click must make one POST");
  const calendarPayload = JSON.parse(requests[0].postData.split('name="payload"\r\n\r\n')[1].split('\r\n')[0]);
  assert.equal(calendarPayload.extras.cantidad, null);
  delayMs = 0;

  await nav("/pedir-presupuesto", "form");
  await fill("input[name=name]", "Prueba Local");
  await fill("input[name=email]", "local@example.test");
  await fill("input[name=phone]", "+34 600 000 000");
  await fill("textarea[name=message]", "500 folletos comerciales, impresión a color a doble cara");
  await check("input[name=consent]");
  await fill("input[name=website]", "autofilled.example");
  await evalPage("document.querySelector('form button[type=submit]').click()");
  await wait(() => evalPage("!!document.querySelector('form [role=alert]')"), "honeypot warning");
  assert.equal(requests.length, 1, "honeypot must block POST without showing success");
  await fill("input[name=website]", "");
  mode = "error";
  await evalPage("document.querySelector('input[name=phone]').focus()");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: "\r" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await wait(() => requests.length === 2, "keyboard POST");
  await wait(() => evalPage("document.querySelector('form [role=alert]')?.textContent.includes('Servidor de prueba')"), "server error from keyboard submit");
  assert.equal(await evalPage("document.querySelector('textarea[name=message]').value"), "500 folletos comerciales, impresión a color a doble cara");
  await wait(() => evalPage("!document.querySelector('form button[type=submit]').disabled"), "retry enabled after HTTP 500");
  mode = "network";
  await evalPage("document.querySelector('form button[type=submit]').click()");
  await wait(() => requests.length === 3, "network POST");
  await wait(() => evalPage("document.querySelector('form [role=alert]')?.textContent.includes('No hay conexión')"), "network error");
  await wait(() => evalPage("!document.querySelector('form button[type=submit]').disabled"), "retry enabled after network error");
  mode = "ok";
  await evalPage("document.querySelector('form button[type=submit]').click()");
  await wait(() => evalPage("location.pathname === '/gracias'"), "general retry confirmation");
  assert.equal(requests.length, 4, "general error, network failure and retry should each make one POST");

  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await nav("/productos/folletos-plegados-personalizados", "form");
  await fill("input[name=cantidad]", "500");
  await fill("input[name=nombre]", "Prueba Local");
  await fill("input[name=email]", "local@example.test");
  await fill("input[name=telefono]", "+34 600 000 000");
  await check("input[name=privacy]");
  await evalPage("document.querySelector('form button[type=submit]').click()");
  await wait(() => evalPage("!!document.querySelector('.rd-form-frame') && !document.querySelector('.rd-form-frame form')"), "product mobile confirmation");
  assert.equal(requests.length, 5);
  console.log(JSON.stringify({ calendar: "valid, optional quantity, invalid fields, CTA, double click", general: "honeypot, keyboard, HTTP 500, network failure, retained data, retry", product: "valid mobile", postsIntercepted: requests.length }));
} finally {
  ws?.close();
  if (chrome.pid) spawnSync("taskkill", ["/pid", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
  if (server.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  const root = resolve(tmpdir()) + sep;
  if (resolve(profile).startsWith(root)) {
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}
