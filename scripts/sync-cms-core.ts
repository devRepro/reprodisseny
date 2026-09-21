import fs from "node:fs/promises";
import path from "node:path";

export type CatalogEntity = {
  id: string;
  slug: string;
  path: string;
  title: string;
  isPublished: boolean;
  categorySlug?: string;
  categorySlugs?: string[];
  parent?: string;
  sku?: string;
  image?: { src?: string; alt?: string };
  galleryImages?: Array<{ src?: string; alt?: string }>;
  faqs?: Array<{ question?: string; answer?: string }>;
  relatedProductsJson?: Array<{ productSlug?: string }>;
  commercialJson?: unknown;
  seo?: { canonical?: string; metaTitle?: string; metaDescription?: string; schema?: unknown; [key: string]: unknown };
  [key: string]: unknown;
};

export type CatalogSnapshot = {
  generatedAt?: string;
  categories: CatalogEntity[];
  products: CatalogEntity[];
};

export type SyncIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  entityType?: "category" | "product";
  entityId?: string;
  slug?: string;
  field?: string;
};

export type EntityChange = {
  entityType: "category" | "product";
  id: string;
  title: string;
  oldSlug?: string;
  newSlug?: string;
  oldPath?: string;
  newPath?: string;
  oldCanonical?: string;
  newCanonical?: string;
  changedFields: string[];
  fieldChanges: Array<{ field: string; before: unknown; after: unknown }>;
};

export type SyncDiff = {
  addedProducts: CatalogEntity[];
  modifiedProducts: EntityChange[];
  removedProducts: CatalogEntity[];
  addedCategories: CatalogEntity[];
  modifiedCategories: EntityChange[];
  removedCategories: CatalogEntity[];
  breakingChanges: EntityChange[];
  ignoredRepresentationalOrDerivedChanges: EntityChange[];
};

export type SyncReport = {
  generatedAt: string;
  mode: { check: boolean; strict: boolean; report: boolean; allowBreakingChanges: boolean };
  counts: {
    categories: number;
    products: number;
    previousCategories: number;
    previousProducts: number;
  };
  diff: SyncDiff;
  errors: SyncIssue[];
  warnings: SyncIssue[];
  warningsByProduct: Record<string, SyncIssue[]>;
  quality: {
    jsonErrors: SyncIssue[];
    duplicateSkus: SyncIssue[];
    missingRelations: SyncIssue[];
    invalidImages: SyncIssue[];
    metaOutsideRecommendedLimits: SyncIssue[];
    altTextIssues: SyncIssue[];
    faqIssues: SyncIssue[];
    insufficientCoverage: SyncIssue[];
  };
  redirectRequirements: Array<{ from: string; to?: string; entityType: "category" | "product"; id: string }>;
};

const EMPTY_VALUES = new Set([undefined, null, ""]);
const GENERIC_ALT_RE = /^(imagen|foto|producto|categor[ií]a|image|photo|sin alt|n\/a)$/i;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function canonicalPath(value: unknown): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;
  try {
    return new URL(raw, "https://reprodisseny.com").pathname.replace(/\/+$/, "") || "/";
  } catch {
    return undefined;
  }
}

export function parseEditorialJson<T>(
  value: unknown,
  fallback: T,
  context: { field: string; entityType?: "category" | "product"; entityId?: string; slug?: string },
  issues: SyncIssue[],
): T {
  if (value == null || text(value) === "") return fallback;
  if (typeof value === "object") return value as T;

  try {
    return JSON.parse(String(value)) as T;
  } catch (error) {
    issues.push({
      severity: "error",
      code: "malformed_editorial_json",
      message: `${context.field}: JSON editorial malformado (${error instanceof Error ? error.message : String(error)})`,
      ...context,
    });
    return fallback;
  }
}

const UNORDERED_ARRAY_PATHS = new Set([
  "categorySlugs",
  "legacySlugs",
  "seo.hreflang",
  "seo.keywords",
  "seo.searchTerms",
]);

function normalizeComparableValue(value: unknown, fieldPath: string): unknown {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    return value
      .replace(/\u00a0/g, " ")
      .replace(/[\u201c\u201d\u00ab\u00bb]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.replace(/[\t ]+$/g, ""))
      .join("\n")
      .trimEnd();
  }
  if (Array.isArray(value)) {
    const normalized = value.map((item) => normalizeComparableValue(item, fieldPath));
    return UNORDERED_ARRAY_PATHS.has(fieldPath)
      ? normalized.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
      : normalized;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const child = normalizeComparableValue((value as Record<string, unknown>)[key], fieldPath ? `${fieldPath}.${key}` : key);
      if (child !== undefined) result[key] = child;
    }
    return result;
  }
  return value;
}

