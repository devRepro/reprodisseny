import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  applySyncOutputs,
  buildCatalogDiff,
  buildSyncReport,
  commitJsonSetAtomically,
  parseEditorialJson,
  validateCatalogState,
  type CatalogEntity,
  type CatalogSnapshot,
  type SyncIssue,
} from "../scripts/sync-cms-core";

function category(overrides: Partial<CatalogEntity> = {}): CatalogEntity {
  return {
    id: "c1",
    slug: "cat",
    path: "/categorias/cat",
    title: "Categoría",
    isPublished: true,
    image: { src: "/cat.webp", alt: "Categoría impresa" },
    faqs: [],
    seo: {
      canonical: "https://reprodisseny.com/categorias/cat",
      metaTitle: "Categoría de impresión personalizada",
      metaDescription: "Descripción editorial suficientemente completa para representar una categoría de impresión personalizada y comprobar el informe SEO del catálogo web.",
    },
    ...overrides,
  };
}

function product(overrides: Partial<CatalogEntity> = {}): CatalogEntity {
  return {
    id: "p1",
    slug: "producto",
    path: "/productos/producto",
    title: "Producto",
    isPublished: true,
    categorySlug: "cat",
    categorySlugs: ["cat"],
    sku: "SKU-1",
    image: { src: "/producto.webp", alt: "Producto impreso personalizado" },
    faqs: [],
    relatedProductsJson: [],
    seo: {
      canonical: "https://reprodisseny.com/productos/producto",
      metaTitle: "Producto impreso personalizado profesional",
      metaDescription: "Descripción editorial suficientemente completa para representar un producto impreso personalizado y comprobar correctamente el informe SEO del catálogo web.",
    },
    ...overrides,
  };
}

function snapshot(categories = [category()], products = [product()]): CatalogSnapshot {
  return { categories, products };
}

function errors(previous: CatalogSnapshot, next: CatalogSnapshot, editorial: SyncIssue[] = []) {
  const diff = buildCatalogDiff(previous, next);
  return validateCatalogState(previous, next, diff, editorial, {
    strict: true,
    allowBreakingChanges: false,
  }).filter((issue) => issue.severity === "error");
}

test("JSON editorial roto produce un error bloqueante sin repararlo", () => {
  const issues: SyncIssue[] = [];
  const result = parseEditorialJson('[{"question":"Sin cierre"}', [], {
    field: "FaqsJson",
    entityType: "product",
    entityId: "p1",
    slug: "producto",
  }, issues);
  assert.deepEqual(result, []);
  assert.equal(issues[0]?.code, "malformed_editorial_json");
  assert.equal(issues[0]?.severity, "error");
});

test("detecta slug duplicado", () => {
  const next = snapshot([category(), category({ id: "c2", path: "/categorias/otra" })]);
  assert.ok(errors(snapshot(), next).some((issue) => issue.code === "duplicate_slug"));
});

test("detecta SKU duplicado", () => {
  const next = snapshot([category()], [product(), product({ id: "p2", slug: "otro", path: "/productos/otro", seo: { canonical: "https://reprodisseny.com/productos/otro" } })]);
  assert.ok(errors(snapshot(), next).some((issue) => issue.code === "duplicate_sku"));
});

test("detecta producto publicado sin categoría", () => {
  const next = snapshot([category()], [product({ categorySlug: "", categorySlugs: [] })]);
  assert.ok(errors(snapshot(), next).some((issue) => issue.code === "published_product_without_category"));
});

test("un cambio de ruta se bloquea y muestra la redirección necesaria", () => {
  const previous = snapshot();
  const next = snapshot([category()], [product({ path: "/productos/producto-nuevo", seo: { canonical: "https://reprodisseny.com/productos/producto-nuevo" } })]);
  const diff = buildCatalogDiff(previous, next);
  assert.equal(diff.breakingChanges[0]?.oldPath, "/productos/producto");
  assert.equal(diff.breakingChanges[0]?.newPath, "/productos/producto-nuevo");
  assert.ok(errors(previous, next).some((issue) => issue.code === "unauthorized_route_change"));
});

