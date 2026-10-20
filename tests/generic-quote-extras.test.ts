import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { sanitizeGenericQuoteExtras } from "../server/services/priceRequests/genericQuoteExtras";

test("el presupuesto genérico conserva sólo sus extras opcionales permitidos", () => {
  assert.deepEqual(
    sanitizeGenericQuoteExtras("presupuesto-generico", {
      productType: "publicaciones",
      needAdvice: true,
      injectedField: "discard",
      page: "pedir-presupuesto",
    }),
    {
      productType: "publicaciones",
      needAdvice: true,
    },
  );
});

test("el saneamiento no admite valores inventados ni afecta a productos CMS", () => {
  assert.deepEqual(
    sanitizeGenericQuoteExtras("presupuesto-generico", {
      productType: "valor-no-permitido",
      needAdvice: "true",
    }),
    {},
  );
  assert.deepEqual(
    sanitizeGenericQuoteExtras("producto-cms", {
      productType: "publicaciones",
      needAdvice: true,
    }),
    {},
  );
});

test("el servicio incorpora los extras saneados antes de crear el registro", async () => {
  const source = await readFile(
    new URL(
      "../server/services/priceRequests/priceRequestService.server.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /Object\.assign\(extrasClean, sanitizeGenericQuoteExtras\(/);
});