function semanticEntity(entity: CatalogEntity): Record<string, unknown> {
  const comparable = structuredClone(entity) as Record<string, unknown>;
  delete comparable.updatedAt;
  delete comparable.breadcrumbs;

  const seo = comparable.seo as Record<string, unknown> | undefined;
  if (seo) delete seo.schema;

  if (comparable.type === "producto" || "categorySlug" in comparable) {
    if (comparable.description === comparable.shortDescription) delete comparable.description;
    const sections = Array.isArray(comparable.sections) ? comparable.sections as Array<Record<string, unknown>> : [];
    const detailsBody = sections.find((section) => section.id === "details" && section.contentFormat === "markdown")?.body;
    if (comparable.bodyMd === detailsBody) delete comparable.bodyMd;
  }

  return normalizeComparableValue(comparable, "") as Record<string, unknown>;
}

function changedFields(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );
}

function toEntityChange(
  entityType: "category" | "product",
  previous: CatalogEntity,
  item: CatalogEntity,
  fields: string[],
): EntityChange {
  return {
    entityType,
    id: item.id,
    title: item.title,
    oldSlug: previous.slug,
    newSlug: item.slug,
    oldPath: previous.path,
    newPath: item.path,
    oldCanonical: previous.seo?.canonical,
    newCanonical: item.seo?.canonical,
    changedFields: fields,
    fieldChanges: fields.map((field) => ({ field, before: previous[field], after: item[field] })),
  };
}

function diffEntities(
  entityType: "category" | "product",
  before: CatalogEntity[],
  after: CatalogEntity[],
): { added: CatalogEntity[]; modified: EntityChange[]; removed: CatalogEntity[]; ignored: EntityChange[] } {
  const beforeById = new Map(before.map((item) => [item.id, item]));
  const afterById = new Map(after.map((item) => [item.id, item]));
  const added = after.filter((item) => !beforeById.has(item.id));
  const removed = before.filter((item) => !afterById.has(item.id));
  const modified: EntityChange[] = [];
  const ignored: EntityChange[] = [];

  for (const item of after) {
    const previous = beforeById.get(item.id);
    if (!previous) continue;
    const rawFields = changedFields(previous, item);
    if (!rawFields.length) continue;
    const semanticFields = changedFields(semanticEntity(previous), semanticEntity(item));
    if (!semanticFields.length) {
      ignored.push(toEntityChange(entityType, previous, item, rawFields));
      continue;
    }
    modified.push(toEntityChange(entityType, previous, item, semanticFields));
  }

  return { added, modified, removed, ignored };
}

export function buildCatalogDiff(previous: CatalogSnapshot, next: CatalogSnapshot): SyncDiff {
  const products = diffEntities("product", previous.products, next.products);
  const categories = diffEntities("category", previous.categories, next.categories);
  const routeChanges = [...products.modified, ...categories.modified].filter(
    (item) => item.oldSlug !== item.newSlug || item.oldPath !== item.newPath,
  );
  const removals = [
    ...products.removed.map((item) => ({
      entityType: "product" as const,
      id: item.id,
      title: item.title,
      oldSlug: item.slug,
      oldPath: item.path,
      oldCanonical: item.seo?.canonical,
      changedFields: ["isPublished"],
      fieldChanges: [{ field: "isPublished", before: true, after: false }],
    })),
    ...categories.removed.map((item) => ({
      entityType: "category" as const,
      id: item.id,
      title: item.title,
      oldSlug: item.slug,
      oldPath: item.path,
      oldCanonical: item.seo?.canonical,
      changedFields: ["isPublished"],
      fieldChanges: [{ field: "isPublished", before: true, after: false }],
    })),
  ];

  return {
    addedProducts: products.added,
    modifiedProducts: products.modified,
    removedProducts: products.removed,
    addedCategories: categories.added,
    modifiedCategories: categories.modified,
    removedCategories: categories.removed,
    breakingChanges: [...routeChanges, ...removals],
    ignoredRepresentationalOrDerivedChanges: [...products.ignored, ...categories.ignored],
  };
}

