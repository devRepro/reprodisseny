import assert from "node:assert/strict";
import test from "node:test";

import { parseExplicitBoolean } from "../utils/explicitBoolean";
import {
  getNamedValue,
  normalizeProductExtraField,
} from "../utils/productExtraFields";

test("public configuration is disabled unless true is explicit", () => {
  for (const value of [undefined, "", "0", "1", "false", "yes"]) {
    assert.equal(parseExplicitBoolean(value), false);
  }
  assert.equal(parseExplicitBoolean(" TRUE "), true);
});

test("a select with one option becomes informative fixed data", () => {
  const field = normalizeProductExtraField({
    name: "perforacion",
    label: "Perforación",
    type: "select",
    options: [" Fijo "],
  });

  assert.equal(field?.kind, "fixed");
  assert.equal(field?.initialValue, "Fijo");
});

test("editable options remain editable and fixed values remain available to the payload", () => {
  const editable = normalizeProductExtraField({
    name: "acabado",
    label: "Acabado",
    type: "select",
    options: ["Mate", "Brillo"],
  });

  assert.equal(editable?.kind, "select");
  assert.deepEqual(editable?.normalizedOptions, ["Mate", "Brillo"]);
  assert.equal(getNamedValue({ perforacion: "Fijo" }, "perforacion"), "Fijo");
});
