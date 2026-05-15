// scripts/audit-catalog-content.mjs
import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync("cms/catalog.json", "utf8"));

const productStructuredColumns = {
    benefitsMd: "benefits",
    materialsMd: "materials",
    finishesMd: "finishes",
    applicationsMd: "applications",
};

const productFormatColumns = {
    formatsMd: ["shapes", "deliveryFormats"],
};

const categoryStructuredColumns = {
    usesMd: "applications",
    finishesMd: "finishes",
};

const categoryFormatColumns = {
    formatsMd: ["shapes", "deliveryFormats"],
};

function parseJson(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return { status: "empty" };

    try {
        return {
            status: "json",
            value: JSON.parse(raw),
        };
    } catch (error) {
        if (raw.startsWith("{") || raw.startsWith("[")) {
            return {
                status: "invalid-json",
                error: error.message,
            };
        }

        return {
            status: "markdown",
        };
    }
}

function validateNamedItems(items, key) {
    const issues = [];

    if (!Array.isArray(items) || items.length === 0) {
        issues.push(`Falta array "${key}" o está vacío`);
        return issues;
    }

    items.forEach((item, index) => {
        if (!item || typeof item !== "object") {
            issues.push(`${key}[${index}] no es un objeto`);
            return;
        }

        if (!String(item.title ?? "").trim()) {
            issues.push(`${key}[${index}] no tiene title`);
        }

        const description = String(item.description ?? item.text ?? "").trim();

        if (!description) {
            issues.push(`${key}[${index}] no tiene description/text`);
        }
    });

    return issues;
}

function auditStructured(entityType, item, columns) {
    const results = [];

    for (const [field, key] of Object.entries(columns)) {
        const parsed = parseJson(item[field]);

        if (parsed.status === "empty") continue;

        if (parsed.status === "markdown") {
            results.push({
                type: entityType,
                slug: item.slug,
                title: item.title,
                field,
                issue: "markdown-in-structured-field",
                details: "Renderizará como Markdown/texto, no como cards JSON.",
            });
            continue;
        }

        if (parsed.status === "invalid-json") {
            results.push({
                type: entityType,
                slug: item.slug,
                title: item.title,
                field,
                issue: "invalid-json",
                details: parsed.error,
            });
            continue;
        }

        const issues = validateNamedItems(parsed.value?.[key], key);

        for (const issue of issues) {
            results.push({
                type: entityType,
                slug: item.slug,
                title: item.title,
                field,
                issue: "invalid-json-shape",
                details: issue,
            });
        }
    }

    return results;
}

function auditFormats(entityType, item, columns) {
    const results = [];

    for (const field of Object.keys(columns)) {
        const parsed = parseJson(item[field]);

        if (parsed.status === "empty") continue;

        if (parsed.status === "markdown") {
            results.push({
                type: entityType,
                slug: item.slug,
                title: item.title,
                field,
                issue: "markdown-in-format-field",
                details: "Renderizará como Markdown/texto, no como cards de formatos.",
            });
            continue;
        }

        if (parsed.status === "invalid-json") {
            results.push({
                type: entityType,
                slug: item.slug,
                title: item.title,
                field,
                issue: "invalid-json",
                details: parsed.error,
            });
            continue;
        }

        const value = parsed.value;

        const hasIntro = Boolean(String(value?.intro ?? "").trim());
        const hasShapes = Array.isArray(value?.shapes) && value.shapes.length > 0;
        const hasDeliveryFormats =
            Array.isArray(value?.deliveryFormats) && value.deliveryFormats.length > 0;

        if (!hasIntro && !hasShapes && !hasDeliveryFormats) {
            results.push({
                type: entityType,
                slug: item.slug,
                title: item.title,
                field,
                issue: "invalid-formats-json-shape",
                details: "Falta intro, shapes o deliveryFormats.",
            });
        }
    }

    return results;
}

const issues = [
    ...catalog.products.flatMap((product) => [
        ...auditStructured("product", product, productStructuredColumns),
        ...auditFormats("product", product, productFormatColumns),
    ]),
    ...catalog.categories.flatMap((category) => [
        ...auditStructured("category", category, categoryStructuredColumns),
        ...auditFormats("category", category, categoryFormatColumns),
    ]),
];

if (!issues.length) {
    console.log("✅ No se han detectado problemas de formato.");
    process.exit(0);
}

console.table(issues);
console.log(`\nTotal issues: ${issues.length}`);

process.exit(1);