function duplicateIssues(
  entities: CatalogEntity[],
  field: "slug" | "path" | "sku",
  entityType: "category" | "product",
): SyncIssue[] {
  const owners = new Map<string, CatalogEntity[]>();
  for (const entity of entities) {
    const raw = text(entity[field]);
    if (!raw) continue;
    const key = raw.toLowerCase();
    owners.set(key, [...(owners.get(key) || []), entity]);
  }
  return [...owners.entries()]
    .filter(([, matches]) => matches.length > 1)
    .map(([value, matches]) => ({
      severity: "error" as const,
      code: `duplicate_${field}`,
      field,
      entityType,
      message: `${field.toUpperCase()} duplicado "${value}": ${matches.map((item) => item.slug).join(", ")}`,
    }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isSafeInternalTarget(value: unknown): boolean {
  const target = text(value);
  if (!target) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return false;
  if (target.includes("\\") || /\s/.test(target)) return false;
  return target.startsWith("/") || target.startsWith("#");
}

function containsHtmlLikeMarkup(value: unknown): boolean {
  return typeof value === "string" && /<\/?[a-z][\s\S]*?>/i.test(value);
}

function validateCommercialText(
  issues: SyncIssue[],
  entity: CatalogEntity,
  field: string,
  value: unknown,
): void {
  if (value === undefined || value === null || value === "") return;
  if (typeof value !== "string") {
    issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field} debe ser texto`, entity, field));
    return;
  }
  if (containsHtmlLikeMarkup(value)) {
    issues.push(commercialIssue("error", "unsafe_commercial_html", `Categoría ${entity.slug}: ${field} no debe contener HTML`, entity, field));
  }
}

function validateCommercialTextBlock(
  issues: SyncIssue[],
  entity: CatalogEntity,
  field: string,
  value: unknown,
): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field} debe ser un objeto`, entity, field));
    return;
  }

  validateCommercialText(issues, entity, `${field}.eyebrow`, value.eyebrow);
  validateCommercialText(issues, entity, `${field}.title`, value.title);
  validateCommercialText(issues, entity, `${field}.description`, value.description);
}

