import assert from "node:assert/strict";
import test from "node:test";

import {
  PRICE_REQUEST_LIMITS,
  priceRequestContactSchema,
  priceRequestPayloadSchema,
} from "../shared/schemas/priceRequest";
import { usePriceRequests } from "../composables/usePriceRequests";
import {
  DATA_LAYER_EVENT_TIMEOUT_MS,
  pushDataLayerEventAndWait,
} from "../utils/tracking/dataLayer";
import { createLeadFormTracker } from "../utils/tracking/leadForm";

type TrackedEvent = {
  event: string;
  payload: Record<string, unknown>;
};

const createdResponse = {
  ok: true as const,
  duplicated: false,
  itemId: "42",
  requestKey: "request-42",
};

const validPriceRequestPayload = {
  name: "Ada Lovelace",
  email: "ada@example.test",
  phone: "+34 600 000 000",
  company: null,
  message: "Solicitud de presupuesto",
  categorySlug: "presupuesto",
  product: { name: "Presupuesto genérico", slug: null, sku: null, url: "/" },
  extras: {},
  consent: true,
  sourceUrl: "/pedir-presupuesto",
  utm: null,
};

function setupTracker() {
  const events: TrackedEvent[] = [];
  const tracker = createLeadFormTracker((event, payload) => {
    events.push({ event, payload });
  });

  return { tracker, events };
}

async function attemptClientSubmit(
  input: Record<string, unknown>,
  send: () => Promise<unknown>,
) {
  const { tracker, events } = setupTracker();
  const parsed = priceRequestContactSchema.safeParse(input);

  if (!parsed.success) {
    tracker.trackValidationError(
      parsed.error.issues.map((issue) => String(issue.path[0] || "form")),
    );
    return { events, postCount: 0 };
  }

  let postCount = 0;
  await tracker.submitAndTrack(async () => {
    postCount += 1;
    return send();
  });

  return { events, postCount };
}

test("caso 1: render sin interacción no inicia ni convierte", () => {
  const { events } = setupTracker();
  assert.deepEqual(events, []);
});

test("casos 2 y 3: la primera interacción humana inicia una sola vez", () => {
  const { tracker, events } = setupTracker();

  assert.equal(
    tracker.trackInteraction({ trusted: false, fieldName: "name", controlType: "text" }),
    false,
  );
  assert.equal(
    tracker.trackInteraction({ trusted: true, fieldName: "name", controlType: "text" }),
    true,
  );
  assert.equal(
    tracker.trackInteraction({ trusted: true, fieldName: "email", controlType: "email" }),
    false,
  );

  assert.deepEqual(events.map(({ event }) => event), ["form_start"]);
});

test("caso 4: teléfono ausente bloquea POST y registra validación", async () => {
  const result = await attemptClientSubmit(
    { name: "Ada Lovelace", email: "ada@example.test", phone: "", consent: true },
    async () => createdResponse,
  );

  assert.equal(result.postCount, 0);
  assert.deepEqual(result.events.map(({ event }) => event), ["form_validation_error"]);
  assert.equal(result.events.some(({ event }) => event === "generate_lead"), false);
});

test("caso 5: teléfono inválido bloquea POST y conversión", async () => {
  const result = await attemptClientSubmit(
    {
      name: "Ada Lovelace",
      email: "ada@example.test",
      phone: "123-abc",
      consent: true,
    },
    async () => createdResponse,
  );

  assert.equal(result.postCount, 0);
  assert.deepEqual(result.events.map(({ event }) => event), ["form_validation_error"]);
});

test("caso 6: creación confirmada produce un POST y una conversión", async () => {
  const result = await attemptClientSubmit(
    {
      name: "Ada Lovelace",
      email: "ada@example.test",
      phone: "+34 600 000 000",
      consent: true,
    },
    async () => createdResponse,
  );

  assert.equal(result.postCount, 1);
  assert.deepEqual(result.events.map(({ event }) => event), ["generate_lead"]);
});

for (const [label, error] of [
  ["caso 7: HTTP 400", new Error("HTTP 400")],
  ["caso 8: HTTP 500", new Error("HTTP 500")],
  ["caso 9: fallo de red", new TypeError("fetch failed")],
] as const) {
  test(`${label} no genera conversión`, async () => {
    const { tracker, events } = setupTracker();

    await assert.rejects(
      tracker.submitAndTrack(async () => {
        throw error;
      }),
      error,
    );

    assert.equal(events.some(({ event }) => event === "generate_lead"), false);
  });
}