test("una eliminación inesperada se bloquea", () => {
  const previous = snapshot();
  const next = snapshot([category()], []);
  assert.ok(errors(previous, next).some((issue) => issue.code === "unexpected_removal"));
});

test("modo check no invoca ninguna escritura", async () => {
  let writes = 0;
  await applySyncOutputs(true, [{ filePath: "/no-debe-escribirse.json", data: {} }], async () => {
    writes += 1;
  });
  assert.equal(writes, 0);
});

test("el informe estructura añadidos, modificados, eliminados y redirects", () => {
  const previous = snapshot([category()], [product(), product({ id: "p2", slug: "eliminado", path: "/productos/eliminado", sku: "SKU-2", seo: { canonical: "https://reprodisseny.com/productos/eliminado" } })]);
  const next = snapshot([category()], [product({ title: "Producto modificado" }), product({ id: "p3", slug: "nuevo", path: "/productos/nuevo", sku: "SKU-3", seo: { canonical: "https://reprodisseny.com/productos/nuevo" } })]);
  const diff = buildCatalogDiff(previous, next);
  const report = buildSyncReport(previous, next, diff, [], { check: true, strict: true, report: true, allowBreakingChanges: false });
  assert.equal(report.diff.addedProducts.length, 1);
  assert.equal(report.diff.modifiedProducts.length, 1);
  assert.equal(report.diff.removedProducts.length, 1);
  assert.deepEqual(report.redirectRequirements[0], { from: "/productos/eliminado", entityType: "product", id: "p2" });
  assert.ok(report.warningsByProduct);
});

test("ignora representación, orden de propiedades y duplicados derivados exactos", () => {
  const previousProduct = product({
    description: "Descripción breve\r\n",
    shortDescription: "Descripción breve\r\n",
    bodyMd: "Detalle\r\n",
    sections: [{ id: "details", contentFormat: "markdown", body: "Detalle\r\n" }],
    legacySlugs: ["b", "a"],
    seo: { canonical: "https://reprodisseny.com/productos/producto", metaTitle: "Título", metaDescription: "Descripción", schema: { name: "Producto", "@type": "Product" } },
  });
  const nextProduct = product({
    shortDescription: "Descripción breve\n",
    sections: [{ contentFormat: "markdown", body: "Detalle\n", id: "details" }],
    legacySlugs: ["a", "b"],
    seo: { metaDescription: "Descripción", canonical: "https://reprodisseny.com/productos/producto", metaTitle: "Título", schema: { "@type": "Product", name: "Producto" } },
  });
  const diff = buildCatalogDiff(snapshot([category()], [previousProduct]), snapshot([category()], [nextProduct]));
  assert.equal(diff.modifiedProducts.length, 0);
  assert.equal(diff.ignoredRepresentationalOrDerivedChanges.length, 1);
});

test("null y cadena vacía siguen siendo un cambio semántico", () => {
  const previous = snapshot([category()], [product({ brand: null })]);
  const next = snapshot([category()], [product({ brand: "" })]);
  assert.deepEqual(buildCatalogDiff(previous, next).modifiedProducts[0]?.changedFields, ["brand"]);
});

test("un fallo durante la sustitución conjunta restaura los tres archivos", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "sync-cms-rollback-"));
  const files = ["catalog.json", "routes.json", "search-index.json"].map((name) => path.join(tempDir, name));
  const originals = [{ old: "catalog" }, { old: "routes" }, { old: "search" }];
  await Promise.all(files.map((file, index) => fs.writeFile(file, JSON.stringify(originals[index]), "utf8")));

  await assert.rejects(
    commitJsonSetAtomically(
      files.map((filePath, index) => ({ filePath, data: { next: index } })),
      { afterReplace: (_filePath, index) => { if (index === 1) throw new Error("fallo inyectado"); } },
    ),
    /fallo inyectado/,
  );

  const restored = await Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))));
  assert.deepEqual(restored, originals);
  await fs.rm(tempDir, { recursive: true, force: true });
});
