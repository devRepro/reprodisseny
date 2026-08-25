import fs from "node:fs";

import { normalizeContentSections } from "../utils/content/sectionViewModel";
import type { SectionEntityType } from "../types/contentSections";

type CatalogEntity = {
  path?: string;
  slug?: string;
  sections?: unknown[];
};

type Catalog = {
  products?: CatalogEntity[];
  categories?: CatalogEntity[];
};

const catalog = JSON.parse(fs.readFileSync("cms/catalog.json", "utf8")) as Catalog;

function escapeCell(value: unknown) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .trim();
}

const rows: string[] = [];
let inputSections = 0;
let renderedSections = 0;
let problems = 0;

for (const [entityType, entities] of [
  ["product", catalog.products || []],
  ["category", catalog.categories || []],
] as Array<[SectionEntityType, CatalogEntity[]]>) {
  for (const entity of entities) {
    const url = entity.path || `/${entityType === "product" ? "productos" : "categorias"}/${entity.slug || ""}`;
    const rawSections = Array.isArray(entity.sections) ? entity.sections : [];
    const result = normalizeContentSections(rawSections, { entityType, url, dev: false });

    inputSections += rawSections.length;
    renderedSections += result.sections.length;

    for (const diagnostic of result.diagnostics) {
      const problem = diagnostic.problem || "—";
      if (diagnostic.problem && !diagnostic.problem.includes("fuera del contrato")) {
        problems += 1;
      }

      rows.push(
        `| ${[
          diagnostic.url,
          diagnostic.canonicalId || diagnostic.sectionId || "—",
          diagnostic.source,
          diagnostic.detectedFormat,
          diagnostic.expectedRenderer,
          diagnostic.actualRenderer,
          problem,
          diagnostic.action || "Renderizado canónico",
        ]
          .map(escapeCell)
          .join(" | ")} |`
      );
    }
  }
}

console.log("| URL | sección | origen | formato | renderer esperado | renderer real | problema | acción |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
console.log(rows.join("\n"));
console.log(
  `\nResumen: ${inputSections} secciones de entrada; ${renderedSections} tabs canónicas publicables; ${problems} problemas no contractuales.`
);

if (problems > 0) process.exitCode = 1;
