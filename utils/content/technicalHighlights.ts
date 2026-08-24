import type {
  TechnicalHighlight,
  TechnicalHighlightIcon,
} from "~/types/contentSections";

export const MAX_TECHNICAL_HIGHLIGHTS = 4;

const TECHNICAL_HIGHLIGHT_ICONS = new Set<TechnicalHighlightIcon>([
  "circle-gauge",
  "clipboard-check",
  "file-check-2",
  "palette",
  "printer",
  "ruler",
  "scissors",
  "settings-2",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIcon(value: unknown): TechnicalHighlightIcon | undefined {
  const icon = normalizeText(value).toLowerCase().replace(/^lucide:/, "");

  return TECHNICAL_HIGHLIGHT_ICONS.has(icon as TechnicalHighlightIcon)
    ? (icon as TechnicalHighlightIcon)
    : undefined;
}

export function normalizeTechnicalHighlights(value: unknown): TechnicalHighlight[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const highlights: TechnicalHighlight[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;

    const title = normalizeText(item.title);
    const description = normalizeText(item.description);

    if (!title || !description) continue;

    const signature = `${title.toLocaleLowerCase("es")}\u0000${description.toLocaleLowerCase("es")}`;
    if (seen.has(signature)) continue;

    const icon = normalizeIcon(item.icon);

    highlights.push({
      title,
      description,
      ...(icon ? { icon } : {}),
    });
    seen.add(signature);

    if (highlights.length === MAX_TECHNICAL_HIGHLIGHTS) break;
  }

  return highlights;
}
