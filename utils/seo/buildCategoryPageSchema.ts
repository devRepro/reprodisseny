/**
 * Genera los datos estructurados de una página de categoría.
 *
 * Entidades generadas:
 * - CollectionPage
 * - ItemList con las subcategorías/productos visibles
 * - BreadcrumbList
 *
 * No genera Product, Offer, precios, disponibilidad ni valoraciones.
 */

export type CategorySchemaImage =
  | string
  | {
      src?: string | null;
      url?: string | null;
    }
  | null
  | undefined;

export type CategorySchemaBreadcrumb = {
  name: string;
  url: string;
};

export type CategorySchemaItemType =
  | "service"
  | "category";

export type CategorySchemaItem = {
  name: string;
  url: string;
  image?: CategorySchemaImage;
  description?: string | null;
  type?: CategorySchemaItemType;
  category?: string | null;
};

export type BuildCategoryPageSchemaInput = {
  /**
   * URL base del sitio.
   *
   * Ejemplo:
   * https://reprodisseny.com
   */
  siteUrl: string;

  /**
   * URL canónica completa o relativa de la categoría.
   *
   * En páginas paginadas debe incluir ?page=2, ?page=3, etc.
   */
  canonicalUrl: string;

  title: string;
  description?: string | null;
  image?: CategorySchemaImage;

  /**
   * Breadcrumbs visibles en la página.
   */
  breadcrumbs?: CategorySchemaBreadcrumb[];

  /**
   * Subcategorías y productos realmente visibles en la página actual.
   */
  items?: CategorySchemaItem[];

  /**
   * Desplazamiento opcional de las posiciones del ItemList.
   *
   * Ejemplo para página 2 con 12 productos por página:
   * positionOffset: 12
   */
  positionOffset?: number;

  inLanguage?: string;

  /**
   * Permiten referenciar las entidades globales del sitio.
   * Normalmente no es necesario informarlos.
   */
  websiteId?: string;
  organizationId?: string;
};

export type CategoryPageSchema = {
  "@context": "https://schema.org";
  "@graph": Array<Record<string, unknown>>;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSiteUrl(value: unknown): string {
  return normalizeText(value).replace(/\/+$/, "");
}

function toAbsoluteUrl(
  value: unknown,
  siteUrl: string,
): string {
  const normalized = normalizeText(value);

  if (!normalized || !siteUrl) {
    return "";
  }

  try {
    return new URL(normalized, `${siteUrl}/`).toString();
  } catch {
    return "";
  }
}

function resolveImageUrl(
  image: CategorySchemaImage,
  siteUrl: string,
): string {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return toAbsoluteUrl(image, siteUrl);
  }

  return toAbsoluteUrl(
    image.src || image.url || "",
    siteUrl,
  );
}

