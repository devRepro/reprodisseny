import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_EXPIRY_DAYS,
  COOKIE_CONSENT_REVISION,
  createCookieConsentConfig,
  createCookieConsentInitializer,
  resolveCookieConsentLanguage,
} from "../config/cookieConsent";
import {
  GOOGLE_CONSENT_DEFAULT,
  GOOGLE_CONSENT_WAIT_FOR_UPDATE_MS,
  GTM_FALLBACK_DELAY_MS,
  createDeferredGtmLoaderScript,
  createGoogleConsentDefaultScript,
  createGoogleConsentUpdater,
  dispatchGoogleConsentUpdate,
  mapCookieConsentToGoogleConsent,
} from "../utils/googleConsent";

const deniedAds = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

function createDeferredGtmEnvironment() {
  type Listener = () => void;
  const listeners = new Map<string, Set<Listener>>();
  const scripts: Array<Record<string, unknown>> = [];
  let fallback: Listener | undefined;
  let fallbackDelay: number | undefined;
  let timeoutCleared = false;

  const windowObject: Record<string, any> = {
    dataLayer: [],
    addEventListener(eventName: string, listener: Listener) {
      const eventListeners = listeners.get(eventName) ?? new Set<Listener>();
      eventListeners.add(listener);
      listeners.set(eventName, eventListeners);
    },
    removeEventListener(eventName: string, listener: Listener) {
      listeners.get(eventName)?.delete(listener);
    },
    setTimeout(callback: Listener, delay: number) {
      fallback = callback;
      fallbackDelay = delay;
      return 1;
    },
    clearTimeout() {
      timeoutCleared = true;
    },
  };

  const documentObject = {
    createElement: () => ({}),
    getElementById: (id: string) => scripts.find((script) => script.id === id),
    head: {
      appendChild(script: Record<string, unknown>) {
        scripts.push(script);
      },
    },
  };

  const run = () =>
    vm.runInNewContext(createDeferredGtmLoaderScript("GTM-TEST123"), {
      window: windowObject,
      document: documentObject,
      encodeURIComponent,
    });

  return {
    run,
    scripts,
    listeners,
    windowObject,
    getFallback: () => fallback,
    getFallbackDelay: () => fallbackDelay,
    wasTimeoutCleared: () => timeoutCleared,
  };
}

test("el default de Consent Mode es conservador y se encola antes de medir", () => {
  const windowObject: { dataLayer?: IArguments[]; gtag?: (...args: unknown[]) => void } = {};
  vm.runInNewContext(createGoogleConsentDefaultScript(), { window: windowObject });

  assert.equal(windowObject.dataLayer?.length, 1);
  const [command, action, state] = Array.from(windowObject.dataLayer![0]);

  assert.equal(command, "consent");
  assert.equal(action, "default");
  assert.deepEqual(JSON.parse(JSON.stringify(state)), {
    ...GOOGLE_CONSENT_DEFAULT,
    wait_for_update: GOOGLE_CONSENT_WAIT_FOR_UPDATE_MS,
  });
});

test("GTM no carga inmediatamente y espera interacción o el fallback", () => {
  const environment = createDeferredGtmEnvironment();

  environment.run();

  assert.equal(environment.scripts.length, 0);
  assert.equal(environment.windowObject.dataLayer.length, 0);
  assert.equal(environment.getFallbackDelay(), GTM_FALLBACK_DELAY_MS);
  assert.deepEqual(
    [...environment.listeners.keys()],
    ["pointerdown", "keydown", "touchstart"],
  );
});

test("GTM carga en la primera interacción y limpia listeners y timeout", () => {
  const environment = createDeferredGtmEnvironment();
  environment.run();

  const pointerListener = [...environment.listeners.get("pointerdown")!][0];
  pointerListener();

  assert.equal(environment.scripts.length, 1);
  assert.equal(environment.scripts[0].id, "gtm-script");
  assert.equal(
    environment.scripts[0].src,
    "https://www.googletagmanager.com/gtm.js?id=GTM-TEST123",
  );
  assert.equal(environment.windowObject.dataLayer.length, 1);
  assert.equal(environment.windowObject.dataLayer[0].event, "gtm.js");
  assert.equal(environment.wasTimeoutCleared(), true);
  assert.equal(
    [...environment.listeners.values()].every((eventListeners) => !eventListeners.size),
    true,
  );
});

