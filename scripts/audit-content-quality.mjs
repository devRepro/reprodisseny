import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const searchIndexPath = path.resolve(__dirname, "../cms/search-index.json");
const strict = process.argv.includes("--strict");

const rules = [
  {
    id: "foreign-product-format",
    description: 'Texto de "abanico" reutilizado en un producto que no es un abanico',
    matches: (record, serialized) =>
      /tipo de abanico/i.test(serialized) &&
      !/abanicos?/i.test(`${record?.slug || ""} ${record?.path || ""} ${record?.title || ""}`),
  },
  {
    id: "duplicated-brand",
    description: "Marca Repro Disseny repetida en un mismo título o texto SEO",
    matches: (_record, serialized) =>
      /repro\s*disseny\s*(?:\||·|-)\s*repro\s*disseny/i.test(serialized),
  },
];

const raw = await fs.readFile(searchIndexPath, "utf8");
const records = JSON.parse(raw);

if (!Array.isArray(records)) {
  throw new TypeError(`Formato inesperado en ${searchIndexPath}: se esperaba un array.`);
}

const issues = [];

for (const record of records) {
  const serialized = JSON.stringify(record);

  for (const rule of rules) {
    if (!rule.matches(record, serialized)) continue;

    issues.push({
      rule: rule.id,
      description: rule.description,
      type: record?.type || "desconocido",
      slug: record?.slug || "",
      path: record?.path || "",
      title: record?.title || "",
    });
  }
}

if (issues.length === 0) {
  console.log("✅ Auditoría de contenido: no se han detectado contaminaciones conocidas.");
  process.exit(0);
}

console.warn(`⚠️ Auditoría de contenido: ${issues.length} incidencia(s) detectada(s).`);
console.table(issues);
console.warn(
  "Corrige el contenido en el CMS de origen y vuelve a ejecutar npm run sync:cms antes de desplegar.",
);

if (strict) {
  process.exitCode = 1;
}