function normalizePositionOffset(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function normalizeBreadcrumbs(
  breadcrumbs: CategorySchemaBreadcrumb[] | undefined,
  siteUrl: string,
): Array<{ name: string; url: string }> {
  if (!Array.isArray(breadcrumbs)) {
    return [];
  }

  const seenUrls = new Set<string>();

  return breadcrumbs
    .map((breadcrumb) => {
      return {
        name: normalizeText(breadcrumb?.name),
        url: toAbsoluteUrl(breadcrumb?.url, siteUrl),
      };
    })
    .filter((breadcrumb) => {
      if (!breadcrumb.name || !breadcrumb.url) {
        return false;
      }

      if (seenUrls.has(breadcrumb.url)) {
        return false;
      }

      seenUrls.add(breadcrumb.url);

      return true;
    });
}

function normalizeItems(
    items: CategorySchemaItem[] | undefined,
    siteUrl: string,
  ): Array<{
    name: string;
    url: string;
    image?: string;
    description?: string;
    type: CategorySchemaItemType;
    category?: string;
  }> {
  if (!Array.isArray(items)) {
    return [];
  }

  const seenUrls = new Set<string>();

  return items
  .map((item) => {
    const name = normalizeText(item?.name);
    const url = toAbsoluteUrl(item?.url, siteUrl);
    const image = resolveImageUrl(item?.image, siteUrl);
    const description = normalizeText(item?.description);
    const category = normalizeText(item?.category);
  
    const type: CategorySchemaItemType =
      item?.type === "category"
        ? "category"
        : "service";
  
    return {
      name,
      url,
      type,
      ...(image ? { image } : {}),
      ...(description ? { description } : {}),
      ...(category ? { category } : {}),
    };
  })
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
 * Construye el JSON-LD de una categoría.
 *
 * Devuelve null cuando faltan los datos mínimos necesarios.
 */
export function buildCategoryPageSchema(
  input: BuildCategoryPageSchemaInput,
): CategoryPageSchema | null {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  const canonicalUrl = toAbsoluteUrl(
    input.canonicalUrl,
    siteUrl,
  );
  const title = normalizeText(input.title);

  if (!siteUrl || !canonicalUrl || !title) {
    return null;
  }

  const description = normalizeText(input.description);
  const image = resolveImageUrl(input.image, siteUrl);
  const inLanguage =
    normalizeText(input.inLanguage) || "es-ES";

  const websiteId =
    toAbsoluteUrl(input.websiteId, siteUrl) ||
    `${siteUrl}/#website`;

  const organizationId =
    toAbsoluteUrl(input.organizationId, siteUrl) ||
    `${siteUrl}/#organization`;

  const webpageId = `${canonicalUrl}#webpage`;
  const itemListId = `${canonicalUrl}#itemlist`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;

  const breadcrumbs = normalizeBreadcrumbs(
    input.breadcrumbs,
    siteUrl,
  );

  const items = normalizeItems(
    input.items,
    siteUrl,
  );

  const positionOffset = normalizePositionOffset(
    input.positionOffset,
  );

  const graph: Array<Record<string, unknown>> = [];

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": webpageId,
    url: canonicalUrl,
    name: title,
    inLanguage,

    isPartOf: {
      "@id": websiteId,
    },

    about: {
      "@id": organizationId,
    },
  };

  if (description) {
    collectionPage.description = description;
  }

  if (image) {
    collectionPage.primaryImageOfPage = {
      "@type": "ImageObject",
      "@id": `${canonicalUrl}#primaryimage`,
      url: image,
      contentUrl: image,
    };
  }

  if (breadcrumbs.length >= 2) {
    collectionPage.breadcrumb = {
      "@id": breadcrumbId,
    };
  }

  if (items.length > 0) {
    collectionPage.mainEntity = {
      "@id": itemListId,
    };
  }

  graph.push(collectionPage);

  if (items.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": itemListId,
      name: `Elementos de ${title}`,
      numberOfItems: items.length,
      itemListOrder:
        "https://schema.org/ItemListOrderAscending",

        itemListElement: items.map((item, index) => {
            const entityId =
              item.type === "category"
                ? `${item.url}#webpage`
                : `${item.url}#service`;
          
            const entity =
              item.type === "category"
                ? {
                    "@type": "CollectionPage",
                    "@id": entityId,
                    url: item.url,
                    name: item.name,
          
                    ...(item.description
                      ? {
                          description: item.description,
                        }
                      : {}),
          
                    ...(item.image
                      ? {
                          image: item.image,
                        }
                      : {}),
          
                    isPartOf: {
                      "@id": websiteId,
                    },
                  }
                : {
                    "@type": "Service",
                    "@id": entityId,
                    url: item.url,
                    name: item.name,
          
                    ...(item.description
                      ? {
                          description: item.description,
                        }
                      : {}),
          
                    ...(item.image
                      ? {
                          image: item.image,
                        }
                      : {}),
          
                    ...(item.category
                      ? {
                          category: item.category,
                        }
                      : {}),
          
                    provider: {
                      "@id": organizationId,
                    },
          
                    areaServed: {
                      "@type": "Country",
                      name: "España",
                    },
                  };
          
            return {
              "@type": "ListItem",
              position: positionOffset + index + 1,
              item: entity,
            };
          }),
    });
  }

  if (breadcrumbs.length >= 2) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,

      itemListElement: breadcrumbs.map(
        (breadcrumb, index) => {
          return {
            "@type": "ListItem",
            position: index + 1,
            name: breadcrumb.name,
            item: breadcrumb.url,
          };
        },
      ),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}