test("GTM carga por fallback y nunca se inserta dos veces", () => {
  const environment = createDeferredGtmEnvironment();
  environment.run();

  const keydownListener = [...environment.listeners.get("keydown")!][0];
  const fallback = environment.getFallback();
  assert.ok(fallback);

  fallback();
  keydownListener();
  fallback();

  assert.equal(environment.scripts.length, 1);
  assert.equal(environment.windowObject.dataLayer.length, 1);
});

test("las actualizaciones de consentimiento quedan en dataLayer antes de cargar GTM", () => {
  const environment = createDeferredGtmEnvironment();
  vm.runInNewContext(createGoogleConsentDefaultScript(), {
    window: environment.windowObject,
  });

  const grantedAnalytics = mapCookieConsentToGoogleConsent({
    analytics: true,
    marketing: false,
  });
  assert.equal(
    dispatchGoogleConsentUpdate(grantedAnalytics, environment.windowObject),
    true,
  );

  environment.run();
  [...environment.listeners.get("touchstart")!][0]();

  const queue = environment.windowObject.dataLayer;
  assert.equal(queue.length, 3);
  assert.deepEqual(Array.from(queue[0]).slice(0, 2), ["consent", "default"]);
  assert.deepEqual(Array.from(queue[1]), ["consent", "update", grantedAnalytics]);
  assert.equal(queue[2].event, "gtm.js");
});

test("accept all concede analítica y las tres señales publicitarias", () => {
  assert.deepEqual(
    mapCookieConsentToGoogleConsent({ analytics: true, marketing: true }),
    {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    },
  );
});

test("reject all conserva denegadas las finalidades opcionales", () => {
  assert.deepEqual(
    mapCookieConsentToGoogleConsent({ analytics: false, marketing: false }),
    {
      ...deniedAds,
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    },
  );
});

test("analytics only no concede señales de Google Ads", () => {
  assert.deepEqual(
    mapCookieConsentToGoogleConsent({ analytics: true, marketing: false }),
    {
      ...deniedAds,
      analytics_storage: "granted",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    },
  );
});

test("marketing only concede Ads sin conceder Analytics ni personalización general", () => {
  const state = mapCookieConsentToGoogleConsent({
    analytics: false,
    marketing: true,
  });

  assert.equal(state.analytics_storage, "denied");
  assert.equal(state.ad_storage, "granted");
  assert.equal(state.ad_user_data, "granted");
  assert.equal(state.ad_personalization, "granted");
  assert.equal(state.personalization_storage, "denied");
});

test("los cambios se envían en la misma página y se deduplican por estado", () => {
  const updates: unknown[] = [];
  const update = createGoogleConsentUpdater((state) => {
    updates.push(state);
  });

  assert.equal(update({ analytics: false, marketing: false }), true);
  assert.equal(update({ analytics: false, marketing: false }), false);
  assert.equal(update({ analytics: true, marketing: false }), true);
  assert.equal(update({ analytics: true, marketing: true }), true);
  assert.equal(update({ analytics: false, marketing: false }), true);
  assert.equal(updates.length, 4);
});

test("el dispatcher conserva el contrato gtag consent update", () => {
  const calls: unknown[][] = [];
  const state = mapCookieConsentToGoogleConsent({
    analytics: true,
    marketing: false,
  });

  assert.equal(
    dispatchGoogleConsentUpdate(state, {
      gtag: (...args) => calls.push(args),
    }),
    true,
  );
  assert.deepEqual(calls, [["consent", "update", state]]);
  assert.equal(dispatchGoogleConsentUpdate(state, {}), false);
});

test("la configuración restaura consentimiento y notifica cambios posteriores", () => {
  let syncCount = 0;
  const config = createCookieConsentConfig({
    onConsentChange: () => {
      syncCount += 1;
    },
  });

  config.onConsent?.({ cookie: {} as never });
  assert.equal(syncCount, 1, "onConsent sincroniza una elección persistida");

  config.onChange?.({
    cookie: {} as never,
    changedCategories: ["analytics"],
    changedServices: {},
  });
  assert.equal(syncCount, 2, "onChange sincroniza una revocación sin recarga");
});