function validateCommercialCta(
  issues: SyncIssue[],
  entity: CatalogEntity,
  field: string,
  value: unknown,
): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field} debe ser un objeto`, entity, field));
    return;
  }

  validateCommercialText(issues, entity, `${field}.label`, value.label);
  if (!isSafeInternalTarget(value.to)) {
    issues.push(commercialIssue("error", "invalid_commercial_cta", `Categoría ${entity.slug}: CTA comercial con destino no permitido (${text(value.to) || "vacío"})`, entity, `${field}.to`));
  }
}
function commercialIssue(
  severity: SyncIssue["severity"],
  code: string,
  message: string,
  entity: CatalogEntity,
  field: string,
): SyncIssue {
  return {
    severity,
    code,
    message,
    entityType: "category",
    entityId: entity.id,
    slug: entity.slug,
    field,
  };
}

function collectCommercialProductRefs(value: unknown): Array<{ slug: string; field: string }> {
  if (!isRecord(value)) return [];

  const refs: Array<{ slug: string; field: string }> = [];
  const solutions = value.solutions;
  const groups = isRecord(solutions) && Array.isArray(solutions.groups)
    ? solutions.groups
    : [];

  groups.forEach((group, index) => {
    if (!isRecord(group)) return;

    const groupField = `commercialJson.solutions.groups[${index}]`;
    const primaryProductSlug = text(group.primaryProductSlug);
    if (primaryProductSlug) refs.push({ slug: primaryProductSlug, field: `${groupField}.primaryProductSlug` });

    if (Array.isArray(group.productSlugs)) {
      group.productSlugs.forEach((slug, productIndex) => {
        const productSlug = text(slug);
        if (productSlug) {
          refs.push({
            slug: productSlug,
            field: `${groupField}.productSlugs[${productIndex}]`,
          });
        }
      });
    }
  });

  return refs;
}

function validateCommercialJson(entity: CatalogEntity, productSlugs: Set<string>): SyncIssue[] {
  const value = entity.commercialJson;
  if (value == null || value === "") return [];

  const issues: SyncIssue[] = [];

  if (!isRecord(value)) {
    return [
      commercialIssue(
        "error",
        "invalid_commercial_json",
        `Categoría ${entity.slug}: CommercialJson debe ser un objeto JSON`,
        entity,
        "commercialJson",
      ),
    ];
  }

  const groups = isRecord(value.solutions) && Array.isArray(value.solutions.groups)
    ? value.solutions.groups
    : [];

  if (value.solutions !== undefined && !isRecord(value.solutions)) {
    issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: commercialJson.solutions debe ser un objeto`, entity, "commercialJson.solutions"));
  }

  if (isRecord(value.solutions) && value.solutions.groups !== undefined && !Array.isArray(value.solutions.groups)) {
    issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: commercialJson.solutions.groups debe ser un array`, entity, "commercialJson.solutions.groups"));
  }

  const groupIds = new Set<string>();
  groups.forEach((group, index) => {
    const field = `commercialJson.solutions.groups[${index}]`;

    if (!isRecord(group)) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field} debe ser un objeto`, entity, field));
      return;
    }

    const id = text(group.id);
    if (!id) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field}.id es obligatorio`, entity, `${field}.id`));
    } else if (groupIds.has(id)) {
      issues.push(commercialIssue("error", "duplicate_commercial_group_id", `Categoría ${entity.slug}: grupo comercial duplicado (${id})`, entity, `${field}.id`));
    } else {
      groupIds.add(id);
    }

    if (!text(group.title)) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field}.title es obligatorio`, entity, `${field}.title`));
    }

    if (!text(group.primaryProductSlug)) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field}.primaryProductSlug es obligatorio`, entity, `${field}.primaryProductSlug`));
    }

    if (!Array.isArray(group.productSlugs) || !group.productSlugs.every((slug) => text(slug))) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field}.productSlugs debe ser un array de slugs`, entity, `${field}.productSlugs`));
    } else {
      const groupProductSlugs = new Set<string>();
      group.productSlugs.forEach((slug, productIndex) => {
        const productSlug = text(slug);
        if (groupProductSlugs.has(productSlug)) {
          issues.push(commercialIssue("error", "duplicate_commercial_product_slug", `Categoría ${entity.slug}: producto comercial duplicado en ${field}.productSlugs (${productSlug})`, entity, `${field}.productSlugs[${productIndex}]`));
        } else {
          groupProductSlugs.add(productSlug);
        }
      });
      const primaryProductSlug = text(group.primaryProductSlug);
      if (primaryProductSlug && !groupProductSlugs.has(primaryProductSlug)) {
        issues.push(commercialIssue("error", "commercial_primary_product_not_in_group", `Categoria ${entity.slug}: el producto principal ${primaryProductSlug} no pertenece al grupo ${id || index}`, entity, `${field}.primaryProductSlug`));
      }
    }

    validateCommercialText(issues, entity, `${field}.eyebrow`, group.eyebrow);
    validateCommercialText(issues, entity, `${field}.title`, group.title);
    validateCommercialText(issues, entity, `${field}.description`, group.description);

    for (const duplicatedMasterField of ["path", "url", "canonical", "image", "imageSrc", "alt"]) {
      if (group[duplicatedMasterField] !== undefined) {
        issues.push(commercialIssue("warning", "duplicated_commercial_product_data", `Categoría ${entity.slug}: ${field}.${duplicatedMasterField} duplica datos maestros del producto`, entity, `${field}.${duplicatedMasterField}`));
      }
    }
  });

  for (const { slug, field } of collectCommercialProductRefs(value)) {
    if (!productSlugs.has(slug)) {
      issues.push(commercialIssue("error", "commercial_product_reference_not_found", `Categoría ${entity.slug}: referencia comercial a producto inexistente o no publicado (${slug})`, entity, field));
    }
  }

  if (value.hero !== undefined) {
    if (!isRecord(value.hero)) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: commercialJson.hero debe ser un objeto`, entity, "commercialJson.hero"));
    } else {
      validateCommercialText(issues, entity, "commercialJson.hero.kicker", value.hero.kicker);
      validateCommercialCta(issues, entity, "commercialJson.hero.primaryCta", value.hero.primaryCta);
      validateCommercialCta(issues, entity, "commercialJson.hero.secondaryCta", value.hero.secondaryCta);
    }
  }

  if (value.facts !== undefined) {
    if (!Array.isArray(value.facts)) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: commercialJson.facts debe ser un array`, entity, "commercialJson.facts"));
    } else {
      value.facts.forEach((fact, index) => {
        const field = `commercialJson.facts[${index}]`;
        if (!isRecord(fact)) {
          issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field} debe ser un objeto`, entity, field));
          return;
        }
        validateCommercialText(issues, entity, `${field}.label`, fact.label);
        validateCommercialText(issues, entity, `${field}.value`, fact.value);
      });
    }
  }

  validateCommercialTextBlock(issues, entity, "commercialJson.intro", value.intro);
  validateCommercialTextBlock(issues, entity, "commercialJson.project", value.project);
  if (isRecord(value.project) && value.project.points !== undefined) {
    if (!Array.isArray(value.project.points)) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: commercialJson.project.points debe ser un array`, entity, "commercialJson.project.points"));
    } else {
      value.project.points.forEach((point, index) => validateCommercialText(issues, entity, `commercialJson.project.points[${index}]`, point));
    }
  }

  validateCommercialTextBlock(issues, entity, "commercialJson.useCases", value.useCases);
  if (isRecord(value.useCases) && value.useCases.items !== undefined) {
    if (!Array.isArray(value.useCases.items)) {
      issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: commercialJson.useCases.items debe ser un array`, entity, "commercialJson.useCases.items"));
    } else {
      value.useCases.items.forEach((item, index) => {
        const field = `commercialJson.useCases.items[${index}]`;
        if (!isRecord(item)) {
          issues.push(commercialIssue("error", "invalid_commercial_json", `Categoría ${entity.slug}: ${field} debe ser un objeto`, entity, field));
          return;
        }
        validateCommercialText(issues, entity, `${field}.title`, item.title);
        validateCommercialText(issues, entity, `${field}.description`, item.description);
      });
    }
  }

  validateCommercialTextBlock(issues, entity, "commercialJson.finalCta", value.finalCta);
  if (isRecord(value.finalCta)) {
    validateCommercialCta(issues, entity, "commercialJson.finalCta.primaryCta", value.finalCta.primaryCta);
  }

  return issues;
}
function requiredFieldIssues(previous: CatalogSnapshot, next: CatalogSnapshot): SyncIssue[] {
  const issues: SyncIssue[] = [];
  const required = {
    category: ["slug", "path", "title", "seo.canonical"],
    product: ["slug", "path", "title", "categorySlug", "seo.canonical"],
  } as const;

  for (const [entityType, entities] of [
    ["category", next.categories],
    ["product", next.products],
  ] as const) {
    const previousById = new Map(
      (entityType === "category" ? previous.categories : previous.products).map((item) => [item.id, item]),
    );
    for (const entity of entities) {
      for (const field of required[entityType]) {
        const value = field === "seo.canonical" ? entity.seo?.canonical : entity[field];
        if (!EMPTY_VALUES.has(value as undefined | null | string)) continue;
        const old = previousById.get(entity.id);
        const oldValue = field === "seo.canonical" ? old?.seo?.canonical : old?.[field];
        issues.push({
          severity: "error",
          code: oldValue ? "required_field_lost" : "required_field_missing",
          message: `${entityType} ${entity.slug || entity.id}: campo obligatorio ${field} vacío`,
          entityType,
          entityId: entity.id,
          slug: entity.slug,
          field,
        });
      }
    }
  }
  return issues;
}

export function validateCatalogState(
  previous: CatalogSnapshot,
  next: CatalogSnapshot,
  diff: SyncDiff,
  editorialIssues: SyncIssue[],
  options: { strict: boolean; allowBreakingChanges: boolean },
): SyncIssue[] {
  const issues = [...editorialIssues];
  issues.push(...duplicateIssues(next.categories, "slug", "category"));
  issues.push(...duplicateIssues(next.products, "slug", "product"));
  issues.push(...duplicateIssues([...next.categories, ...next.products], "path", "product"));
  issues.push(...duplicateIssues(next.products, "sku", "product"));

  const categorySlugs = new Set(next.categories.map((item) => item.slug));
  const productSlugs = new Set(next.products.map((item) => item.slug));
  const publishedProductSlugs = new Set(next.products.filter((item) => item.isPublished !== false).map((item) => item.slug));
  for (const category of next.categories) {
    if (category.parent && !categorySlugs.has(category.parent)) {
      issues.push({ severity: "error", code: "missing_category_relation", message: `Categoría ${category.slug}: parent inexistente (${category.parent})`, entityType: "category", entityId: category.id, slug: category.slug, field: "parent" });
    }
    issues.push(...validateCommercialJson(category, publishedProductSlugs));
  }
  for (const product of next.products) {
    if (!product.categorySlug) {
      issues.push({ severity: "error", code: "published_product_without_category", message: `Producto ${product.slug}: publicado sin categoría`, entityType: "product", entityId: product.id, slug: product.slug, field: "categorySlug" });
    }
    for (const relation of product.categorySlugs || []) {
      if (!categorySlugs.has(relation)) issues.push({ severity: "error", code: "missing_category_relation", message: `Producto ${product.slug}: categoría relacionada inexistente (${relation})`, entityType: "product", entityId: product.id, slug: product.slug, field: "categorySlugs" });
    }
    for (const relation of product.relatedProductsJson || []) {
      if (relation.productSlug && !productSlugs.has(relation.productSlug)) issues.push({ severity: "warning", code: "missing_product_relation", message: `Producto ${product.slug}: producto relacionado inexistente (${relation.productSlug})`, entityType: "product", entityId: product.id, slug: product.slug, field: "relatedProductsJson" });
    }
  }

  for (const entity of [...next.categories, ...next.products]) {
    const entityType = next.products.includes(entity) ? "product" : "category";
    const canonical = canonicalPath(entity.seo?.canonical);
    if (!canonical || canonical !== entity.path) issues.push({ severity: "error", code: "canonical_path_mismatch", message: `${entityType} ${entity.slug}: canonical incompatible con path (${canonical || "inválido"} !== ${entity.path})`, entityType, entityId: entity.id, slug: entity.slug, field: "seo.canonical" });
    for (const faq of entity.faqs || []) {
      if (!text(faq.question) || !text(faq.answer)) issues.push({ severity: "error", code: "empty_faq", message: `${entityType} ${entity.slug}: FAQ con pregunta o respuesta vacía`, entityType, entityId: entity.id, slug: entity.slug, field: "faqs" });
    }
  }

  if (options.strict) issues.push(...requiredFieldIssues(previous, next));
  if (!options.allowBreakingChanges) {
    for (const change of diff.breakingChanges) issues.push({
      severity: "error",
      code: change.newPath ? "unauthorized_route_change" : "unexpected_removal",
      message: change.newPath
        ? `${change.entityType} ${change.title}: cambio de slug/path no autorizado (${change.oldPath} → ${change.newPath})`
        : `${change.entityType} ${change.title}: eliminación o despublicación inesperada (${change.oldPath})`,
      entityType: change.entityType,
      entityId: change.id,
      slug: change.newSlug || change.oldSlug,
      field: change.newPath ? "path" : "isPublished",
    });
  }
  return issues;
}

function qualityIssues(next: CatalogSnapshot): SyncIssue[] {
  const issues: SyncIssue[] = [];
  const altOwners = new Map<string, CatalogEntity[]>();
  for (const entity of [...next.categories, ...next.products]) {
    const entityType = next.products.includes(entity) ? "product" : "category";
    const add = (code: string, message: string, field: string) => issues.push({ severity: "warning", code, message, field, entityType, entityId: entity.id, slug: entity.slug });
    const images = [entity.image, ...(entity.galleryImages || [])];
    images.forEach((image, index) => {
      const fieldPrefix = index === 0 ? "image" : `galleryImages[${index - 1}]`;
      const src = text(image?.src);
      if (!src || !/^(https?:\/\/|\/).+\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?.*)?$/i.test(src)) add("invalid_or_empty_image", `${entityType} ${entity.slug}: ${fieldPrefix}.src vacío o aparentemente inválido`, `${fieldPrefix}.src`);
      const alt = text(image?.alt);
      if (!alt || GENERIC_ALT_RE.test(alt)) add("empty_or_generic_alt", `${entityType} ${entity.slug}: ${fieldPrefix}.alt vacío o genérico`, `${fieldPrefix}.alt`);
      if (alt) altOwners.set(alt.toLowerCase(), [...(altOwners.get(alt.toLowerCase()) || []), entity]);
    });
    const metaTitle = text(entity.seo?.metaTitle);
    const metaDescription = text(entity.seo?.metaDescription);
    if (metaTitle.length < 30 || metaTitle.length > 60) add("meta_title_length", `${entityType} ${entity.slug}: meta title de ${metaTitle.length} caracteres (recomendado 30–60)`, "seo.metaTitle");
    if (metaDescription.length < 120 || metaDescription.length > 160) add("meta_description_length", `${entityType} ${entity.slug}: meta description de ${metaDescription.length} caracteres (recomendado 120–160)`, "seo.metaDescription");
    const seenFaq = new Set<string>();
    for (const faq of entity.faqs || []) {
      const key = `${text(faq.question).toLowerCase()}::${text(faq.answer).toLowerCase()}`;
      if (!text(faq.question) || !text(faq.answer)) add("empty_faq", `${entityType} ${entity.slug}: FAQ vacía`, "faqs");
      if (text(faq.question).length > 180 || text(faq.answer).length > 2000 || /(?:\.\.\.|…)\s*$/.test(text(faq.answer))) add("possibly_truncated_faq", `${entityType} ${entity.slug}: FAQ truncada o fuera de longitud razonable`, "faqs");
      if (seenFaq.has(key)) add("duplicate_faq", `${entityType} ${entity.slug}: FAQ repetida`, "faqs");
      seenFaq.add(key);
    }
    const coverageFields = entityType === "product" ? [entity.title, entity.categorySlug, entity.seo?.metaTitle, entity.seo?.metaDescription, entity.image?.src, entity.image?.alt] : [entity.title, entity.seo?.metaTitle, entity.seo?.metaDescription, entity.image?.src, entity.image?.alt];
    const coverage = coverageFields.filter((value) => text(value)).length / coverageFields.length;
    if (coverage < 0.8) add("insufficient_coverage", `${entityType} ${entity.slug}: cobertura de campos esenciales ${Math.round(coverage * 100)}%`, "coverage");
  }
  for (const [alt, entities] of altOwners) {
    if (entities.length < 2) continue;
    for (const entity of entities) issues.push({ severity: "warning", code: "duplicate_alt", message: `Alt repetido "${alt}" en ${entities.length} elementos`, entityType: next.products.includes(entity) ? "product" : "category", entityId: entity.id, slug: entity.slug, field: "image.alt" });
  }
  return issues;
}

export function buildSyncReport(
  previous: CatalogSnapshot,
  next: CatalogSnapshot,
  diff: SyncDiff,
  validationIssues: SyncIssue[],
  mode: SyncReport["mode"],
): SyncReport {
  const allIssues = [...validationIssues, ...qualityIssues(next)];
  const errors = allIssues.filter((item) => item.severity === "error");
  const warnings = allIssues.filter((item) => item.severity === "warning");
  const byProduct: Record<string, SyncIssue[]> = {};
  for (const issue of warnings.filter((item) => item.entityType === "product")) {
    const key = issue.slug || issue.entityId || "sin-identificar";
    (byProduct[key] ||= []).push(issue);
  }
  const select = (codes: string[]) => allIssues.filter((item) => codes.includes(item.code));
  return {
    generatedAt: new Date().toISOString(),
    mode,
    counts: { categories: next.categories.length, products: next.products.length, previousCategories: previous.categories.length, previousProducts: previous.products.length },
    diff,
    errors,
    warnings,
    warningsByProduct: byProduct,
    quality: {
      jsonErrors: select(["malformed_editorial_json"]),
      duplicateSkus: select(["duplicate_sku"]),
      missingRelations: select(["missing_category_relation", "missing_product_relation"]),
      invalidImages: select(["invalid_or_empty_image"]),
      metaOutsideRecommendedLimits: select(["meta_title_length", "meta_description_length"]),
      altTextIssues: select(["empty_or_generic_alt", "duplicate_alt"]),
      faqIssues: select(["empty_faq", "possibly_truncated_faq", "duplicate_faq"]),
      insufficientCoverage: select(["insufficient_coverage"]),
    },
    redirectRequirements: diff.breakingChanges.filter((item) => item.oldPath).map((item) => ({ from: item.oldPath!, ...(item.newPath ? { to: item.newPath } : {}), entityType: item.entityType, id: item.id })),
  };
}

export function renderSyncReport(report: SyncReport): string {
  const productChanges = [
    ...report.diff.addedProducts.map((item) => `- Añadido: ${item.slug} (${item.path})`),
    ...report.diff.modifiedProducts.map((item) => `- Modificado: ${item.newSlug} [${item.changedFields.join(", ")}]${item.oldCanonical !== item.newCanonical ? `; canonical ${item.oldCanonical} → ${item.newCanonical}` : ""}`),
    ...report.diff.removedProducts.map((item) => `- Eliminado/despublicado: ${item.slug} (${item.path})`),
  ];
  const categoryChanges = [
    ...report.diff.addedCategories.map((item) => `- Añadida: ${item.slug} (${item.path})`),
    ...report.diff.modifiedCategories.map((item) => `- Modificada: ${item.newSlug} [${item.changedFields.join(", ")}]${item.oldCanonical !== item.newCanonical ? `; canonical ${item.oldCanonical} → ${item.newCanonical}` : ""}`),
    ...report.diff.removedCategories.map((item) => `- Eliminada/despublicada: ${item.slug} (${item.path})`),
  ];
  const lines = [
    "# Informe de sincronización CMS",
    "",
    `Generado: ${report.generatedAt}`,
    `Modo: ${report.mode.check ? "check" : "write"}${report.mode.strict ? " + strict" : ""}`,
    "",
    "## Resumen",
    "",
    `- Categorías: ${report.counts.categories} (antes ${report.counts.previousCategories})`,
    `- Productos: ${report.counts.products} (antes ${report.counts.previousProducts})`,
    `- Productos añadidos/modificados/eliminados: ${report.diff.addedProducts.length}/${report.diff.modifiedProducts.length}/${report.diff.removedProducts.length}`,
    `- Categorías añadidas/modificadas/eliminadas: ${report.diff.addedCategories.length}/${report.diff.modifiedCategories.length}/${report.diff.removedCategories.length}`,
    `- Errores: ${report.errors.length}`, `- Warnings: ${report.warnings.length}`,
    "", "## Cambios de productos", "",
    ...(productChanges.length ? productChanges : ["- Ninguno"]),
    "", "## Cambios de categorías", "",
    ...(categoryChanges.length ? categoryChanges : ["- Ninguno"]),
    "", "## URLs que requieren redirección", "",
    ...(report.redirectRequirements.length ? report.redirectRequirements.map((item) => `- ${item.from} → ${item.to || "eliminada/despublicada (destino pendiente)"}`) : ["- Ninguna"]),
    "", "## Errores", "",
    ...(report.errors.length ? report.errors.map((item) => `- [${item.code}] ${item.message}`) : ["- Ninguno"]),
    "", "## Warnings por producto", "",
  ];
  const grouped = Object.entries(report.warningsByProduct);
  if (!grouped.length) lines.push("- Ninguno");
  for (const [slug, items] of grouped) {
    lines.push(`### ${slug}`, "", ...items.map((item) => `- [${item.code}] ${item.message}`), "");
  }
  return `${lines.join("\n").trim()}\n`;
}

