import type { ContentCardGroup, NormalizedCardItem } from "~/types/contentSections";

export type ParseLineOptions = {
  metaLabel?: string;
  fallbackTitlePrefix?: string;
  allowUntitled?: boolean;
};

type UnknownRecord = Record<string, unknown>;

const DEFAULT_BODY_KEYS = [
  "bodyMd",
  "detailsMd",
  "typesMd",
  "formatsMd",
  "materialsMd",
  "finishesMd",
  "usesMd",
  "applicationsMd",
  "technicalSpecsMd",
  "descriptionMd",
  "body",
  "markdown",
  "content",
  "description",
];

const DEFAULT_INTRO_KEYS = [
  "intro",
  "lead",
  "summary",
  "subtitle",
  "description",
  "text",
];

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeLineBreaks(value: unknown) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function normalizeColumns(value: unknown): 1 | 2 | 3 | 4 {
  if (value === 4 || value === "4") return 4;
  if (value === 3 || value === "3") return 3;
  if (value === 1 || value === "1") return 1;
  return 2;
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => stripMarkdownStrong(String(item || "")))
    .filter(Boolean);
}

function firstArrayFromRecord(record: UnknownRecord): unknown[] {
  const candidate =
    record.items ??
    record.cards ??
    record.values ??
    record.list ??
    record.data ??
    record.options ??
    record.benefits ??
    record.materials ??
    record.formats ??
    record.finishes ??
    record.applications ??
    record.uses ??
    record.shapes ??
    record.deliveryFormats;

  return Array.isArray(candidate) ? candidate : [];
}

