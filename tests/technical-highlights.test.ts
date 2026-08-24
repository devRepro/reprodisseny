import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_TECHNICAL_HIGHLIGHTS,
  normalizeTechnicalHighlights,
} from "../utils/content/technicalHighlights";

test("devuelve una lista vacía cuando la entrada está ausente o no es un array", () => {
  for (const value of [undefined, null, {}, "highlights"]) {
    assert.deepEqual(normalizeTechnicalHighlights(value), []);
  }
});

test("conserva un array vacío", () => {
  assert.deepEqual(normalizeTechnicalHighlights([]), []);
});

test("normaliza highlights válidos y elimina duplicados", () => {
  assert.deepEqual(
    normalizeTechnicalHighlights([
      {
        title: "  Formato  ",
        description: "  A4 y A5.  ",
      },
      {
        title: "Impresión",
        description: "A todo color.",
      },
      {
        title: "formato",
        description: "a4 y a5.",
      },
    ]),
    [
      { title: "Formato", description: "A4 y A5." },
      { title: "Impresión", description: "A todo color." },
    ],
  );
});

test("ignora elementos inválidos y campos obligatorios vacíos o no textuales", () => {
  assert.deepEqual(
    normalizeTechnicalHighlights([
      null,
      [],
      "texto",
      {},
      { title: "", description: "Descripción" },
      { title: "Formato", description: "   " },
      { title: 123, description: "Descripción" },
      { title: "Formato", description: false },
    ]),
    [],
  );
});

test("normaliza iconos permitidos y descarta iconos desconocidos", () => {
  assert.deepEqual(
    normalizeTechnicalHighlights([
      {
        title: "Formato",
        description: "A4 y A5.",
        icon: "  LUCIDE:RULER  ",
      },
      {
        title: "Impresión",
        description: "A todo color.",
        icon: "PRINTER",
      },
      {
        title: "Acabado",
        description: "Mate o brillo.",
        icon: "icono-no-permitido",
      },
      {
        title: "Entrega",
        description: "Lista para usar.",
        icon: 123,
      },
    ]),
    [
      { title: "Formato", description: "A4 y A5.", icon: "ruler" },
      { title: "Impresión", description: "A todo color.", icon: "printer" },
      { title: "Acabado", description: "Mate o brillo." },
      { title: "Entrega", description: "Lista para usar." },
    ],
  );
});

test("limita de forma determinista el resultado a cuatro highlights válidos", () => {
  const input = [
    null,
    ...Array.from({ length: 6 }, (_, index) => ({
      title: `Dato ${index + 1}`,
      description: `Descripción ${index + 1}`,
    })),
  ];

  const result = normalizeTechnicalHighlights(input);

  assert.equal(result.length, MAX_TECHNICAL_HIGHLIGHTS);
  assert.deepEqual(
    result.map((item) => item.title),
    ["Dato 1", "Dato 2", "Dato 3", "Dato 4"],
  );
});
