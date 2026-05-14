import type { ContentCardGroup, NormalizedCardItem } from "~/types/contentSections";

type ParseLineOptions = {
  metaLabel?: string;
  fallbackTitlePrefix?: string;
  allowUntitled?: boolean;
};

export function stripMarkdownStrong(value: string) {
  return String(value || "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

export function cleanTitle(value: unknown) {
  return stripMarkdownStrong(String(value || ""))
    .replace(/[:：]\s*$/, "")
    .trim();
}

export function normalizeMarkdownLine(value: string) {
  return stripMarkdownStrong(
    String(value || "")
      .replace(/^[-*•·]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .trim()
  );
}

export function markdownIntro(value: unknown) {
  const raw = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!raw || raw.startsWith("{")) return "";

  const paragraphs = raw
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!paragraphs.length) return "";

  const first = paragraphs[0];
  const firstLines = first.split("\n").map((line) => line.trim()).filter(Boolean);

  if (!firstLines.length) return "";
  if (firstLines.some((line) => /^[-*•·]\s+/.test(line))) return "";
  if (/^#{1,6}\s+/.test(firstLines[0] || "")) return "";
  if (firstLines.some((line) => line.includes("|"))) return "";

  const nextParagraph = paragraphs[1] || "";
  const firstLooksLikeGroupHeading =
    firstLines.length === 1 &&
    firstLines[0].length <= 90 &&
    !firstLines[0].includes(":") &&
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
  const raw = String(body || "").trim();

  if (!raw || raw.startsWith("{")) return [];

  const lines = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
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

export function slugify(value: string, fallback = "grupo") {
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
    .filter((cell) => cell.length > 0);
}

function isMarkdownTableSeparator(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

export function parseMarkdownTableGroups(
  body: unknown,
  options: { baseId: string; columns?: 1 | 2 | 3 | 4; metaLabel?: string }
): ContentCardGroup[] {
  const raw = String(body || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!raw || raw.startsWith("{")) return [];

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
            ...(tags.length ? { tags, features: tags } : {}),
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
  const raw = String(body || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/^\s*[•·]\s+/gm, "- ")
    .trim();

  if (!raw || raw.startsWith("{")) return [];

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