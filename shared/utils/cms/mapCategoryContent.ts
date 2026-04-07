import { parseBodyMdSections } from "./parseBodyMdSections";
import { mapParsedSectionsToBlocks, mapSectionsToLegacyTabs } from "./mapSectionBlocks";

type ContentTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

type ContentFormatItem = {
  title: string;
  description: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes?: ContentFormatItem[];
  deliveryFormats?: ContentFormatItem[];
};

function firstNonEmpty(obj: any, keys: string[], fallback: any = "") {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

function parseJsonLoose<T>(input: unknown, fallback: T): T {
  if (input == null) return fallback;
  if (typeof input === "object") return input as T;

  const text = String(input ?? "").trim();
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function parseTypesMd(input: unknown): ContentTypeItem[] {
  const parsed = parseJsonLoose<unknown[]>(input, []);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const record = item as Record<string, unknown>;
        const title = String(record.title ?? "").trim();
        const description = String(record.description ?? "").trim();

        if (!title || !description) return null;

        const features = Array.isArray(record.features)
          ? record.features.map((feature) => String(feature ?? "").trim()).filter(Boolean)
          : [];

        const idealFor = String(record.idealFor ?? "").trim();

        return {
          title,
          description,
          ...(features.length ? { features } : {}),
          ...(idealFor ? { idealFor } : {}),
        };
      })
      .filter((item): item is ContentTypeItem => Boolean(item));
  }

  const text = String(input ?? "").trim();
  if (!text) return [];

  const matches = [...text.matchAll(/^###\s+(.+)\s*$/gm)];
  if (!matches.length) return [];

  const items: ContentTypeItem[] = [];

  matches.forEach((match, index) => {
    const title = String(match[1] ?? "").trim();
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length;

    const description = text
      .slice(start, end)
      .trim()
      .replace(/\n+/g, " ")
      .trim();

    if (!title || !description) return;

    items.push({
      title,
      description,
    });
  });

  return items;
}

function parseFormatsMd(input: unknown): ContentFormatsData | undefined {
  const parsed = parseJsonLoose<Record<string, unknown>>(input, {});

  if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
    const normalizeItems = (items: unknown): ContentFormatItem[] => {
      if (!Array.isArray(items)) return [];

      return items
        .map((item) => {
          if (!item || typeof item !== "object") return null;

          const record = item as Record<string, unknown>;
          const title = String(record.title ?? "").trim();
          const description = String(record.description ?? "").trim();

          if (!title || !description) return null;

          return { title, description };
        })
        .filter((item): item is ContentFormatItem => Boolean(item));
    };

    const intro = String(parsed.intro ?? "").trim();
    const shapes = normalizeItems(parsed.shapes);
    const deliveryFormats = normalizeItems(parsed.deliveryFormats);

    if (!intro && !shapes.length && !deliveryFormats.length) return undefined;

    return {
      ...(intro ? { intro } : {}),
      ...(shapes.length ? { shapes } : {}),
      ...(deliveryFormats.length ? { deliveryFormats } : {}),
    };
  }

  return undefined;
}

export function mapCategoryContent(category: any) {
  const rawBodyMd = String(
    firstNonEmpty(category, ["BodyMd", "bodyMd", "body", "markdown"], "")
  ).trim();

  const detailsMd = String(
    firstNonEmpty(category, ["DetailsMd", "detailsMd", "Description", "description"], "")
  ).trim();

  const formatsMd = String(
    firstNonEmpty(category, ["FormatsMd", "formatsMd"], "")
  ).trim();

  const usesMd = String(
    firstNonEmpty(category, ["UsesMd", "usesMd"], "")
  ).trim();

  const finishesMd = String(
    firstNonEmpty(category, ["FinishesMd", "finishesMd"], "")
  ).trim();

  const typesMd = String(
    firstNonEmpty(category, ["TypesMd", "typesMd"], "")
  ).trim();

  const typeItems = parseTypesMd(typesMd);
  const formatsData = parseFormatsMd(formatsMd);

  const editorialSourceParts = [
    detailsMd ? `## Detalles\n\n${detailsMd}` : "",
    usesMd ? `## Usos habituales\n\n${usesMd}` : "",
    finishesMd ? `## Acabados\n\n${finishesMd}` : "",
    rawBodyMd ? `## Información adicional\n\n${rawBodyMd}` : "",
    !formatsData && formatsMd ? `## Formatos y soportes\n\n${formatsMd}` : "",
  ].filter(Boolean);

  const editorialSource = editorialSourceParts.join("\n\n");

  const parsedSections = parseBodyMdSections(editorialSource).filter(
    (section) => section.key !== "tipos" && section.key !== "formats"
  );

  const editorialSections = mapParsedSectionsToBlocks(parsedSections);

  const sections = [
    ...editorialSections,
    ...(typeItems.length
      ? [
          {
            id: "types",
            key: "types",
            title: "Tipos",
            items: typeItems,
            blocks: [],
          },
        ]
      : []),
    ...(formatsData
      ? [
          {
            id: "formats",
            key: "formats",
            title: "Formatos y soportes",
            formatsData,
            blocks: [],
          },
        ]
      : []),
  ];

  const tabs = mapSectionsToLegacyTabs(editorialSections);

  return {
    bodyMd: rawBodyMd,
    sections,
    tabs,
  };
}