import { computed } from "vue";
import type {
  ContentCardGroup,
  ContentSectionHeaderMode,
  ContentSectionKind,
  ResolvedFormatsData,
  SectionInput,
  SimpleGridItem,
} from "~/types/contentSections";
import {
  eyebrowForCards,
  resolveSectionKey,
  variantForCards,
} from "~/utils/content/sectionsKey";
import {
  hasGenericOptionTitles,
  markdownIntro,
  parseBodyBulletItems,
  parseMarkdownTableGroups,
  parseStructuredMarkdownGroups,
} from "~/utils/content/sectionMarkdownParser";
import {
  introFromKnownData,
  normalizeExistingGroups,
  parseJsonObject,
  rawSectionBody,
  toCardItems,
  toCardItemsFromJsonKey,
  toSimpleGridItem,
  toSimpleGridItems,
} from "~/utils/content/sectionCardNormalizer";

type UseResolvedContentSectionOptions = {
  section: () => SectionInput;
  headerMode: () => ContentSectionHeaderMode;
};

const simpleGridSectionKeys = new Set([
  "types",
  "benefits",
  "materials",
  "applications",
]);

function createGroup(
  id: string,
  items: ContentCardGroup["items"],
  columns: 1 | 2 | 3 | 4
): ContentCardGroup[] {
  return items.length ? [{ id, items, columns }] : [];
}

