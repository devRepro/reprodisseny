import { parseBodyMdSections } from "./parseBodyMdSections";
import { mapParsedSectionsToBlocks, mapSectionsToLegacyTabs } from "./mapSectionBlocks";

function firstNonEmpty(obj: any, keys: string[], fallback: any = "") {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

export function mapCategoryContent(category: any) {
  const bodyMd = String(
    firstNonEmpty(category, ["BodyMd", "bodyMd", "body", "markdown"], "")
  ).trim();

  const parsedSections = parseBodyMdSections(bodyMd);
  const sections = mapParsedSectionsToBlocks(parsedSections);
  const tabs = mapSectionsToLegacyTabs(sections);

  return {
    bodyMd,
    sections,
    tabs,
  };
}