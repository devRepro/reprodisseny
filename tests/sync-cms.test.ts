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

function allIssues(previous: CatalogSnapshot, next: CatalogSnapshot, editorial: SyncIssue[] = []) {
  const diff = buildCatalogDiff(previous, next);
  return validateCatalogState(previous, next, diff, editorial, {
    strict: true,
    allowBreakingChanges: false,
  });
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


test("CommercialJson ausente o vacío conserva la validación heredada", () => {
  assert.deepEqual(errors(snapshot(), snapshot([category({ commercialJson: undefined })])), []);
  assert.deepEqual(errors(snapshot(), snapshot([category({ commercialJson: "" })])), []);
});

test("CommercialJson válido acepta referencias a productos publicados de otras categorías", () => {
  const secondaryCategory = category({
    id: "c2",
    slug: "otra",
    path: "/categorias/otra",
    seo: { canonical: "https://reprodisseny.com/categorias/otra" },
  });
  const secondaryProduct = product({
    id: "p2",
    slug: "producto-otra-categoria",
    path: "/productos/producto-otra-categoria",
    categorySlug: "otra",
    categorySlugs: ["otra"],
    sku: "SKU-2",
    seo: { canonical: "https://reprodisseny.com/productos/producto-otra-categoria" },
  });
  const current = snapshot([category(), secondaryCategory], [product(), secondaryProduct]);
  const next = snapshot([
    category({
      commercialJson: {
        hero: { primaryCta: { label: "Pedir presupuesto", to: "/contacto" } },
        solutions: {
          groups: [
            {
              id: "solucion-1",
              title: "Solución comercial",
              primaryProductSlug: "producto-otra-categoria",
              productSlugs: ["producto", "producto-otra-categoria"],
            },
          ],
        },
      },
    }),
    secondaryCategory,
  ], [product(), secondaryProduct]);

  assert.deepEqual(errors(current, next), []);
});


test("CommercialJson permite la descripcion editorial del grupo sin warning de producto duplicado", () => {
  const next = snapshot([
    category({ commercialJson: { solutions: { groups: [{ id: "solucion-1", title: "Solucion comercial", description: "Descripcion editorial del grupo", primaryProductSlug: "producto", productSlugs: ["producto"] }] } } }),
  ]);
  const issues = allIssues(snapshot(), next);
  assert.equal(issues.some((issue) => issue.code === "duplicated_commercial_product_data"), false);
  assert.equal(issues.some((issue) => issue.severity === "error"), false);
});

test("CommercialJson bloquea un producto principal que no pertenece a su grupo", () => {
  const next = snapshot([
    category({ commercialJson: { solutions: { groups: [{ id: "solucion-1", title: "Solucion comercial", primaryProductSlug: "producto-otra-categoria", productSlugs: ["producto"] }] } } }),
  ], [product(), product({ id: "p2", slug: "producto-otra-categoria", path: "/productos/producto-otra-categoria", sku: "SKU-2", seo: { canonical: "https://reprodisseny.com/productos/producto-otra-categoria" } })]);
  const issues = errors(snapshot(), next);
  assert.ok(issues.some((issue) => issue.code === "commercial_primary_product_not_in_group"));
});
test("CommercialJson bloquea referencias a productos no publicados", () => {
  const unpublishedProduct = product({
    id: "p2",
    slug: "producto-no-publicado",
    path: "/productos/producto-no-publicado",
    sku: "SKU-2",
    isPublished: false,
    seo: { canonical: "https://reprodisseny.com/productos/producto-no-publicado" },
  });
  const next = snapshot([
    category({
      commercialJson: {
        solutions: {
          groups: [
            {
              id: "solucion-1",
              title: "Solución comercial",
              primaryProductSlug: "producto-no-publicado",
              productSlugs: ["producto-no-publicado"],
            },
          ],
        },
      },
    }),
  ], [product(), unpublishedProduct]);

  assert.ok(errors(snapshot([category()], [product(), unpublishedProduct]), next).some((issue) => issue.code === "commercial_product_reference_not_found"));
});
test("CommercialJson malformado produce un error bloqueante sin publicar el valor", () => {
  const issues: SyncIssue[] = [];
  const result = parseEditorialJson('{"solutions":', null, {
    field: "CommercialJson",
    entityType: "category",
    entityId: "c1",
    slug: "cat",
  }, issues);

  assert.equal(result, null);
  assert.equal(issues[0]?.code, "malformed_editorial_json");
  assert.equal(issues[0]?.severity, "error");
});

test("CommercialJson incompatible, referencias inexistentes, ids duplicados y CTAs externos se bloquean", () => {
  const next = snapshot([
    category({
      commercialJson: {
        hero: { primaryCta: { label: "Comprar", to: "https://example.com" } },
        solutions: {
          groups: [
            { id: "duplicado", title: "Grupo", primaryProductSlug: "producto", productSlugs: ["producto"] },
            { id: "duplicado", title: "Grupo duplicado", primaryProductSlug: "no-existe", productSlugs: ["no-existe"] },
            { id: "invalido", title: "Grupo inválido", primaryProductSlug: "producto", productSlugs: "producto" },
          ],
        },
      },
    }),
  ]);
  const codes = errors(snapshot(), next).map((issue) => issue.code);

  assert.ok(codes.includes("duplicate_commercial_group_id"));
  assert.ok(codes.includes("commercial_product_reference_not_found"));
  assert.ok(codes.includes("invalid_commercial_json"));
  assert.ok(codes.includes("invalid_commercial_cta"));
});


test("CommercialJson bloquea productos duplicados dentro de un grupo", () => {
  const next = snapshot([
    category({
      commercialJson: {
        solutions: {
          groups: [
            {
              id: "solucion-1",
              title: "Solución comercial",
              primaryProductSlug: "producto",
              productSlugs: ["producto", "producto"],
            },
          ],
        },
      },
    }),
  ]);

  assert.ok(errors(snapshot(), next).some((issue) => issue.code === "duplicate_commercial_product_slug"));
});

test("CommercialJson bloquea HTML en campos comerciales de texto", () => {
  const next = snapshot([
    category({
      commercialJson: {
        hero: {
          kicker: "<strong>Texto no permitido</strong>",
          primaryCta: { label: "Pedir presupuesto", to: "/pedir-presupuesto" },
        },
        facts: [{ label: "Trayectoria", value: "Desde 1983" }],
        intro: { eyebrow: "Intro", title: "Título", description: "Descripción" },
        solutions: {
          groups: [
            {
              id: "solucion-1",
              eyebrow: "Grupo",
              title: "Solución comercial",
              description: "Descripción",
              primaryProductSlug: "producto",
              productSlugs: ["producto"],
            },
          ],
        },
        project: { eyebrow: "Proyecto", title: "Título", description: "Descripción", points: ["Punto"] },
        useCases: { eyebrow: "Usos", title: "Título", description: "Descripción", items: [{ title: "Caso", description: "Descripción" }] },
        finalCta: { eyebrow: "CTA", title: "Título", description: "Descripción", primaryCta: { label: "Pedir presupuesto", to: "/pedir-presupuesto" } },
      },
    }),
  ]);

  assert.ok(errors(snapshot(), next).some((issue) => issue.code === "unsafe_commercial_html"));
});
test("CommercialJson no debe duplicar datos maestros de producto", () => {
  const next = snapshot([
    category({
      commercialJson: {
        solutions: {
          groups: [
            {
              id: "solucion-1",
              title: "Solución comercial",
              primaryProductSlug: "producto",
              productSlugs: ["producto"],
              path: "/productos/producto",
              imageSrc: "/producto.webp",
            },
          ],
        },
      },
    }),
  ]);
  const warnings = allIssues(snapshot(), next).filter((issue) => issue.severity === "warning");

  assert.ok(warnings.some((issue) => issue.code === "duplicated_commercial_product_data"));
});

test("el catálogo actual sigue validando sin CommercialJson", async () => {
  const catalogPath = path.join(process.cwd(), "cms", "catalog.json");
  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8")) as CatalogSnapshot;
  assert.deepEqual(errors(catalog, catalog), []);
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