test("la inicialización solo ejecuta CookieConsent una vez", async () => {
  let runCount = 0;
  const initialize = createCookieConsentInitializer(async () => {
    runCount += 1;
  });
  const config = createCookieConsentConfig({ onConsentChange: () => undefined });

  const first = initialize(config);
  const second = initialize(config);

  assert.strictEqual(first, second);
  await Promise.all([first, second]);
  assert.equal(runCount, 1);
});

test("la CMP es first-party, versionada, opt-in y solo expone categorías reales", () => {
  const config = createCookieConsentConfig({ onConsentChange: () => undefined });

  assert.equal(config.mode, "opt-in");
  assert.equal(config.revision, COOKIE_CONSENT_REVISION);
  assert.equal(config.manageScriptTags, false);
  assert.equal(config.cookie?.name, COOKIE_CONSENT_COOKIE_NAME);
  assert.equal(config.cookie?.path, "/");
  assert.equal(config.cookie?.sameSite, "Lax");
  assert.equal(config.cookie?.secure, true);
  assert.equal(config.cookie?.expiresAfterDays, COOKIE_CONSENT_EXPIRY_DAYS);
  assert.deepEqual(Object.keys(config.categories), [
    "necessary",
    "analytics",
    "marketing",
  ]);
  assert.equal(config.categories.necessary.readOnly, true);

  const analyticsCookies = config.categories.analytics.autoClear?.cookies ?? [];
  const marketingCookies = config.categories.marketing.autoClear?.cookies ?? [];
  assert.equal(
    analyticsCookies.some(({ name }) => name instanceof RegExp && name.test("_ga_ABC")),
    true,
  );
  assert.equal(
    marketingCookies.some(({ name }) => name instanceof RegExp && name.test("_gcl_au")),
    true,
  );
});

test("las traducciones ES/CA son completas y el idioma real tiene fallback ES", () => {
  const config = createCookieConsentConfig({ onConsentChange: () => undefined });
  const es = config.language.translations.es;
  const ca = config.language.translations.ca;

  assert.equal(typeof es, "object");
  assert.equal(typeof ca, "object");
  assert.ok(typeof es === "object" && es.preferencesModal.sections.length >= 4);
  assert.ok(typeof ca === "object" && ca.preferencesModal.sections.length >= 4);
  assert.equal(config.language.autoDetect, "document");
  assert.equal(resolveCookieConsentLanguage("ca-ES"), "ca");
  assert.equal(resolveCookieConsentLanguage("es"), "es");
  assert.equal(resolveCookieConsentLanguage("en-US"), "es");
  assert.equal(resolveCookieConsentLanguage(undefined), "es");
});

test("el código fuente no conserva el loader legado y usa el loader diferido", async () => {
  const legacyProduct = ["user", "centrics"].join("");
  const legacyHost = ["web.cmp.", legacyProduct, ".eu"].join("");
  const files = [
    "nuxt.config.ts",
    "pages/politica-cookies.vue",
    "plugins/cookie-consent.client.ts",
    "utils/googleConsent.ts",
  ];

  const sources = await Promise.all(files.map((file) => readFile(file, "utf8")));
  for (const source of sources) {
    assert.equal(source.toLowerCase().includes(legacyProduct), false);
    assert.equal(source.includes(legacyHost), false);
  }

  const nuxtConfig = sources[0];
  assert.equal(nuxtConfig.includes("createDeferredGtmLoaderScript(gtmId)"), true);
  assert.equal(nuxtConfig.includes("new Date().getTime(),event:'gtm.js'"), false);
  assert.equal(nuxtConfig.match(/createGoogleConsentDefaultScript\(\)/g)?.length, 1);
  assert.equal(
    sources
      .join("\n")
      .match(/https:\/\/www\.googletagmanager\.com\/gtm\.js/g)?.length,
    1,
  );
});
