export type ContentSectionKey =
  | "details"
  | "benefits"
  | "types"
  | "formats"
  | "materials"
  | "finishes"
  | "applications"
  | "technical-specs"
  | string;

export type ContentSectionKind = "details" | "cards" | "default";

export type ContentCardVariant = "default" | "feature";

export type ContentSectionHeaderMode = "default" | "intro-only" | "none";

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
  title: string;
  description: string;
  meta?: string;
  tags?: string[];
  features?: string[];
  idealFor?: string;
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
};

export type ResolvedFormatsData = {
  intro?: string;
  shapes: NormalizedCardItem[];
  deliveryFormats: NormalizedCardItem[];
};