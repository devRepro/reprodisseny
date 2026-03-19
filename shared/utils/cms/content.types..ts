export type CmsSectionKind = "generic";

export type ParsedBodyMdSection = {
  id: string;
  title: string;
  body: string;
};

export type CmsContentBlock =
  | { type: "text"; text?: string; html?: boolean }
  | { type: "bullets"; items?: string[] };

export type CmsMappedSection = {
  id: string;
  key: string;
  title: string;
  body?: string;
  blocks: CmsContentBlock[];
};