export function useResolvedContentSection(options: UseResolvedContentSectionOptions) {
  const section = computed(() => options.section());
  const headerMode = computed(() => options.headerMode());

  const key = computed(() => resolveSectionKey(section.value));

  const body = computed(() => rawSectionBody(section.value));

  const parsedBodyData = computed(() =>
    parseJsonObject(section.value?.body || section.value?.text)
  );

  const title = computed(() =>
    headerMode.value === "default" ? String(section.value.title || "").trim() : ""
  );

  const existingCardGroups = computed(() => normalizeExistingGroups(section.value.cardGroups));

  const hasExistingCardGroups = computed(() => existingCardGroups.value.length > 0);

  const kind = computed<ContentSectionKind>(() => {
    if (key.value === "details") return "details";

    if (
      key.value === "benefits" ||
      key.value === "materials" ||
      key.value === "formats" ||
      key.value === "finishes" ||
      key.value === "applications" ||
      key.value === "technical-specs" ||
      key.value === "types" ||
      hasExistingCardGroups.value
    ) {
      return "cards";
    }

    return "default";
  });

  const intro = computed(() => {
    const sectionIntro = String(section.value?.intro || "").trim();
    const dataIntro = introFromKnownData(section.value, key.value);
    const jsonIntro = String(parsedBodyData.value?.intro || "").trim();
    const mdIntro = markdownIntro(body.value);

    return sectionIntro || dataIntro || jsonIntro || mdIntro || undefined;
  });

  const typeItems = computed<SimpleGridItem[]>(() => toSimpleGridItems(section.value.items));

  const cardGroups = computed<ContentCardGroup[]>(() => {
    if (existingCardGroups.value.length) {
      if (key.value === "technical-specs" && hasGenericOptionTitles(existingCardGroups.value)) {
        return [];
      }

      return existingCardGroups.value;
    }

    if (key.value === "benefits") {
      const dataItems = toCardItems(section.value.benefitsData?.benefits);
      const jsonItems = toCardItemsFromJsonKey(parsedBodyData.value, "benefits");
      const markdownItems = parseBodyBulletItems(body.value, {
        fallbackTitlePrefix: "Beneficio",
      });

      const items = dataItems.length
        ? dataItems
        : jsonItems.length
          ? jsonItems
          : markdownItems;

      return createGroup(`${section.value.id}-benefits`, items, 3);
    }

    if (key.value === "materials") {
      const dataItems = toCardItems(section.value.materialsData?.materials);
      const jsonItems = toCardItemsFromJsonKey(parsedBodyData.value, "materials");
      const markdownItems = parseBodyBulletItems(body.value, {
        metaLabel: "Material",
        fallbackTitlePrefix: "Material",
      });

      const items = dataItems.length
        ? dataItems
        : jsonItems.length
          ? jsonItems
          : markdownItems;

      return createGroup(`${section.value.id}-materials`, items, 3);
    }

    if (key.value === "formats") {
      const shapesData = toCardItems(section.value.formatsData?.shapes);
      const shapesJson = toCardItemsFromJsonKey(parsedBodyData.value, "shapes");
      const shapes = shapesData.length ? shapesData : shapesJson;

      const deliveryData = toCardItems(section.value.formatsData?.deliveryFormats);
      const deliveryJson = toCardItemsFromJsonKey(parsedBodyData.value, "deliveryFormats");
      const deliveryFormats = deliveryData.length ? deliveryData : deliveryJson;

      const groups: ContentCardGroup[] = [];

      if (shapes.length) {
        groups.push({
          id: `${section.value.id}-shapes`,
          title: "Formas disponibles",
          items: shapes,
          columns: 3,
        });
      }

      if (deliveryFormats.length) {
        groups.push({
          id: `${section.value.id}-delivery-formats`,
          title: "Formatos y presentación",
          items: deliveryFormats,
          columns: 3,
        });
      }

      if (groups.length) return groups;

      const markdownGroups = parseStructuredMarkdownGroups(body.value, {
        baseId: `${section.value.id}-formats`,
        columns: 3,
        fallbackTitlePrefix: "Formato",
      });

      if (markdownGroups.length) return markdownGroups;

      const fallbackItems = parseBodyBulletItems(body.value, {
        fallbackTitlePrefix: "Formato",
      });

      return createGroup(`${section.value.id}-formats`, fallbackItems, 3);
    }

    if (key.value === "finishes") {
      const dataItems = toCardItems(section.value.finishesData?.finishes, "Acabado");
      const jsonItems = toCardItemsFromJsonKey(parsedBodyData.value, "finishes", "Acabado");
      const markdownItems = parseBodyBulletItems(body.value, {
        metaLabel: "Acabado",
        fallbackTitlePrefix: "Acabado",
      });

      const items = dataItems.length
        ? dataItems
        : jsonItems.length
          ? jsonItems
          : markdownItems;

      return createGroup(`${section.value.id}-finishes`, items, 2);
    }

    if (key.value === "applications") {
      const dataItems = toCardItems(section.value.applicationsData?.applications);
      const jsonItems = toCardItemsFromJsonKey(parsedBodyData.value, "applications");
      const markdownItems = parseBodyBulletItems(body.value, {
        fallbackTitlePrefix: "Aplicación",
      });

      const items = dataItems.length
        ? dataItems
        : jsonItems.length
          ? jsonItems
          : markdownItems;

      return createGroup(`${section.value.id}-applications`, items, 2);
    }

    if (key.value === "technical-specs") {
      const tableGroups = parseMarkdownTableGroups(body.value, {
        baseId: `${section.value.id}-technical-specs`,
        columns: 2,
      });

      if (tableGroups.length) return tableGroups;

      const markdownGroups = parseStructuredMarkdownGroups(body.value, {
        baseId: `${section.value.id}-technical-specs`,
        columns: 2,
        allowUntitled: false,
      });

      if (hasGenericOptionTitles(markdownGroups)) return [];

      return markdownGroups;
    }

    return [];
  });

  const formatsData = computed<ResolvedFormatsData | null>(() => {
    if (key.value !== "formats") return null;

    const shapesData = toCardItems(section.value.formatsData?.shapes);
    const shapesJson = toCardItemsFromJsonKey(parsedBodyData.value, "shapes");
    const shapes = shapesData.length ? shapesData : shapesJson;

    const deliveryData = toCardItems(section.value.formatsData?.deliveryFormats);
    const deliveryJson = toCardItemsFromJsonKey(parsedBodyData.value, "deliveryFormats");
    const deliveryFormats = deliveryData.length ? deliveryData : deliveryJson;

    if (!shapes.length && !deliveryFormats.length) return null;

    return {
      intro: intro.value,
      shapes,
      deliveryFormats,
    };
  });

  const finishesItems = computed<SimpleGridItem[]>(() => {
    if (key.value !== "finishes") return [];

    return cardGroups.value.flatMap((group) =>
      group.items.map((item) => toSimpleGridItem(item))
    );
  });

  const shouldUseSimpleGrid = computed(() => simpleGridSectionKeys.has(key.value));

  const simpleGridItems = computed<SimpleGridItem[]>(() => {
    if (key.value === "types") {
      if (typeItems.value.length) return typeItems.value;

      return cardGroups.value.flatMap((group) =>
        group.items.map((item) => toSimpleGridItem(item))
      );
    }

    return cardGroups.value.flatMap((group) =>
      group.items.map((item) => toSimpleGridItem(item))
    );
  });

  const eyebrow = computed(() => {
    if (headerMode.value !== "default") return "";
    return eyebrowForCards(key.value);
  });

  const variant = computed(() => variantForCards(key.value));

  const shouldShowDetailsHeader = computed(() => headerMode.value === "default");

  return {
    key,
    kind,
    title,
    intro,
    cardGroups,
    formatsData,
    finishesItems,
    simpleGridItems,
    shouldUseSimpleGrid,
    eyebrow,
    variant,
    shouldShowDetailsHeader,
  };
}