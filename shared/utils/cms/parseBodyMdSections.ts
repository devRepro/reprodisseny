import type { CmsSectionKey, ParsedBodyMdSection } from "./content.types";

export function slugify(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

function normalizeSectionKey(title: string): CmsSectionKey {
  const slug = slugify(title);

  if (["detalles", "detalle", "descripcion"].includes(slug)) return "detalles";
  if (["beneficios", "ventajas"].includes(slug)) return "beneficios";
  if (["aplicaciones", "casos-de-uso"].includes(slug)) return "aplicaciones";
  if (
    [
      "caracteristicas-tecnicas",
      "especificaciones",
      "especificaciones-tecnicas",
      "ficha-tecnica",
    ].includes(slug)
  ) {
    return "caracteristicas-tecnicas";
  }
  if (["tipos", "modelos", "versiones"].includes(slug)) return "tipos";
  if (["formatos-y-soportes", "formatos", "soportes"].includes(slug)) {
    return "formatos-y-soportes";
  }
  if (["acabados"].includes(slug)) return "acabados";
  if (["usos-habituales", "usos"].includes(slug)) return "usos-habituales";

  return "otros";
}

export function hasStructuredBodyMd(bodyMd: unknown) {
  const text = String(bodyMd ?? "").trim();
  return /^##\s+/m.test(text);
}

export function parseBodyMdSections(bodyMd: unknown): ParsedBodyMdSection[] {
  const text = String(bodyMd ?? "").trim();
  if (!text) return [];

  if (!hasStructuredBodyMd(text)) {
    return [
      {
        id: "detalles",
        key: "detalles",
        title: "Detalles",
        body: text,
        step: 1,
      },
    ];
  }

  const sections: ParsedBodyMdSection[] = [];
  const matches = [...text.matchAll(/^##\s+(.+)\s*$/gm)];

  if (!matches.length) {
    return [
      {
        id: "detalles",
        key: "detalles",
        title: "Detalles",
        body: text,
        step: 1,
      },
    ];
  }

  const firstHeadingIndex = matches[0].index ?? 0;
  const preamble = text.slice(0, firstHeadingIndex).trim();

  if (preamble) {
    sections.push({
      id: "detalles",
      key: "detalles",
      title: "Detalles",
      body: preamble,
      step: 1,
    });
  }

  matches.forEach((match, index) => {
    const rawTitle = String(match[1] ?? "").trim();
    const title = rawTitle || `Sección ${index + 1}`;
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length;
    const body = text.slice(start, end).trim();

    if (!body) return;

    sections.push({
      id: slugify(title) || `section-${index + 1}`,
      key: normalizeSectionKey(title),
      title,
      body,
      step: sections.length + 1,
    });
  });

  return sections;
}