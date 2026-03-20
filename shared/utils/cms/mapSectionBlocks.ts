import type {
    CmsContentBlock,
    CmsMappedSection,
    CmsMappedTab,
    ParsedBodyMdSection,
  } from "./content.types";
  
  const PROMOTABLE_KEYS = new Set([
    "beneficios",
    "aplicaciones",
    "tipos",
    "formatos-y-soportes",
    "acabados",
    "usos-habituales",
  ]);
  
  function getCleanLines(body: string) {
    return String(body || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  
  function stripBulletPrefix(line: string) {
    return line.replace(/^[-•*]\s+/, "").trim();
  }
  
  function looksLikeBulletList(body: string) {
    return getCleanLines(body).some((line) => /^[-•*]\s+/.test(line));
  }
  
  function canPromoteLinesToBullets(section: ParsedBodyMdSection, body: string) {
    if (!PROMOTABLE_KEYS.has(section.key)) return false;
  
    const lines = getCleanLines(body);
    if (lines.length < 2 || lines.length > 8) return false;
  
    return lines.every((line) => {
      if (line.length > 160) return false;
      if (line.endsWith(":")) return false;
      if (/^##\s+/.test(line)) return false;
      return true;
    });
  }
  
  function toBullets(body: string) {
    return getCleanLines(body)
      .map(stripBulletPrefix)
      .filter(Boolean);
  }
  
  export function mapParsedSectionsToBlocks(
    sections: ParsedBodyMdSection[]
  ): CmsMappedSection[] {
    return sections.map((section) => {
      const body = String(section.body || "").trim();
  
      let blocks: CmsContentBlock[];
  
      if (looksLikeBulletList(body) || canPromoteLinesToBullets(section, body)) {
        const items = toBullets(body);
        blocks = items.length
          ? [{ type: "bullets", items }]
          : [{ type: "text", text: body, html: false }];
      } else {
        blocks = [{ type: "text", text: body, html: false }];
      }
  
      return {
        id: section.id,
        key: section.key,
        title: section.title,
        body,
        blocks,
        step: section.step,
      };
    });
  }
  
  export function mapSectionsToLegacyTabs(sections: CmsMappedSection[]): CmsMappedTab[] {
    return sections.map((section) => ({
      id: section.id,
      title: section.title,
      text: section.body,
      blocks: section.blocks,
      step: section.step,
    }));
  }