export function stripMarkdownStrong(value: unknown) {
  return String(value || "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

export function cleanTitle(value: unknown) {
  return stripMarkdownStrong(value)
    .replace(/[:：]\s*$/, "")
    .trim();
}

export function normalizeMarkdownLine(value: unknown) {
  return stripMarkdownStrong(
    String(value || "")
      .replace(/^[-*•·]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .trim()
  );
}

export function parseJsonObject<T = unknown>(value: unknown): T | null {
  if (!value) return null;

  if (typeof value === "object") {
    return value as T;
  }

  const raw = String(value || "").trim();

  if (!raw) return null;

  if (!raw.startsWith("{") && !raw.startsWith("[")) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function rawSectionBody(section: unknown): string {
  if (typeof section === "string") {
    return section.trim();
  }

  if (!isRecord(section)) {
    return "";
  }

  for (const key of DEFAULT_BODY_KEYS) {
    const value = section[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function introFromKnownData(
  value: unknown,
  preferredKeys: string[] = DEFAULT_INTRO_KEYS
): string {
  const parsed = parseJsonObject<unknown>(value);

  const source = isRecord(parsed)
    ? parsed
    : isRecord(value)
      ? value
      : null;

  if (!source) {
    return "";
  }

  for (const key of preferredKeys) {
    const raw = source[key];

    if (typeof raw !== "string") {
      continue;
    }

    const text = stripMarkdownStrong(raw);

    if (text) {
      return text;
    }
  }

  return "";
}

export function markdownIntro(value: unknown) {
  const raw = normalizeLineBreaks(value).trim();

  if (!raw || raw.startsWith("{") || raw.startsWith("[")) return "";

  const paragraphs = raw
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!paragraphs.length) return "";

  const first = paragraphs[0];
  const firstLines = first
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!firstLines.length) return "";
  if (firstLines.some((line) => /^[-*•·]\s+/.test(line))) return "";
  if (/^#{1,6}\s+/.test(firstLines[0] || "")) return "";
  if (firstLines.some((line) => line.includes("|"))) return "";

  const nextParagraph = paragraphs[1] || "";
  const firstLooksLikeGroupHeading =
    firstLines.length === 1 &&
    firstLines[0].length <= 90 &&
    !firstLines[0].includes(":") &&
    !firstLines[0].includes("：") &&
    /^[-*•·]\s+/m.test(nextParagraph);

  if (firstLooksLikeGroupHeading) return "";

  return stripMarkdownStrong(firstLines.join(" "));
}

export function parseCardLine(
  line: string,
  index: number,
  options: ParseLineOptions = {}
): NormalizedCardItem | null {
  const original = String(line || "").trim();

  if (!original) return null;

  const withoutBullet = original
    .replace(/^[-*•·]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .trim();

  const boldMatch = withoutBullet.match(/^\*\*([^*]+?)\*\*:?\s*(.*)$/);
  const clean = normalizeMarkdownLine(original);
  const colonMatch = clean.match(/^([^:：]{2,110})[:：]\s*(.+)$/);

  const title = cleanTitle(boldMatch?.[1] || colonMatch?.[1] || "");
  const description = stripMarkdownStrong(
    String(boldMatch?.[2] || colonMatch?.[2] || clean).trim()
  );

  if (!description) return null;
  if (!title && options.allowUntitled === false) return null;

  const fallbackTitle = options.fallbackTitlePrefix
    ? `${options.fallbackTitlePrefix} ${String(index + 1).padStart(2, "0")}`
    : `Opción ${index + 1}`;

  return {
    title: title || fallbackTitle,
    description,
    ...(options.metaLabel
      ? { meta: `${options.metaLabel} ${String(index + 1).padStart(2, "0")}` }
      : {}),
  };
}

export function parseBodyBulletItems(
  body: unknown,
  options: ParseLineOptions = {}
): NormalizedCardItem[] {
  const raw = normalizeLineBreaks(body).trim();

  if (!raw || raw.startsWith("{") || raw.startsWith("[")) return [];

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^#{1,6}\s+/.test(line))
    .filter((line) => !line.includes("|"));

  if (!lines.length) return [];

  const bulletLines = lines.filter((line) => /^[-*•·]\s+/.test(line));

  const candidateLines = bulletLines.length
    ? bulletLines
    : lines.filter((line) => /^.{2,110}[:：]\s+.+/.test(normalizeMarkdownLine(line)));

  return candidateLines
    .map((line, index) => parseCardLine(line, index, options))
    .filter((item): item is NormalizedCardItem => Boolean(item));
}

export function slugify(value: unknown, fallback = "grupo") {
  const normalized = stripMarkdownStrong(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function splitMarkdownTableRow(line: string) {
  return String(line || "")
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => stripMarkdownStrong(cell.trim()))
    .filter(Boolean);
}

function isMarkdownTableSeparator(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

export function parseMarkdownTableGroups(
  body: unknown,
  options: { baseId: string; columns?: 1 | 2 | 3 | 4; metaLabel?: string }
): ContentCardGroup[] {
  const raw = normalizeLineBreaks(body).trim();

  if (!raw || raw.startsWith("{") || raw.startsWith("[")) return [];

  const lines = raw.split("\n").map((line) => line.trim());
  const groups: ContentCardGroup[] = [];

  let lastHeading = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) continue;

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);

    if (headingMatch) {
      lastHeading = cleanTitle(headingMatch[1]);
      continue;
    }

    const next = lines[index + 1] || "";
    const isTableStart = line.includes("|") && isMarkdownTableSeparator(next);

    if (!isTableStart) continue;

    const headers = splitMarkdownTableRow(line);
    const items: NormalizedCardItem[] = [];

    index += 2;

    while (index < lines.length && lines[index]?.includes("|")) {
      const cells = splitMarkdownTableRow(lines[index]);

      if (cells.length >= 2) {
        const title = cleanTitle(cells[0]);
        const description = stripMarkdownStrong(cells[1]);
        const tags = cells.slice(2).filter(Boolean);

        if (title && description) {
          items.push({
            title,
            description,
            ...(options.metaLabel
              ? {
                  meta: `${options.metaLabel} ${String(items.length + 1).padStart(
                    2,
                    "0"
                  )}`,
                }
              : {}),
            ...(tags.length ? { tags } : {}),
          });
        }
      }

      index += 1;
    }

    index -= 1;

    if (items.length) {
      const title =
        lastHeading ||
        cleanTitle(headers[0] && headers[1] ? `${headers[0]} y ${headers[1]}` : "");

      groups.push({
        id: `${options.baseId}-${slugify(title || `tabla-${groups.length + 1}`)}-${
          groups.length + 1
        }`,
        ...(title ? { title } : {}),
        items,
        columns: options.columns ?? 2,
      });
    }
  }

  return groups;
}

export function parseStructuredMarkdownGroups(
  body: unknown,
  options: {
    baseId: string;
    metaLabel?: string;
    fallbackTitlePrefix?: string;
    columns?: 1 | 2 | 3 | 4;
    allowUntitled?: boolean;
  }
): ContentCardGroup[] {
  const raw = normalizeLineBreaks(body)
    .replace(/^\s*[•·]\s+/gm, "- ")
    .trim();

  if (!raw || raw.startsWith("{") || raw.startsWith("[")) return [];

  const lines = raw.split("\n").map((line) => line.trim());
  const meaningful = lines.filter(Boolean);

  if (!meaningful.length) return [];

  const groups: Array<{ title?: string; items: NormalizedCardItem[] }> = [];
  let current: { title?: string; items: NormalizedCardItem[] } = { items: [] };

  function pushCurrent() {
    if (current.items.length) groups.push(current);
    current = { items: [] };
  }

  function nextMeaningfulLine(fromIndex: number) {
    for (let i = fromIndex + 1; i < lines.length; i += 1) {
      if (lines[i]) return lines[i];
    }

    return "";
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line || line.includes("|")) continue;

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    const isBullet = /^[-*•·]\s+/.test(line) || /^\d+\.\s+/.test(line);
    const next = nextMeaningfulLine(index);

    const looksLikeGroupHeading =
      !isBullet &&
      !line.includes(":") &&
      !line.includes("：") &&
      stripMarkdownStrong(line).length <= 90 &&
      (/^[-*•·]\s+/.test(next) || /^\d+\.\s+/.test(next));

    if (headingMatch || looksLikeGroupHeading) {
      pushCurrent();
      current = {
        title: cleanTitle(headingMatch?.[1] || line),
        items: [],
      };
      continue;
    }

    if (!isBullet && !line.includes(":") && !line.includes("：")) continue;

    const item = parseCardLine(line, current.items.length, {
      metaLabel: options.metaLabel,
      fallbackTitlePrefix: options.fallbackTitlePrefix,
      allowUntitled: options.allowUntitled,
    });

    if (item) current.items.push(item);
  }

  pushCurrent();

  return groups.map((group, index) => ({
    id: `${options.baseId}-${slugify(group.title || `grupo-${index + 1}`)}-${
      index + 1
    }`,
    ...(group.title ? { title: group.title } : {}),
    items: group.items,
    columns: options.columns ?? 2,
  }));
}

export function toSimpleGridItem(
  value: unknown,
  index = 0,
  options: ParseLineOptions = {}
): NormalizedCardItem | null {
  if (!value) return null;

  if (typeof value === "string") {
    return parseCardLine(value, index, options);
  }

  if (!isRecord(value)) return null;

  const title = cleanTitle(
    value.title ??
      value.name ??
      value.label ??
      value.heading ??
      value.format ??
      value.material ??
      ""
  );

  const description = stripMarkdownStrong(
    String(
      value.description ??
        value.text ??
        value.body ??
        value.content ??
        value.value ??
        value.summary ??
        ""
    ).trim()
  );

  const meta = String(value.meta ?? value.eyebrow ?? value.type ?? "").trim() || undefined;

  const tags = normalizeStringList(
    Array.isArray(value.tags)
      ? value.tags
      : Array.isArray(value.features)
        ? value.features
        : []
  );

  if (!title && !description) {
    return null;
  }

  const fallbackTitle = options.fallbackTitlePrefix
    ? `${options.fallbackTitlePrefix} ${String(index + 1).padStart(2, "0")}`
    : `Opción ${index + 1}`;

  return {
    title: title || fallbackTitle,
    description: description || title,
    ...(meta ? { meta } : {}),
    ...(tags.length ? { tags } : {}),
  };
}

export function toSimpleGridItems(
  value: unknown,
  options: ParseLineOptions = {}
): NormalizedCardItem[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item, index) => toSimpleGridItem(item, index, options))
      .filter((item): item is NormalizedCardItem => Boolean(item));
  }

  const parsed = parseJsonObject<unknown>(value);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item, index) => toSimpleGridItem(item, index, options))
      .filter((item): item is NormalizedCardItem => Boolean(item));
  }

  if (isRecord(parsed)) {
    const possibleItems = firstArrayFromRecord(parsed);

    if (possibleItems.length) {
      return possibleItems
        .map((item, index) => toSimpleGridItem(item, index, options))
        .filter((item): item is NormalizedCardItem => Boolean(item));
    }
  }

  return parseBodyBulletItems(value, options);
}

