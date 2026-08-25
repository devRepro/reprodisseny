import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeContentSections,
  renderSectionMarkdown,
} from "../utils/content/sectionViewModel";

const productOptions = {
  entityType: "product" as const,
  url: "/productos/prueba",
  dev: false,
};

function normalize(section: Record<string, unknown>) {
  return normalizeContentSections([section], productOptions);
}

test("MaterialsMd acepta JSON estructurado válido", () => {
  const result = normalize({
    id: "materials",
    title: "Materiales",
    body: JSON.stringify({
      intro: "Elige el soporte.",
      materials: [{ title: "PVC", description: "Rígido y resistente." }],
    }),
  });

  assert.equal(result.sections[0]?.id, "materials");
  assert.equal(result.sections[0]?.contentFormat, "structured");
  assert.equal(result.sections[0]?.groups[0]?.items[0]?.title, "PVC");
});

test("MaterialsMd acepta Markdown y elimina sintaxis inline de las cards", () => {
  const result = normalize({
    id: "materialsMd",
    title: "Materiales",
    body: "Soportes disponibles.\n\n- **PVC**: material **resistente**.",
  });

  const section = result.sections[0];
  assert.equal(section?.id, "materials");
  assert.equal(section?.intro, "Soportes disponibles.");
  assert.equal(section?.groups[0]?.items[0]?.description, "material resistente.");
  assert.doesNotMatch(section?.groups[0]?.items[0]?.descriptionHtml || "", /\*\*/);
});

test("FormatsMd normaliza shapes", () => {
  const result = normalize({
    id: "formats",
    formatsData: {
      shapes: [{ title: "Rectangular", description: "Corte estándar." }],
    },
  });

  assert.equal(result.sections[0]?.groups[0]?.title, "Formas disponibles");
});

test("FormatsMd normaliza deliveryFormats", () => {
  const result = normalize({
    id: "formats",
    formatsData: {
      deliveryFormats: [{ title: "En hojas", description: "Entrega apilada." }],
    },
  });

  assert.equal(result.sections[0]?.groups[0]?.title, "Formatos y presentación");
});

test("TechnicalSpecsMd Markdown conserva estructura rica", () => {
  const result = normalize({
    id: "technicalSpecsMd",
    title: "Características técnicas",
    body: "### Impresión\n\n- CMYK\n- Tintas directas",
  });

  assert.equal(result.sections[0]?.pattern, "technical-specs");
  assert.match(result.sections[0]?.html || "", /<h3>Impresión<\/h3>/);
  assert.match(result.sections[0]?.html || "", /<ul>/);
});

test("TechnicalSpecsMd representa tablas Markdown como tabla HTML", () => {
  const result = normalize({
    id: "technical-specs",
    title: "Características técnicas",
    body: "| Campo | Valor |\n| --- | --- |\n| Color | CMYK |",
  });

  assert.match(result.sections[0]?.html || "", /<table>/);
  assert.match(result.sections[0]?.html || "", /<td>CMYK<\/td>/);
});

test("ApplicationsMd estructurado conserva metadata opcional", () => {
  const result = normalize({
    id: "applications",
    applicationsData: {
      applications: [
        {
          title: "Retail",
          description: "Campañas de tienda.",
          features: ["Interior"],
          idealFor: "Promociones",
          icon: "store",
        },
      ],
    },
  });

  const item = result.sections[0]?.groups[0]?.items[0];
  assert.deepEqual(item?.features, ["Interior"]);
  assert.equal(item?.idealFor, "Promociones");
  assert.equal(item?.icon, "store");
});

test("un campo vacío no crea una tab", () => {
  const result = normalize({ id: "materials", body: "   " });
  assert.deepEqual(result.sections, []);
  assert.equal(result.diagnostics[0]?.empty, true);
});

test("JSON inválido se omite y nunca se serializa", () => {
  const result = normalize({ id: "materials", body: '{"materials": [' });
  assert.deepEqual(result.sections, []);
  assert.equal(result.diagnostics[0]?.jsonValidity, "invalid");
  assert.equal(result.diagnostics[0]?.plainTextRisk, false);
});

test("un alias legacy solo existe en la entrada", () => {
  const result = normalize({
    id: "materiales",
    body: "- **Papel**: soporte natural.",
  });

  assert.deepEqual(
    [result.sections[0]?.id, result.sections[0]?.key, result.sections[0]?.kind],
    ["materials", "materials", "materials"]
  );
});