for (const [label, firstError] of [
  ["HTTP 400", new Error("HTTP 400")],
  ["HTTP 500", new Error("HTTP 500")],
  ["error de red", new TypeError("fetch failed")],
] as const) {
  test(`retry después de ${label} libera pending y permite un segundo POST`, async () => {
    const { tracker, events } = setupTracker();
    let postCount = 0;

    await assert.rejects(
      tracker.submitAndTrack(async () => {
        postCount += 1;
        throw firstError;
      }),
      firstError,
    );

    const retryResponse = await tracker.submitAndTrack(async () => {
      postCount += 1;
      return createdResponse;
    });

    assert.deepEqual(retryResponse, createdResponse);
    assert.equal(postCount, 2);
    assert.equal(events.filter(({ event }) => event === "generate_lead").length, 1);
  });
}

test("usePriceRequests libera requestInFlight e isLoading después de un error", async () => {
  const runtime = globalThis as Record<string, any>;
  const previousFetch = runtime.$fetch;
  const previousUseNotify = runtime.useNotify;
  let postCount = 0;

  runtime.useNotify = () => ({ show: () => undefined });
  runtime.$fetch = async () => {
    postCount += 1;
    if (postCount === 1) throw new TypeError("fetch failed");
    return createdResponse;
  };

  try {
    const requests = usePriceRequests();

    await assert.rejects(
      requests.sendPriceRequest(validPriceRequestPayload),
      new TypeError("fetch failed"),
    );
    assert.equal(requests.isLoading.value, false);

    const retryResponse = await requests.sendPriceRequest(validPriceRequestPayload);

    assert.deepEqual(retryResponse, createdResponse);
    assert.equal(postCount, 2);
    assert.equal(requests.isLoading.value, false);
  } finally {
    if (previousFetch) runtime.$fetch = previousFetch;
    else delete runtime.$fetch;

    if (previousUseNotify) runtime.useNotify = previousUseNotify;
    else delete runtime.useNotify;
  }
});

test("usePriceRequests normaliza una URL larga antes de validar y hacer el POST", async () => {
  const runtime = globalThis as Record<string, any>;
  const previousFetch = runtime.$fetch;
  const previousUseNotify = runtime.useNotify;
  const campaignUrl =
    "https://reprodisseny.com/calendarios/calendarios-corporativos-2027" +
    `?utm_source=google&utm_medium=cpc&utm_campaign=${"calendarios-".repeat(20)}` +
    `&gclid=${"A".repeat(180)}`;
  let postCount = 0;
  let sentSourceUrl = "";

  runtime.useNotify = () => ({ show: () => undefined });
  runtime.$fetch = async (_endpoint: string, options: { body: FormData }) => {
    postCount += 1;
    const sentPayload = JSON.parse(
      String(options.body.get("payload")),
    ) as Record<string, unknown>;
    sentSourceUrl = String(sentPayload.sourceUrl);
    return createdResponse;
  };

  try {
    const requests = usePriceRequests();
    const response = await requests.sendPriceRequest({
      ...validPriceRequestPayload,
      sourceUrl: campaignUrl,
    });

    assert.deepEqual(response, createdResponse);
    assert.equal(postCount, 1);
    assert.equal(sentSourceUrl.length, PRICE_REQUEST_LIMITS.sourceUrlMax);
  } finally {
    if (previousFetch) runtime.$fetch = previousFetch;
    else delete runtime.$fetch;

    if (previousUseNotify) runtime.useNotify = previousUseNotify;
    else delete runtime.useNotify;
  }
});

