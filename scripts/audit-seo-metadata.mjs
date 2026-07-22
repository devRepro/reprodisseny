import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, "cms/catalog.json");
const outputDir = path.join(rootDir, "tmp");
const outputPath = path.join(outputDir, "seo-metadata-audit.csv");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const BRAND_SUFFIX = " | Repro Disseny";

const categories = Array.isArray(catalog.categories)
  ? catalog.categories
      .filter((item) => item?.isPublished !== false)
      .filter((item) => item?.hidden !== true)
      .map((item) => ({ ...item, auditType: "category" }))
  : [];

const products = Array.isArray(catalog.products)
  ? catalog.products
      .filter((item) => item?.isPublished !== false)
      .map((item) => ({ ...item, auditType: "product" }))
  : [];

const entries = [...categories, ...products];

function clean(value) {
  return String(value ?? "").trim();
}

function resolveTitle(item) {
  return clean(
    item?.seo?.metaTitle ||
    item?.seo?.title ||
    item?.title
  );
}

function resolveDescription(item) {
  return clean(
    item?.seo?.metaDescription ||
    item?.seo?.description ||
    item?.shortDescription ||
    item?.description
  );
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

const rows = entries.map((item) => {
  const title = resolveTitle(item);
  const description = resolveDescription(item);
  const effectiveTitle = title
    ? `${title}${BRAND_SUFFIX}`
    : "";

  const issues = [];

  if (!title) {
    issues.push("title-missing");
  } else {
    if (effectiveTitle.length > 75) {
      issues.push("title-critical-long");
    } else if (effectiveTitle.length > 65) {
      issues.push("title-long");
    }

    if (effectiveTitle.length < 35) {
      issues.push("title-short");
    }

    if (/repro\s*disseny|reprodisseny/i.test(title)) {
      issues.push("brand-in-source-title");
    }
  }

  if (!description) {
    issues.push("description-missing");
  } else {
    if (description.length > 180) {
      issues.push("description-critical-long");
    } else if (description.length > 160) {
      issues.push("description-long");
    }

    if (description.length < 90) {
      issues.push("description-short");
    }
  }

  return {
    type: item.auditType,
    path: clean(item.path),
    title,
    effectiveTitle,
    titleLength: effectiveTitle.length,
    description,
    descriptionLength: description.length,
    issues,
  };
});

const titleGroups = new Map();
const descriptionGroups = new Map();

for (const row of rows) {
  if (row.title) {
    const key = row.title.toLocaleLowerCase("es");
    titleGroups.set(key, [...(titleGroups.get(key) || []), row]);
  }

  if (row.description) {
    const key = row.description.toLocaleLowerCase("es");
    descriptionGroups.set(key, [
      ...(descriptionGroups.get(key) || []),
      row,
    ]);
  }
}

for (const group of titleGroups.values()) {
  if (group.length > 1) {
    for (const row of group) {
      row.issues.push("duplicate-title");
    }
  }
}

for (const group of descriptionGroups.values()) {
  if (group.length > 1) {
    for (const row of group) {
      row.issues.push("duplicate-description");
    }
  }
}

const priority = {
  "title-missing": 100,
  "description-missing": 95,
  "brand-in-source-title": 90,
  "duplicate-title": 85,
  "title-critical-long": 80,
  "description-critical-long": 75,
  "duplicate-description": 70,
  "title-long": 60,
  "description-long": 55,
  "title-short": 40,
  "description-short": 35,
};

function score(row) {
  return row.issues.reduce(
    (total, issue) => total + (priority[issue] || 0),
    0
  );
}

rows.sort((a, b) =>
  score(b) - score(a) ||
  b.titleLength - a.titleLength ||
  a.path.localeCompare(b.path)
);

fs.mkdirSync(outputDir, { recursive: true });

const header = [
  "type",
  "path",
  "title",
  "effectiveTitle",
  "titleLength",
  "description",
  "descriptionLength",
  "issues",
];

const csv = [
  header.map(csvCell).join(","),
  ...rows.map((row) =>
    [
      row.type,
      row.path,
      row.title,
      row.effectiveTitle,
      row.titleLength,
      row.description,
      row.descriptionLength,
      row.issues.join(" | "),
    ]
      .map(csvCell)
      .join(",")
  ),
].join("\n");

fs.writeFileSync(outputPath, `${csv}\n`, "utf8");

const problematic = rows.filter((row) => row.issues.length);

console.log("");
console.log(`URLs auditadas: ${rows.length}`);
console.log(`URLs con avisos: ${problematic.length}`);
console.log(`Informe: ${outputPath}`);
console.log("");
console.log("Primeros 30 casos prioritarios:");
console.log("");

console.table(
  problematic.slice(0, 30).map((row) => ({
    tipo: row.type,
    ruta: row.path,
    titulo: row.titleLength,
    descripcion: row.descriptionLength,
    problemas: row.issues.join(", "),
  }))
);