export function toCardItems(
  value: unknown,
  options: ParseLineOptions = {}
): NormalizedCardItem[] {
  return toSimpleGridItems(value, options);
}

export function toCardItemsFromJsonKey(
  value: unknown,
  key: string,
  options: ParseLineOptions = {}
): NormalizedCardItem[] {
  const parsed = parseJsonObject<unknown>(value);

  if (!isRecord(parsed)) {
    return [];
  }

  const directValue = parsed[key];

  if (Array.isArray(directValue)) {
    return toCardItems(directValue, options);
  }

  if (isRecord(directValue)) {
    const nestedItems = firstArrayFromRecord(directValue);

    if (nestedItems.length) {
      return toCardItems(nestedItems, options);
    }
  }

  return toCardItems(directValue, options);
}

export function normalizeExistingGroups(value: unknown): ContentCardGroup[] {
  const parsed = parseJsonObject<unknown>(value);

  const source = Array.isArray(parsed)
    ? parsed
    : Array.isArray(value)
      ? value
      : isRecord(parsed) && Array.isArray(parsed.groups)
        ? parsed.groups
        : isRecord(value) && Array.isArray(value.groups)
          ? value.groups
          : [];

  if (!source.length) {
    return [];
  }

  return source
    .map((group, groupIndex) => {
      if (!isRecord(group)) {
        return null;
      }

      const items = Array.isArray(group.items)
        ? group.items
            .map((item, itemIndex) => toSimpleGridItem(item, itemIndex))
            .filter((item): item is NormalizedCardItem => Boolean(item))
        : [];

      if (!items.length) {
        return null;
      }

      const title = cleanTitle(group.title);
      const description = stripMarkdownStrong(group.description ?? group.intro ?? "");

      return {
        id: String(group.id || `group-${groupIndex + 1}`).trim(),
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        items,
        columns: normalizeColumns(group.columns),
      };
    })
    .filter((group): group is ContentCardGroup => Boolean(group));
}

export function isGenericOptionTitle(value: unknown) {
  return /^Opción\s+\d+$/i.test(String(value || "").trim());
}

export function hasGenericOptionTitles(groups: ContentCardGroup[]) {
  return groups.some((group) =>
    Array.isArray(group.items)
      ? group.items.some((item) => isGenericOptionTitle(item?.title))
      : false
  );
}