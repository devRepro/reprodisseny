export type ContentSectionKey =
  | "details"
  | "benefits"
  | "types"
  | "formats"
  | "materials"
  | "finishes"
  | "applications"
  | "technical-specs";

export type ContentSectionPattern =
  | "editorial"
  | "structured-grid"
  | "technical-specs";

export type ContentSectionSource =
  | "DetailsMd"
  | "BenefitsMd"
  | "TypesMd"
  | "FormatsMd"
  | "MaterialsMd"
  | "FinishesMd"
  | "ApplicationsMd"
  | "UsesMd"
  | "TechnicalSpecsMd"
  | "unknown";

export type ContentSectionKind = "details" | "cards" | "default";

export type ContentCardVariant = "default" | "feature";

export type ContentSectionHeaderMode = "default" | "intro-only" | "none";

export type TechnicalHighlightIcon =
  | "circle-gauge"
  | "clipboard-check"
  | "file-check-2"
  | "palette"
  | "printer"
  | "ruler"
  | "scissors"
  | "settings-2";

export type TechnicalHighlight = {
  title: string;
  description: string;
  icon?: TechnicalHighlightIcon;
};

export type DetailsMediaItem = {
  image?: {
    src?: string;
    alt?: string;
    caption?: string;
  } | null;
  pills?: Array<{
    label?: string;
    to?: string;
  }>;
};

export type NormalizedCardItem = {
  id?: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  meta?: string;
  tags?: string[];
  features?: string[];
  idealFor?: string;
  icon?: string;
};

export type SimpleGridItem = {
  title: string;
  description: string;
  features?: string[];
  tags?: string[];
  idealFor?: string;
  meta?: string;
};

export type ContentCardGroup = {
  id: string;
  title?: string;
  intro?: string;
  items: NormalizedCardItem[];
  columns?: 1 | 2 | 3 | 4;
};

export type SectionViewModel = {
  id: ContentSectionKey;
  key: ContentSectionKey;
  kind: ContentSectionKey;
  title: string;
  source: ContentSectionSource;
  sourceKey: string;
  contentFormat: "markdown" | "structured" | "text";
  pattern: ContentSectionPattern;
  intro?: string;
  html?: string;
  groups: ContentCardGroup[];
  technicalHighlights: TechnicalHighlight[];
};

export type SectionEntityType = "product" | "category";

export type ContentSectionDiagnostic = {
  url: string;
  entityType: SectionEntityType;
  sectionId: string;
  sectionKey: string;
  sectionKind: string;
  canonicalId: ContentSectionKey | "";
  source: ContentSectionSource;
  detectedFormat: "empty" | "json" | "markdown" | "text" | "unknown";
  expectedRenderer: ContentSectionPattern | "none";
  actualRenderer: ContentSectionPattern | "none";
  structuredValid: boolean;
  jsonValidity: "valid" | "invalid" | "not-applicable";
  markdownValid: boolean;
  fallbackUsed: boolean;
  plainTextRisk: boolean;
  empty: boolean;
  duplicate: boolean;
  unknownAlias: boolean;
  problem: string;
  action: string;
};

export type SectionInput = {
  id: string;
  key?: string;
  kind?: string;
  title?: string;
  intro?: string;
  body?: string;
  text?: string;
  html?: string;
  contentFormat?: string;

  items?: unknown[];

  cardGroups?: unknown[];

  benefitsData?: {
    intro?: string;
    benefits?: unknown[];
  } | null;

  materialsData?: {
    intro?: string;
    materials?: unknown[];
  } | null;

  formatsData?: {
    intro?: string;
    shapes?: unknown[];
    deliveryFormats?: unknown[];
  } | null;

  finishesData?: {
    intro?: string;
    finishes?: unknown[];
  } | null;

  applicationsData?: {
    intro?: string;
    applications?: unknown[];
  } | null;

  technicalHighlights?: TechnicalHighlight[];
};

export type ResolvedFormatsData = {
  intro?: string;
  shapes: NormalizedCardItem[];
  deliveryFormats: NormalizedCardItem[];
};