test("una sección duplicada se fusiona en una sola tab", () => {
  const result = normalizeContentSections(
    [
      { id: "materials", body: "- **Papel**: soporte natural." },
      { id: "materiales", body: "- **PVC**: soporte resistente." },
    ],
    productOptions
  );

  assert.equal(result.sections.length, 1);
  assert.equal(result.sections[0]?.groups.length, 2);
  assert.equal(result.diagnostics[1]?.duplicate, true);
});

test("una sección desconocida textual usa rich text seguro y un ID canónico", () => {
  const result = normalize({
    id: "legacy-editorial",
    title: "Información",
    body: "Texto con **negrita**.",
  });

  assert.equal(result.sections[0]?.id, "details");
  assert.equal(result.sections[0]?.pattern, "editorial");
  assert.match(result.sections[0]?.html || "", /<strong>negrita<\/strong>/);
  assert.equal(result.diagnostics[0]?.fallbackUsed, true);
});

test("Markdown soporta headings, listas, links y negrita sin sintaxis literal", () => {
  const html = renderSectionMarkdown(
    "# Título\n\nTexto con **negrita** y [enlace](/interno).\n\n1. Uno\n2. Dos"
  );

  assert.match(html, /<h3>Título<\/h3>/);
  assert.match(html, /<strong>negrita<\/strong>/);
  assert.match(html, /<a href="\/interno">enlace<\/a>/);
  assert.match(html, /<ol>/);
  assert.doesNotMatch(html, /\*\*negrita\*\*/);
});

test("Markdown CMS no genera elementos, atributos ni protocolos ejecutables", () => {
  const payloads = [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "[x](javascript:alert(1))",
    "[x](java\\nscript:alert(1))",
    "[x](data:text/html,%3Cscript%3Ealert(1)%3C/script%3E)",
    "<iframe src=javascript:alert(1)></iframe>",
    "<button onclick=alert(1)>x</button>",
    "<div style=\"background:url(javascript:alert(1))\">x</div>",
  ];

  for (const payload of payloads) {
    const html = renderSectionMarkdown(payload);

    assert.doesNotMatch(html, /<(?:script|img|iframe|button|style)\b/i, payload);
    assert.doesNotMatch(html, /<[^>]+\son\w+\s*=/i, payload);
    assert.doesNotMatch(html, /<[^>]+\sstyle\s*=/i, payload);
    assert.doesNotMatch(html, /href=["'](?:javascript|vbscript|file|data):/i, payload);
  }
});

test("la seguridad no degrada el Markdown editorial soportado", () => {
  const html = renderSectionMarkdown(
    "## Título\n\nTexto con **strong**, *emphasis* y [enlace](/seguro).\n\n> Cita\n\n- Uno\n- Dos\n\n| Campo | Valor |\n| --- | --- |\n| Color | CMYK |"
  );

  assert.match(html, /<h3>Título<\/h3>/);
  assert.match(html, /<strong>strong<\/strong>/);
  assert.match(html, /<em>emphasis<\/em>/);
  assert.match(html, /<a href="\/seguro">enlace<\/a>/);
  assert.match(html, /<blockquote>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<table>/);
});

test("HTML peligroso dentro de cards estructuradas tampoco es ejecutable", () => {
  const result = normalize({
    id: "materials",
    materialsData: {
      materials: [
        {
          title: "<img src=x onerror=alert(1)>PVC",
          description: "<button onclick=alert(1)>Resistente</button>",
        },
      ],
    },
  });

  const item = result.sections[0]?.groups[0]?.items[0];
  assert.equal(item?.title, "PVC");
  assert.equal(item?.description, "Resistente");
  assert.doesNotMatch(item?.descriptionHtml || "", /<button\b|<[^>]+onclick\s*=/i);
  assert.match(item?.descriptionHtml || "", /&lt;button onclick=alert\(1\)&gt;/i);
});

test("repara saltos de control dentro de destinos Markdown sin editar el CMS", () => {
  const html = renderSectionMarkdown(
    "Consulta [roll-ups personalizados](/productos\roll-up-personalizado)."
  );

  assert.match(
    html,
    /<a href="\/productos\/roll-up-personalizado">roll-ups personalizados<\/a>/
  );
  assert.doesNotMatch(html, /\[roll-ups personalizados\]/);
});

test("líneas editoriales de ApplicationsMd ya no producen un panel vacío", () => {
  const result = normalize({
    id: "applications",
    body: "Catálogos de producto (colecciones y tarifas).\nLibros corporativos y memorias anuales.",
  });

  assert.equal(result.sections[0]?.groups[0]?.items.length, 2);
  assert.equal(result.sections[0]?.groups[0]?.items[0]?.title, "Catálogos de producto");
});
