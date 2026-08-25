import MarkdownIt from "markdown-it";

import type {
  ContentCardGroup,
  ContentSectionDiagnostic,
  ContentSectionKey,
  ContentSectionPattern,
  ContentSectionSource,
  NormalizedCardItem,
  SectionEntityType,
  SectionInput,
  SectionViewModel,
} from "../../types/contentSections";
import { normalizeTechnicalHighlights } from "./technicalHighlights";
import {
  CANONICAL_SECTION_KEYS,
  normalizeSectionKey,
  resolveSectionKey,
} from "./sectionsKey";

type UnknownRecord = Record<string, unknown>;

export type SectionNormalizationOptions = {
  entityType: SectionEntityType;
  url?: string;
  dev?: boolean;
};

export type SectionNormalizationResult = {
  sections: SectionViewModel[];
  diagnostics: ContentSectionDiagnostic[];
};

const PRODUCT_SECTION_ORDER: ContentSectionKey[] = [
  "details",
  "formats",
  "materials",
  "finishes",
  "applications",
  "technical-specs",
];

const CATEGORY_SECTION_ORDER: ContentSectionKey[] = [
  "details",
  "benefits",
  "types",
  "formats",
  "materials",
  "finishes",
  "applications",
  "technical-specs",
];

const SECTION_TITLES: Record<ContentSectionKey, string> = {
  details: "Detalles",
  benefits: "Beneficios",
  types: "Tipos",
  formats: "Formatos",
  materials: "Materiales",
  finishes: "Acabados",
  applications: "Aplicaciones",
  "technical-specs": "Características técnicas",
};

const SOURCE_BY_SECTION: Record<
  ContentSectionKey,
  Exclude<ContentSectionSource, "UsesMd" | "unknown">
> = {
  details: "DetailsMd",
  benefits: "BenefitsMd",
  types: "TypesMd",
  formats: "FormatsMd",
  materials: "MaterialsMd",
  finishes: "FinishesMd",
  applications: "ApplicationsMd",
  "technical-specs": "TechnicalSpecsMd",
};

const COLLECTION_BY_SECTION: Partial<Record<ContentSectionKey, string>> = {
  benefits: "benefits",
  types: "types",
  materials: "materials",
  finishes: "finishes",
  applications: "applications",
};

const markdown = new MarkdownIt({
  html: false,
  breaks: false,
  linkify: true,
  typographer: false,
});

const unsafeLinkProtocol = /^(?:javascript|vbscript|file|data):/i;

// Markdown-it ya rechaza estos protocolos por defecto. Mantenemos la política
// explícita para que el contrato de contenido no dependa de un default futuro.
markdown.validateLink = (value) => {
  const normalized = value.replace(/[\u0000-\u0020\u007f]+/g, "").trim();
  return !unsafeLinkProtocol.test(normalized);
};

const defaultHeadingOpen = markdown.renderer.rules.heading_open;
const defaultHeadingClose = markdown.renderer.rules.heading_close;

markdown.renderer.rules.heading_open = (tokens, index, options, env, renderer) => {
  const level = Number(tokens[index]?.tag.slice(1)) || 3;
  tokens[index]!.tag = level <= 3 ? "h3" : "h4";
  return defaultHeadingOpen
    ? defaultHeadingOpen(tokens, index, options, env, renderer)
    : renderer.renderToken(tokens, index, options);
};

markdown.renderer.rules.heading_close = (tokens, index, options, env, renderer) => {
  const level = Number(tokens[index]?.tag.slice(1)) || 3;
  tokens[index]!.tag = level <= 3 ? "h3" : "h4";
  return defaultHeadingClose
    ? defaultHeadingClose(tokens, index, options, env, renderer)
    : renderer.renderToken(tokens, index, options);
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeLineBreaks(value: unknown) {
  const source = text(value).replace(/\]\(([^)]*)\)/g, (match, destination: string) => {
    const repaired = destination.startsWith("/")
      ? destination
          .replace(/\r/g, "/r")
          .replace(/\n/g, "/n")
          .replace(/\t/g, "/t")
          .replace(/\/{2,}/g, "/")
      : destination.replace(/[\r\n\t]+/g, "");

    return match.replace(destination, repaired);
  });

  return source.replace(/\r\n?/g, "\n");
}

