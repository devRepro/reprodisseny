export type SchemaImage =
  | string
  | {
      src?: string | null;
      url?: string | null;
    }
  | null
  | undefined;

export type SchemaBreadcrumb = {
  name: string;
  url: string;
};

export type BuildProductPageSchemaInput = {
  siteUrl: string;
  canonicalUrl: string;
  title: string;
  description?: string | null;
  image?: SchemaImage;
  category?: string | null;
  breadcrumbs?: SchemaBreadcrumb[];
  inLanguage?: string;
};

export type ProductPageSchema = {
  "@context": "https://schema.org";
  "@graph": Array<Record<string, unknown>>;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBaseUrl(value: unknown): string {
  return normalizeText(value).replace(/\/+$/, "");
}

function toAbsoluteUrl(
  value: unknown,
  siteUrl: string,
): string {
  const normalizedValue = normalizeText(value);
  const normalizedSiteUrl = normalizeBaseUrl(siteUrl);

  if (!normalizedValue || !normalizedSiteUrl) {
    return "";
  }

  try {
    return new URL(
      normalizedValue,
      `${normalizedSiteUrl}/`,
    ).toString();
  } catch {
    return "";
  }
}

function resolveImageUrl(
  image: SchemaImage,
  siteUrl: string,
): string {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return toAbsoluteUrl(image, siteUrl);
  }

  const source =
    normalizeText(image.src) ||
    normalizeText(image.url);

  return source
    ? toAbsoluteUrl(source, siteUrl)
    : "";
}

function normalizeBreadcrumbs(
  breadcrumbs: SchemaBreadcrumb[] | undefined,
  siteUrl: string,
): Array<{
  name: string;
  url: string;
}> {
  if (!Array.isArray(breadcrumbs)) {
    return [];
  }

  const seenUrls = new Set<string>();

  return breadcrumbs
    .map((item) => ({
      name: normalizeText(item?.name),
      url: toAbsoluteUrl(item?.url, siteUrl),
    }))
    .filter((item) => {
      if (!item.name || !item.url) {
        return false;
      }

      if (seenUrls.has(item.url)) {
        return false;
      }

      seenUrls.add(item.url);

      return true;
    });
}

/**
 * Genera el JSON-LD para una ficha comercial sin precio fijo.
 *
 * No genera Product, Service, Offer, precio, disponibilidad
 * ni valoraciones.
 */
export function buildProductPageSchema(
  input: BuildProductPageSchemaInput,
): ProductPageSchema | null {
  const siteUrl = normalizeBaseUrl(input.siteUrl);
  const canonicalUrl = toAbsoluteUrl(
    input.canonicalUrl,
    siteUrl,
  );
  const title = normalizeText(input.title);

  if (!siteUrl || !canonicalUrl || !title) {
    return null;
  }

  const description = normalizeText(
    input.description,
  );
  const category = normalizeText(input.category);
  const imageUrl = resolveImageUrl(
    input.image,
    siteUrl,
  );
  const inLanguage =
    normalizeText(input.inLanguage) || "es-ES";

  const webpageId = `${canonicalUrl}#webpage`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const primaryImageId = `${canonicalUrl}#primaryimage`;

  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  const breadcrumbs = normalizeBreadcrumbs(
    input.breadcrumbs,
    siteUrl,
  );

  const graph: Array<Record<string, unknown>> = [];

  const webpage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": webpageId,
    url: canonicalUrl,
    name: title,
    inLanguage,

    isPartOf: {
      "@id": websiteId,
    },

    publisher: {
      "@id": organizationId,
    },
  };

  if (description) {
    webpage.description = description;
  }

  if (category) {
    webpage.about = {
      "@type": "Thing",
      name: category,
    };
  }

  if (imageUrl) {
    webpage.primaryImageOfPage = {
      "@id": primaryImageId,
    };
  }

  if (breadcrumbs.length >= 2) {
    webpage.breadcrumb = {
      "@id": breadcrumbId,
    };
  }

  graph.push(webpage);

  if (imageUrl) {
    graph.push({
      "@type": "ImageObject",
      "@id": primaryImageId,
      url: imageUrl,
      contentUrl: imageUrl,
      representativeOfPage: true,
    });
  }

  if (breadcrumbs.length >= 2) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,

      itemListElement: breadcrumbs.map(
        (item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        }),
      ),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}