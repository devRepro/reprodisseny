import assert from "node:assert/strict";
import test from "node:test";

import { redirectRouteRules } from "../redirect-rules.generated";
import {
  LEGACY_GONE_PATHS,
  MANUAL_LEGACY_REDIRECTS,
  PRINT_ESTIMATE_DESTINATION_EXCEPTIONS,
} from "../shared/seo/legacyRedirects";

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

test("confirmed exhibitor and Velleda base URLs match their estimate variants", () => {
  const confirmedRedirects = {
    "/product/expositor-de-mesa-peana-presupuesto":
      "/productos/expositores-de-mesa-personalizados",
    "/product/expositores-de-mostrador-presupuesto":
      "/productos/expositores-de-mesa-personalizados",
    "/product/pizara-velleda-presupuesto": "/productos/pizarras-a-medida",
  };

  for (const [base, destination] of Object.entries(confirmedRedirects)) {
    assertDirectRedirect(base, destination);
    assertDirectRedirect(`${base}/printestimate`, destination);
  }
});

test("base and printestimate destinations match unless explicitly documented", () => {
  const exceptions = PRINT_ESTIMATE_DESTINATION_EXCEPTIONS as Record<string, string>;

  for (const [from, rule] of Object.entries(rules)) {
    if (!from.endsWith("/printestimate")) continue;

    const base = from.slice(0, -"/printestimate".length);
    const baseRule = rules[base];

    assert.ok(baseRule, `missing base redirect for ${from}`);

    if (exceptions[base]) {
      assert.ok(exceptions[base].trim(), `missing exception reason for ${base}`);
      continue;
    }

    assert.equal(
      rule.redirect.to,
      baseRule.redirect.to,
      `base and printestimate destinations differ for ${base}`,
    );
  }
});

test("the Spanish flyer guide redirects to the current guide and is not gone", () => {
  const legacyPath = "/manual-para-hacer-un-buen-flyer";

  assert.equal(
    MANUAL_LEGACY_REDIRECTS[legacyPath],
    "/como-preparar-archivos",
  );
  assert.equal(LEGACY_GONE_PATHS.includes(legacyPath), false);
});

test("legacy URLs without an equivalent remain classified as gone", () => {
  const gone = "/product/plantilla-tarjeta-3";
  assert.ok(LEGACY_GONE_PATHS.includes(gone));
  assert.equal(rules[gone], undefined);
});
