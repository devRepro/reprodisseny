import assert from "node:assert/strict";
import test from "node:test";

import { redirectRouteRules } from "../redirect-rules.generated";
import { LEGACY_GONE_PATHS } from "../shared/seo/legacyRedirects";

type Rule = { redirect: { to: string; statusCode: number } };
const rules: Record<string, Rule> = redirectRouteRules;

function assertDirectRedirect(from: string, to: string) {
  assert.deepEqual(rules[from], { redirect: { to, statusCode: 301 } });
  assert.equal(rules[to], undefined, `redirect chain detected at ${to}`);
}

test("bloc notes legacy base and estimate variant redirect directly", () => {
  const destination = "/productos/blocs-notas";
  assertDirectRedirect("/product/bloc-notas-presupuesto", destination);
  assertDirectRedirect("/product/bloc-notas-presupuesto/printestimate", destination);
});

test("approved legacy base URLs redirect directly like their estimate variants", () => {
  const approvedRedirects = {
    "/product/calendario-de-mesa-7-21x10": "/productos/calendarios-personalizados",
    "/product/calendario-pared-espiral": "/productos/calendarios-personalizados",
    "/product/imprimir-tarjeta-de-citas-presupuesto": "/productos/tarjetas-de-visita-personalizadas",
  };

  for (const [base, destination] of Object.entries(approvedRedirects)) {
    assertDirectRedirect(base, destination);
    assertDirectRedirect(`${base}/printestimate`, destination);
  }
});

test("legacy URLs without an equivalent remain classified as gone", () => {
  const gone = "/product/plantilla-tarjeta-3";
  assert.ok(LEGACY_GONE_PATHS.includes(gone));
  assert.equal(rules[gone], undefined);
});
