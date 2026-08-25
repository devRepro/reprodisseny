import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { normalizeContentSections } from "../utils/content/sectionViewModel";
import { CANONICAL_SECTION_KEYS } from "../utils/content/sectionsKey";

type CatalogEntity = { path: string; sections?: unknown[] };
type Catalog = { products: CatalogEntity[]; categories: CatalogEntity[] };

const catalog = JSON.parse(fs.readFileSync("cms/catalog.json", "utf8")) as Catalog;

test("todo el catálogo publicado cumple el contrato canónico de tabs", () => {
  let audited = 0;
  let publishedTabs = 0;

  for (const [entityType, entities] of [
    ["product", catalog.products],
    ["category", catalog.categories],
  ] as const) {
    for (const entity of entities) {
      const input = Array.isArray(entity.sections) ? entity.sections : [];
      const result = normalizeContentSections(input, {
        entityType,
        url: entity.path,
        dev: false,
      });

      audited += input.length;
      publishedTabs += result.sections.length;

      const ids = result.sections.map((section) => section.id);
      assert.equal(new Set(ids).size, ids.length, `${entity.path}: tabs duplicadas`);

      for (const section of result.sections) {
        assert.ok(CANONICAL_SECTION_KEYS.includes(section.id), `${entity.path}: ID no canónico`);
        assert.equal(section.key, section.id, `${entity.path}: key no canónica`);
        assert.equal(section.kind, section.id, `${entity.path}: kind no canónico`);
        assert.ok(section.pattern, `${entity.path}#${section.id}: sin renderer`);
        assert.ok(
          section.html || section.groups.length || section.technicalHighlights.length,
          `${entity.path}#${section.id}: tab vacía`
        );
        assert.doesNotMatch(
          section.html || "",
          /&quot;(?:materials|formats|applications|finishes|benefits)&quot;\s*:/i,
          `${entity.path}#${section.id}: JSON serializado como HTML`
        );

        if (section.pattern === "structured-grid") {
          assert.ok(section.groups.length, `${entity.path}#${section.id}: grid sin grupos`);
          assert.ok(
            section.groups.every((group) => group.items.length > 0),
            `${entity.path}#${section.id}: grupo vacío`
          );
        }
      }

      const actionable = result.diagnostics.filter(
        (item) => item.problem && !item.problem.includes("fuera del contrato")
      );
      assert.deepEqual(actionable, [], `${entity.path}: ${actionable[0]?.problem || "problema"}`);
    }
  }

  assert.equal(audited, 666);
  assert.equal(publishedTabs, 576);
});

test("las URLs que antes perdían ApplicationsMd ahora tienen renderer y cards", () => {
  for (const path of [
    "/productos/encuadernacion-encolada-tapa-blanda",
    "/productos/panel-ultraligero",
  ]) {
    const product = catalog.products.find((item) => item.path === path);
    assert.ok(product, `${path}: producto ausente`);

    const result = normalizeContentSections(product.sections, {
      entityType: "product",
      url: path,
      dev: false,
    });
    const applications = result.sections.find((section) => section.id === "applications");

    assert.equal(applications?.pattern, "structured-grid");
    assert.ok(applications?.groups.some((group) => group.items.length > 0));
  }
});

test("los casos con Markdown antes visible se convierten a HTML semántico", () => {
  const cases = [
    ["product", "/productos/cajas-de-luz-personalizadas", "details", /<em>/],
    ["product", "/productos/cajas-de-luz-personalizadas", "technical-specs", /<blockquote>/],
    ["category", "/categorias/expositores", "details", /<a href=/],
  ] as const;

  for (const [entityType, path, sectionId, expected] of cases) {
    const entities = entityType === "product" ? catalog.products : catalog.categories;
    const entity = entities.find((item) => item.path === path);
    assert.ok(entity, `${path}: entidad ausente`);

    const result = normalizeContentSections(entity.sections, {
      entityType,
      url: path,
      dev: false,
    });
    const section = result.sections.find((item) => item.id === sectionId);

    assert.match(section?.html || "", expected, `${path}#${sectionId}`);
  }
});

test("el enlace con retorno de carro de expositores se normaliza sin quedar literal", () => {
  const category = catalog.categories.find((item) => item.path === "/categorias/expositores");
  assert.ok(category);

  const result = normalizeContentSections(category.sections, {
    entityType: "category",
    url: category.path,
    dev: false,
  });
  const details = result.sections.find((section) => section.id === "details");

  assert.match(
    details?.html || "",
    /href="\/productos\/roll-up-personalizado">roll-ups personalizados<\/a>/
  );
  assert.doesNotMatch(details?.html || "", /\[roll-ups personalizados\]/);
});
