type SchemaImage =
  | string
  | {
      src?: string | null;
      url?: string | null;
    }
  | null
  | undefined;

type SchemaBreadcrumb = {
  name: string;
  url: string;
};

type BuildProductPageSchemaInput = {
  siteUrl: string;
  canonicalUrl: string;
  title: string;
  description?: string | null;
  image?: SchemaImage;
  category?: string | null;
  breadcrumbs: SchemaBreadcrumb[];
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function toAbsoluteUrl(value: string, siteUrl: string): string {
  try {
    return new URL(value, `${normalizeBaseUrl(siteUrl)}/`).toString();
  } catch {
    return "";
  }
}

function resolveImageUrl(
  image: SchemaImage,
  siteUrl: string
): string {
  if (typeof image === "string") {
    return toAbsoluteUrl(image, siteUrl);
  }

  if (image && typeof image === "object") {
    const source = normalizeText(image.src) || normalizeText(image.url);

    if (source) {
      return toAbsoluteUrl(source, siteUrl);
    }
  }

  return "";
}

export function buildProductPageSchema(
  input: BuildProductPageSchemaInput
) {
  const siteUrl = normalizeBaseUrl(input.siteUrl);
  const canonicalUrl = toAbsoluteUrl(input.canonicalUrl, siteUrl);
  const title = normalizeText(input.title);
  const description = normalizeText(input.description);
  const category = normalizeText(input.category);
  const imageUrl = resolveImageUrl(input.image, siteUrl);

  const webpageId = `${canonicalUrl}#webpage`;
  const serviceId = `${canonicalUrl}#service`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  const breadcrumbs = input.breadcrumbs
    .map((item) => ({
      name: normalizeText(item.name),
      url: toAbsoluteUrl(item.url, siteUrl),
    }))
    .filter((item) => item.name && item.url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: canonicalUrl,
        name: title,
        ...(description ? { description } : {}),
        inLanguage: "es-ES",
        isPartOf: {
          "@id": websiteId,
        },
        mainEntity: {
          "@id": serviceId,
        },
        breadcrumb: {
          "@id": breadcrumbId,
        },
      },
      {
        "@type": "Service",
        "@id": serviceId,
        url: canonicalUrl,
        name: title,
        serviceType: "Fabricación e impresión personalizada",
        ...(description ? { description } : {}),
        ...(imageUrl ? { image: imageUrl } : {}),
        ...(category ? { category } : {}),
        provider: {
          "@id": organizationId,
        },
        areaServed: {
          "@type": "Country",
          name: "España",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
    ],
  };
}