function slugify(value: unknown, fallback: string) {
  const result = cleanInlineText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return result || fallback;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripDuplicateLeadingHeading(value: string, title: string) {
  const raw = normalizeLineBreaks(value);
  const escapedTitle = escapeRegExp(cleanInlineText(title));

  if (!escapedTitle) return raw;

  return raw
    .replace(new RegExp(`^#{1,6}\\s+${escapedTitle}\\s*\\n+`, "i"), "")
    .trim();
}

export function renderSectionMarkdown(value: unknown, title = "") {
  const body = stripDuplicateLeadingHeading(text(value), title);
  return body ? markdown.render(body).trim() : "";
}

export function renderInlineSectionMarkdown(value: unknown) {
  const source = text(value);
  return source ? markdown.renderInline(source).trim() : "";
}

export function cleanInlineText(value: unknown) {
  return text(value)
    .replace(/^#{1,6}\s+/, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1$2")
    .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function normalizeStringList(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => cleanInlineText(item)).filter(Boolean)
    : [];
}

function firstArray(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }

  return [];
}

function parseJson(value: unknown) {
  if (Array.isArray(value) || isRecord(value)) {
    return { value, validity: "valid" as const, jsonLike: true };
  }

  const source = text(value);
  const jsonLike =
    source.startsWith("{") ||
    /^\[\s*(?:[\[{"\d-]|true\b|false\b|null\b|\])/i.test(source);

  if (!jsonLike) {
    return { value: null, validity: "not-applicable" as const, jsonLike: false };
  }

  try {
    return { value: JSON.parse(source) as unknown, validity: "valid" as const, jsonLike };
  } catch {
    return { value: null, validity: "invalid" as const, jsonLike };
  }
}

function rawBody(section: Partial<SectionInput> & UnknownRecord) {
  const direct = [section.body, section.text, section.html].find(
    (value) => typeof value === "string" && value.trim()
  );

  return text(direct);
}

function sourceFor(key: ContentSectionKey, entityType: SectionEntityType) {
  if (key === "applications" && entityType === "category") return "UsesMd";
  return SOURCE_BY_SECTION[key];
}

function patternFor(key: ContentSectionKey): ContentSectionPattern {
  if (key === "details") return "editorial";
  if (key === "technical-specs") return "technical-specs";
  return "structured-grid";
}

function normalizeCardItem(
  value: unknown,
  index: number,
  fallbackPrefix: string
): NormalizedCardItem | null {
  if (typeof value === "string") {
    return cardFromMarkdownLine(value, index, fallbackPrefix);
  }

  if (!isRecord(value)) return null;

  const title = cleanInlineText(
    value.title ?? value.name ?? value.label ?? value.heading ?? value.material ?? value.format
  );
  const descriptionSource = text(
    value.description ?? value.text ?? value.body ?? value.content ?? value.summary ?? value.value
  );
  const description = cleanInlineText(descriptionSource);

  if (!title && !description) return null;

  const resolvedTitle = title || `${fallbackPrefix} ${String(index + 1).padStart(2, "0")}`;
  const features = normalizeStringList(
    Array.isArray(value.features) ? value.features : value.tags
  );
  const tags = normalizeStringList(value.tags);
  const idealFor = cleanInlineText(value.idealFor);
  const meta = cleanInlineText(value.meta ?? value.eyebrow ?? value.type);
  const icon = text(value.icon);

  return {
    id: text(value.id) || `${slugify(resolvedTitle, "item")}-${index + 1}`,
    title: resolvedTitle,
    description: description || resolvedTitle,
    descriptionHtml: renderInlineSectionMarkdown(descriptionSource || resolvedTitle),
    ...(meta ? { meta } : {}),
    ...(tags.length ? { tags } : {}),
    ...(features.length ? { features } : {}),
    ...(idealFor ? { idealFor } : {}),
    ...(icon ? { icon } : {}),
  };
}

function derivedTitle(value: string, fallbackPrefix: string, index: number) {
  const beforeParenthesis = value.split(/\s*\(/, 1)[0]?.trim();
  const beforeDash = value.split(/\s+[—–]\s+/, 1)[0]?.trim();
  const candidate = beforeParenthesis || beforeDash || value;
  const words = candidate.replace(/[.:;,]+$/, "").split(/\s+/).filter(Boolean);

  if (words.length >= 2 && words.length <= 8 && candidate.length <= 70) {
    return candidate.replace(/[.:;,]+$/, "");
  }

  if (words.length > 2) {
    return words.slice(0, 6).join(" ").replace(/[.:;,]+$/, "");
  }

  return `${fallbackPrefix} ${String(index + 1).padStart(2, "0")}`;
}

function cardFromMarkdownLine(
  value: string,
  index: number,
  fallbackPrefix: string
): NormalizedCardItem | null {
  const original = text(value)
    .replace(/^[-*•·]\s+/, "")
    .replace(/^\d+\.\s+/, "");

  if (!original) return null;

  const bold = original.match(/^\*\*([^*]+?)\*\*:?[ \t]*(.*)$/);
  const cleaned = cleanInlineText(original);
  const colon = cleaned.match(/^([^:：]{2,110})[:：]\s*(.+)$/);
  const title = cleanInlineText(bold?.[1] || colon?.[1]) || derivedTitle(cleaned, fallbackPrefix, index);
  const descriptionSource = text(bold?.[2] || colon?.[2] || original);
  const description = cleanInlineText(descriptionSource);

  if (!title || !description) return null;

  return {
    id: `${slugify(title, "item")}-${index + 1}`,
    title,
    description,
    descriptionHtml: renderInlineSectionMarkdown(descriptionSource),
  };
}

function markdownIntroAndGroups(
  body: string,
  key: ContentSectionKey
): { intro?: string; groups: ContentCardGroup[] } {
  const lines = normalizeLineBreaks(body)
    .replace(/^\s*[•·]\s+/gm, "- ")
    .split("\n");
  const fallbackPrefix = SECTION_TITLES[key].replace(/s$/, "") || "Opción";
  const firstMeaningful = lines.findIndex((line) => line.trim());
  let intro = "";

  if (firstMeaningful >= 0) {
    const firstParagraph: string[] = [];

    for (let index = firstMeaningful; index < lines.length; index += 1) {
      const line = lines[index]!.trim();
      if (!line) break;
      if (/^(?:#{1,6}\s+|[-*]\s+|\d+\.\s+)/.test(line)) break;
      firstParagraph.push(line);
    }

    const afterParagraph = lines.slice(firstMeaningful + firstParagraph.length).join("\n");
    if (
      firstParagraph.length > 0 &&
      /(?:^|\n)\s*(?:#{1,6}\s+|[-*]\s+|\d+\.\s+)/m.test(afterParagraph)
    ) {
      intro = cleanInlineText(firstParagraph.join(" "));
      lines.splice(firstMeaningful, firstParagraph.length);
    }
  }

  const groups: ContentCardGroup[] = [];
  let currentTitle = "";
  let currentItems: NormalizedCardItem[] = [];

  const flush = () => {
    if (!currentItems.length) return;
    const groupIndex = groups.length + 1;
    groups.push({
      id: `${key}-${slugify(currentTitle, `group-${groupIndex}`)}-${groupIndex}`,
      ...(currentTitle ? { title: currentTitle } : {}),
      items: currentItems,
      columns: key === "applications" || key === "finishes" ? 3 : 3,
    });
    currentItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flush();
      currentTitle = cleanInlineText(heading[1]);
      continue;
    }

    if (/^\|?\s*:?-{3,}/.test(line) || line.includes("|")) continue;

    const item = cardFromMarkdownLine(line, currentItems.length, fallbackPrefix);
    if (item) currentItems.push(item);
  }

  flush();

  return {
    ...(intro ? { intro } : {}),
    groups,
  };
}

function groupsFromRecord(
  value: unknown,
  key: ContentSectionKey,
  baseId: string
): { intro?: string; groups: ContentCardGroup[] } {
  const record = isRecord(value) ? value : null;
  if (!record) return { groups: [] };

  const intro = cleanInlineText(record.intro ?? record.lead ?? record.summary);
  const fallbackPrefix = SECTION_TITLES[key].replace(/s$/, "") || "Opción";

  if (key === "formats") {
    const groups: ContentCardGroup[] = [];
    const shapes = firstArray(record, ["shapes", "forms", "items"])
      .map((item, index) => normalizeCardItem(item, index, "Formato"))
      .filter((item): item is NormalizedCardItem => Boolean(item));
    const delivery = firstArray(record, ["deliveryFormats", "presentations", "delivery"])
      .map((item, index) => normalizeCardItem(item, index, "Presentación"))
      .filter((item): item is NormalizedCardItem => Boolean(item));

    if (shapes.length) {
      groups.push({ id: `${baseId}-shapes`, title: "Formas disponibles", items: shapes, columns: 3 });
    }
    if (delivery.length) {
      groups.push({
        id: `${baseId}-delivery-formats`,
        title: "Formatos y presentación",
        items: delivery,
        columns: 3,
      });
    }

    return { ...(intro ? { intro } : {}), groups };
  }

  const collectionKey = COLLECTION_BY_SECTION[key] || "items";
  const items = firstArray(record, [collectionKey, "items", "cards", "values", "options"])
    .map((item, index) => normalizeCardItem(item, index, fallbackPrefix))
    .filter((item): item is NormalizedCardItem => Boolean(item));

  return {
    ...(intro ? { intro } : {}),
    groups: items.length
      ? [{ id: `${baseId}-${key}`, items, columns: key === "types" ? 3 : 3 }]
      : [],
  };
}

function structuredPayload(section: Partial<SectionInput> & UnknownRecord, key: ContentSectionKey) {
  if (Array.isArray(section.cardGroups)) return { groups: section.cardGroups };
  if (key === "types" && Array.isArray(section.items)) return { items: section.items };

  const dataKey = `${key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}Data`;
  if (section[dataKey]) return section[dataKey];
  return null;
}

function normalizeExistingGroups(
  value: unknown,
  key: ContentSectionKey
): ContentCardGroup[] {
  const source = isRecord(value) && Array.isArray(value.groups) ? value.groups : value;
  if (!Array.isArray(source)) return [];

  const result: ContentCardGroup[] = [];

  source.forEach((group, groupIndex) => {
    if (!isRecord(group)) return;
    const items = Array.isArray(group.items)
      ? group.items
          .map((item, itemIndex) => normalizeCardItem(item, itemIndex, SECTION_TITLES[key]))
          .filter((item): item is NormalizedCardItem => Boolean(item))
      : [];

    if (!items.length) return;
    const title = cleanInlineText(group.title);
    result.push({
      id: text(group.id) || `${key}-group-${groupIndex + 1}`,
      ...(title ? { title } : {}),
      items,
      columns: [1, 2, 3, 4].includes(Number(group.columns))
        ? (Number(group.columns) as 1 | 2 | 3 | 4)
        : 3,
    });
  });

  return result;
}

function makeDiagnostic(
  section: Partial<SectionInput> & UnknownRecord,
  options: SectionNormalizationOptions,
  canonicalId: ContentSectionKey | "",
  source: ContentSectionSource
): ContentSectionDiagnostic {
  return {
    url: options.url || "",
    entityType: options.entityType,
    sectionId: text(section.id),
    sectionKey: text(section.key),
    sectionKind: text(section.kind),
    canonicalId,
    source,
    detectedFormat: "empty",
    expectedRenderer: canonicalId ? patternFor(canonicalId) : "none",
    actualRenderer: "none",
    structuredValid: false,
    jsonValidity: "not-applicable",
    markdownValid: false,
    fallbackUsed: false,
    plainTextRisk: false,
    empty: true,
    duplicate: false,
    unknownAlias: false,
    problem: "",
    action: "",
  };
}

function warnUnsupported(
  options: SectionNormalizationOptions,
  key: string,
  source: ContentSectionSource,
  reason: string
) {
  const importMeta = import.meta as ImportMeta & { dev?: boolean };
  if (!(options.dev ?? Boolean(importMeta.dev))) return;

  console.warn(
    `[content-section] Unsupported section payload\nurl=${options.url || "unknown"}\nsection=${key || "unknown"}\nsource=${source}\nreason=${reason}`
  );
}

function mergeSections(current: SectionViewModel, incoming: SectionViewModel) {
  const html = [current.html, incoming.html].filter(Boolean).join("\n");
  const groups = [...current.groups, ...incoming.groups];
  const highlights = normalizeTechnicalHighlights([
    ...current.technicalHighlights,
    ...incoming.technicalHighlights,
  ]);

  return {
    ...current,
    ...(current.intro || incoming.intro ? { intro: current.intro || incoming.intro } : {}),
    ...(html ? { html } : {}),
    groups,
    technicalHighlights: highlights,
  };
}

export function normalizeContentSections(
  input: unknown,
  options: SectionNormalizationOptions
): SectionNormalizationResult {
  const rawSections = Array.isArray(input) ? input : [];
  const order = options.entityType === "category" ? CATEGORY_SECTION_ORDER : PRODUCT_SECTION_ORDER;
  const allowed = new Set(order);
  const byId = new Map<ContentSectionKey, SectionViewModel>();
  const diagnostics: ContentSectionDiagnostic[] = [];

  for (const rawSection of rawSections) {
    if (!isRecord(rawSection)) continue;

    const raw = rawSection as Partial<SectionInput> & UnknownRecord;
    const resolved = resolveSectionKey(raw);
    const rawKey = normalizeSectionKey(raw.kind || raw.key || raw.id);
    const body = rawBody(raw);
    const unknownTextual = !resolved && Boolean(body);
    const key = resolved || (unknownTextual ? "details" : "");
    const source = resolved ? sourceFor(resolved, options.entityType) : "unknown";
    const diagnostic = makeDiagnostic(raw, options, key, source);

    diagnostic.unknownAlias = !resolved && Boolean(rawKey);
    diagnostic.fallbackUsed = unknownTextual;

    if (unknownTextual) {
      warnUnsupported(
        options,
        rawKey,
        "unknown",
        "Alias desconocido; el contenido textual se renderiza como rich text seguro"
      );
    }

    if (!key) {
      diagnostic.detectedFormat = body ? "unknown" : "empty";
      diagnostic.problem = body ? "Alias desconocido con payload no textual" : "Sección vacía";
      diagnostic.action = "Omitida de forma segura";
      warnUnsupported(options, rawKey, "unknown", diagnostic.problem);
      diagnostics.push(diagnostic);
      continue;
    }

    if (!allowed.has(key)) {
      const excludedPayload = structuredPayload(raw, key);
      const excludedJson = parseJson(excludedPayload || body);

      diagnostic.jsonValidity = excludedJson.validity;
      diagnostic.structuredValid = excludedJson.validity === "valid";
      diagnostic.markdownValid = Boolean(
        body && excludedJson.validity === "not-applicable"
      );
      diagnostic.detectedFormat = diagnostic.structuredValid
        ? "json"
        : diagnostic.markdownValid
          ? "markdown"
          : excludedJson.validity === "invalid"
            ? "unknown"
            : "empty";
      diagnostic.empty = !excludedPayload && !body;
      diagnostic.problem = `Sección fuera del contrato de ${options.entityType}`;
      diagnostic.action = "No se publica como tab para este tipo de página";
      diagnostics.push(diagnostic);
      continue;
    }

    const title = text(raw.title) || SECTION_TITLES[key];
    const pattern = patternFor(key);
    const highlights = normalizeTechnicalHighlights(raw.technicalHighlights);
    let intro = cleanInlineText(raw.intro);
    let html = "";
    let groups: ContentCardGroup[] = [];
    let contentFormat: SectionViewModel["contentFormat"] = "text";

    const jsonBody = parseJson(body);
    diagnostic.jsonValidity = jsonBody.validity;

    if (pattern === "structured-grid") {
      const directPayload = structuredPayload(raw, key);
      const parsedPayload = parseJson(directPayload);
      const bodyPayload = jsonBody.value;
      const payload = directPayload || bodyPayload;
      const existingGroups = normalizeExistingGroups(payload, key);
      const structured = existingGroups.length
        ? { groups: existingGroups }
        : groupsFromRecord(
            isRecord(payload)
              ? payload
              : key === "types" && Array.isArray(raw.items)
                ? { items: raw.items }
                : {},
            key,
            text(raw.id) || key
          );

      groups = structured.groups;
      intro = intro || structured.intro || "";
      diagnostic.jsonValidity =
        parsedPayload.validity === "invalid" || jsonBody.validity === "invalid"
          ? "invalid"
          : parsedPayload.validity === "valid" || jsonBody.validity === "valid"
            ? "valid"
            : "not-applicable";

      if (groups.length) {
        contentFormat = "structured";
        diagnostic.detectedFormat = "json";
        diagnostic.structuredValid = true;
      } else if (body && jsonBody.validity !== "invalid" && !jsonBody.jsonLike) {
        const parsedMarkdown = markdownIntroAndGroups(body, key);
        groups = parsedMarkdown.groups;
        intro = intro || parsedMarkdown.intro || "";
        contentFormat = "markdown";
        diagnostic.detectedFormat = "markdown";
        diagnostic.markdownValid = true;
        diagnostic.structuredValid = groups.length > 0;
      }

      if (!groups.length) {
        diagnostic.problem =
          diagnostic.jsonValidity === "invalid"
            ? "JSON estructurado inválido"
            : "Payload estructurado sin elementos interpretables";
        diagnostic.action = "Omitido; nunca se serializa como texto visible";
        diagnostic.plainTextRisk = false;
        warnUnsupported(options, key, source, diagnostic.problem);
      }
    } else {
      let markdownBody = body;

      if (isRecord(jsonBody.value)) {
        markdownBody = text(
          jsonBody.value.body ?? jsonBody.value.markdown ?? jsonBody.value.text
        );
      }

      if (jsonBody.validity === "invalid") {
        diagnostic.detectedFormat = "unknown";
        diagnostic.problem = "JSON inválido en una sección textual";
        diagnostic.action = "Omitido; nunca se serializa como texto visible";
        warnUnsupported(options, key, source, diagnostic.problem);
      } else if (markdownBody) {
        html = renderSectionMarkdown(markdownBody, title);
        contentFormat = "markdown";
        diagnostic.detectedFormat = "markdown";
        diagnostic.markdownValid = Boolean(html);
      }
    }

    const useful = Boolean(html || groups.length || highlights.length);
    diagnostic.empty = !useful;

    if (!useful) {
      if (!diagnostic.problem) {
        diagnostic.problem = "Sección vacía después de normalizar";
        diagnostic.action = "No se crea tab vacía";
      }
      diagnostics.push(diagnostic);
      continue;
    }

    const viewModel: SectionViewModel = {
      id: key,
      key,
      kind: key,
      title,
      source,
      sourceKey: rawKey || key,
      contentFormat,
      pattern,
      ...(intro ? { intro } : {}),
      ...(html ? { html } : {}),
      groups,
      technicalHighlights: highlights,
    };

    diagnostic.actualRenderer = pattern;
    diagnostic.empty = false;
    diagnostic.action ||= "Renderizado canónico";

    if (byId.has(key)) {
      diagnostic.duplicate = true;
      diagnostic.problem = "Sección canónica duplicada";
      diagnostic.action = "Fusionada de forma determinista";
      byId.set(key, mergeSections(byId.get(key)!, viewModel));
    } else {
      byId.set(key, viewModel);
    }

    diagnostics.push(diagnostic);
  }

  const sections = order
    .map((key) => byId.get(key))
    .filter((section): section is SectionViewModel => Boolean(section));

  return { sections, diagnostics };
}

export function isSectionViewModel(value: unknown): value is SectionViewModel {
  if (!isRecord(value)) return false;
  const key = value.id as ContentSectionKey;
  return (
    CANONICAL_SECTION_KEYS.includes(key) &&
    value.key === key &&
    value.kind === key &&
    ["editorial", "structured-grid", "technical-specs"].includes(text(value.pattern)) &&
    Boolean(text(value.title)) &&
    (Boolean(text(value.html)) ||
      (Array.isArray(value.groups) && value.groups.length > 0) ||
      (Array.isArray(value.technicalHighlights) && value.technicalHighlights.length > 0))
  );
}