export async function writeReportFiles(report: SyncReport, outputDir: string): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(outputDir, "cms-sync-report.md"), renderSyncReport(report), "utf8"),
    fs.writeFile(path.join(outputDir, "cms-sync-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8"),
  ]);
}

export async function commitJsonSetAtomically(
  outputs: Array<{ filePath: string; data: unknown }>,
  hooks: { afterReplace?: (filePath: string, index: number) => void | Promise<void> } = {},
): Promise<void> {
  const staged: Array<{ filePath: string; tempPath: string; backupPath: string }> = [];
  try {
    for (const output of outputs) {
      await fs.mkdir(path.dirname(output.filePath), { recursive: true });
      const suffix = `${process.pid}-${Date.now()}`;
      const tempPath = `${output.filePath}.${suffix}.tmp`;
      const backupPath = `${output.filePath}.${suffix}.bak`;
      await fs.writeFile(tempPath, `${JSON.stringify(output.data, null, 2)}\n`, "utf8");
      staged.push({ filePath: output.filePath, tempPath, backupPath });
    }
    for (const item of staged) await fs.copyFile(item.filePath, item.backupPath);
    for (const [index, item] of staged.entries()) {
      await fs.rename(item.tempPath, item.filePath);
      await hooks.afterReplace?.(item.filePath, index);
    }
    await Promise.all(staged.map((item) => fs.rm(item.backupPath, { force: true })));
  } catch (error) {
    for (const item of staged) {
      try { await fs.access(item.backupPath); await fs.copyFile(item.backupPath, item.filePath); } catch { /* sin backup que restaurar */ }
      await Promise.all([fs.rm(item.tempPath, { force: true }), fs.rm(item.backupPath, { force: true })]);
    }
    throw error;
  }
}

export async function applySyncOutputs(
  check: boolean,
  outputs: Array<{ filePath: string; data: unknown }>,
  writer: typeof commitJsonSetAtomically = commitJsonSetAtomically,
): Promise<void> {
  if (check) return;
  await writer(outputs);
}