for (const scenario of [
  {
    statusCode: 400,
    errorCode: "PRICE_REQUEST_INVALID",
    expected: "Revisa los campos de la solicitud antes de enviarla.",
  },
  {
    statusCode: 422,
    errorCode: "PRICE_REQUEST_INVALID",
    expected: "Revisa los campos de la solicitud antes de enviarla.",
  },
  {
    statusCode: 429,
    errorCode: "PRICE_REQUEST_RATE_LIMITED",
    expected: "Has realizado demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  },
  {
    statusCode: 500,
    errorCode: "PRICE_REQUEST_INTERNAL",
    expected: "No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al +34 932 749 890. Referencia: req-safe-123.",
  },
] as const) {
  test(`usePriceRequests traduce HTTP ${scenario.statusCode} sin mostrar Server Error`, async () => {
    const runtime = globalThis as Record<string, any>;
    const previousFetch = runtime.$fetch;
    const previousUseNotify = runtime.useNotify;
    const fetchError = Object.assign(new Error("Server Error"), {
      statusCode: scenario.statusCode,
      statusMessage: "Server Error",
      data: {
        statusCode: scenario.statusCode,
        statusMessage: "Server Error",
        data: {
          errorCode: scenario.errorCode,
          requestId: "req-safe-123",
        },
      },
    });

    runtime.useNotify = () => ({ show: () => undefined });
    runtime.$fetch = async () => {
      throw fetchError;
    };

    try {
      const requests = usePriceRequests();
      await assert.rejects(requests.sendPriceRequest(validPriceRequestPayload));
      assert.equal(requests.error.value, scenario.expected);
      assert.doesNotMatch(requests.error.value || "", /server error/i);
    } finally {
      if (previousFetch) runtime.$fetch = previousFetch;
      else delete runtime.$fetch;

      if (previousUseNotify) runtime.useNotify = previousUseNotify;
      else delete runtime.useNotify;
    }
  });
}

test("caso 10: doble submit concurrente hace un POST y una conversión", async () => {
  const { tracker, events } = setupTracker();
  let resolveRequest!: (value: typeof createdResponse) => void;
  let postCount = 0;
  const request = new Promise<typeof createdResponse>((resolve) => {
    resolveRequest = resolve;
  });
  const send = async () => {
    postCount += 1;
    return request;
  };

  const first = tracker.submitAndTrack(send);
  const second = tracker.submitAndTrack(send);
  resolveRequest(createdResponse);
  await Promise.all([first, second]);

  assert.equal(postCount, 1);
  assert.equal(events.filter(({ event }) => event === "generate_lead").length, 1);
});

test("la navegación puede esperar a que GTM procese generate_lead", async () => {
  let releaseTracking!: () => void;
  let submissionResolved = false;
  let postCount = 0;
  const events: Array<{ event: string; waitForTags: boolean }> = [];
  const tracker = createLeadFormTracker((event, _payload, options) => {
    events.push({ event, waitForTags: options?.waitForTags === true });
    if (!options?.waitForTags) return;

    return new Promise<void>((resolve) => {
      releaseTracking = resolve;
    });
  });

  const submission = tracker
    .submitAndTrack(async () => {
      postCount += 1;
      return createdResponse;
    }, { waitForTracking: true })
    .then(() => {
      submissionResolved = true;
    });

  await Promise.resolve();
  const repeatedSubmit = await tracker.submitAndTrack(async () => {
    postCount += 1;
    return createdResponse;
  }, { waitForTracking: true });

  assert.equal(submissionResolved, false);
  assert.equal(repeatedSubmit, null);
  assert.equal(postCount, 1);
  assert.deepEqual(events, [{ event: "generate_lead", waitForTags: true }]);

  releaseTracking();
  await submission;
  assert.equal(submissionResolved, true);
});

test("el evento con espera incorpora callback y timeout sin duplicar el push", async () => {
  let timeoutCallback!: () => void;
  let clearedTimeout: number | null = null;
  const target = {
    dataLayer: [] as Record<string, unknown>[],
    setTimeout(callback: () => void, timeout: number) {
      assert.equal(timeout, DATA_LAYER_EVENT_TIMEOUT_MS);
      timeoutCallback = callback;
      return 7;
    },
    clearTimeout(timeoutId: number) {
      clearedTimeout = timeoutId;
    },
  };

  const delivery = pushDataLayerEventAndWait(target, {
    event: "generate_lead",
    lead_type: "quote_request",
  });
  const pushed = target.dataLayer[0];

  assert.equal(target.dataLayer.length, 1);
  assert.equal(pushed.event, "generate_lead");
  assert.equal(pushed.eventTimeout, DATA_LAYER_EVENT_TIMEOUT_MS);
  assert.equal(typeof pushed.eventCallback, "function");

  (pushed.eventCallback as () => void)();
  assert.equal(await delivery, "processed");
  assert.equal(clearedTimeout, 7);

  timeoutCallback();
  assert.equal(target.dataLayer.length, 1);
});

test("caso 11: form_validation_error solo contiene metadatos técnicos", () => {
  const { tracker, events } = setupTracker();
  tracker.trackValidationError([
    "phone",
    "email",
    "phone",
    "website",
    "ada@example.test",
  ]);

  assert.deepEqual(events[0], {
    event: "form_validation_error",
    payload: {
      error_type: "client_validation",
      invalid_field_count: 2,
      invalid_fields: ["email", "phone"],
    },
  });
  assert.equal(JSON.stringify(events[0]).includes("ada@example.test"), false);
});

test("caso 12: generate_lead no contiene PII ni identificadores de CRM", () => {
  const { tracker, events } = setupTracker();
  tracker.trackConversion(createdResponse);
  tracker.trackConversion(createdResponse);

  assert.deepEqual(events, [
    {
      event: "generate_lead",
      payload: { lead_type: "quote_request" },
    },
  ]);
  assert.equal(JSON.stringify(events).includes("request-42"), false);
});

test("el schema compartido del payload aplica el mismo contrato del endpoint", () => {
  assert.equal(
    priceRequestPayloadSchema.safeParse(validPriceRequestPayload).success,
    true,
  );
  assert.equal(
    priceRequestPayloadSchema.safeParse({
      ...validPriceRequestPayload,
      phone: null,
    }).success,
    false,
  );
});

test("respuestas duplicadas o incompletas no son conversiones", () => {
  const { tracker, events } = setupTracker();

  tracker.trackConversion({ ...createdResponse, duplicated: true });
  tracker.trackConversion({ ok: true });
  tracker.trackConversion(null);

  assert.deepEqual(events, []);
});
