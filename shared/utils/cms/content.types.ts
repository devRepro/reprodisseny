export type CmsSectionKey =
  | "detalles"
  | "beneficios"
  | "aplicaciones"
  | "caracteristicas-tecnicas"
  | "tipos"
  | "formatos-y-soportes"
  | "acabados"
  | "usos-habituales"
  | "otros";

export type ParsedBodyMdSection = {
  id: string;
  key: CmsSectionKey;
  title: string;
  body: string;
  step: number;
};

export type CmsContentBlock =
  | {
      type: "text";
      text?: string;
      html?: boolean;
    }
  | {
      type: "bullets";
      items?: string[];
    }
  | {
      type: "image";
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
      caption?: string;
    };

export type CmsMappedSection = {
  id: string;
  key: CmsSectionKey;
  title: string;
  body: string;
  blocks: CmsContentBlock[];
  step: number;
};

export type CmsMappedTab = {
  id: string;
  title: string;
  text?: string;
  blocks: CmsContentBlock[];
  step: number;
};

export type CmsFaqItem = {
  q: string;
  a: string;
};