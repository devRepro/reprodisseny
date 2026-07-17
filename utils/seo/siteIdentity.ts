export const SITE_URL = "https://reprodisseny.com";

export const SITE_SCHEMA_IDS = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  homeWebPage: `${SITE_URL}/#webpage`,
  logo: `${SITE_URL}/#logo`,
} as const;

export const SITE_IDENTITY = {
  name: "Repro Disseny",
  legalName: "REPRO DISSENY, S.L.",
  alternateName: "Reprodisseny",
  telephone: "+34932749890",
  email: "comercial@reprodisseny.com",
  taxID: "B64555105",
  foundingDate: "1983",
  logoUrl: `${SITE_URL}/img/logo/reprodisseny.svg`,
  imageUrl:
    "https://webcms.blob.core.windows.net/media/home/impresion.webp",
  address: {
    streetAddress: "Carrer de Juan de Mena, 19",
    postalCode: "08035",
    addressLocality: "Barcelona",
    addressRegion: "Barcelona",
    addressCountry: "ES",
  },
  sameAs: [
    "https://www.linkedin.com/company/repro-disseny-s.l",
    "https://www.instagram.com/reprodissenybcn/",
  ],
} as const;

export type BuildSiteIdentitySchemaInput = {
  title: string;
  description: string;
  inLanguage?: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Genera la identidad canónica del sitio para la página principal.
 *
 * Mantiene una única entidad empresarial con el ID #organization.
 * LocalBusiness ya es un subtipo de Organization.
 */
export function buildSiteIdentitySchema(
  input: BuildSiteIdentitySchemaInput,
) {
  const title =
    normalizeText(input.title) ||
    "Repro Disseny | Imprenta en Barcelona";

  const description =
    normalizeText(input.description) ||
    "Impresión profesional, gran formato, PLV, packaging y soluciones gráficas para empresas.";

  const inLanguage =
    normalizeText(input.inLanguage) || "es-ES";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": SITE_SCHEMA_IDS.organization,

        name: SITE_IDENTITY.name,
        legalName: SITE_IDENTITY.legalName,
        alternateName: SITE_IDENTITY.alternateName,

        url: `${SITE_URL}/`,
        description,

        logo: {
          "@id": SITE_SCHEMA_IDS.logo,
        },

        image: SITE_IDENTITY.imageUrl,

        telephone: SITE_IDENTITY.telephone,
        email: SITE_IDENTITY.email,
        taxID: SITE_IDENTITY.taxID,
        foundingDate: SITE_IDENTITY.foundingDate,

        address: {
          "@type": "PostalAddress",
          streetAddress:
            SITE_IDENTITY.address.streetAddress,
          postalCode:
            SITE_IDENTITY.address.postalCode,
          addressLocality:
            SITE_IDENTITY.address.addressLocality,
          addressRegion:
            SITE_IDENTITY.address.addressRegion,
          addressCountry:
            SITE_IDENTITY.address.addressCountry,
        },

        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: SITE_IDENTITY.telephone,
          email: SITE_IDENTITY.email,
          availableLanguage: ["es", "ca"],
        },

        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
            ],
            opens: "08:30",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Friday",
            opens: "08:00",
            closes: "14:00",
          },
        ],

        sameAs: [...SITE_IDENTITY.sameAs],
      },

      {
        "@type": "ImageObject",
        "@id": SITE_SCHEMA_IDS.logo,
        url: SITE_IDENTITY.logoUrl,
        contentUrl: SITE_IDENTITY.logoUrl,
        caption: SITE_IDENTITY.name,
      },

      {
        "@type": "WebSite",
        "@id": SITE_SCHEMA_IDS.website,
        url: `${SITE_URL}/`,
        name: SITE_IDENTITY.name,
        inLanguage,
        publisher: {
          "@id": SITE_SCHEMA_IDS.organization,
        },
      },

      {
        "@type": "WebPage",
        "@id": SITE_SCHEMA_IDS.homeWebPage,
        url: `${SITE_URL}/`,
        name: title,
        description,
        inLanguage,

        isPartOf: {
          "@id": SITE_SCHEMA_IDS.website,
        },

        about: {
          "@id": SITE_SCHEMA_IDS.organization,
        },

        publisher: {
          "@id": SITE_SCHEMA_IDS.organization,
        },

        primaryImageOfPage: {
          "@type": "ImageObject",
          url: SITE_IDENTITY.imageUrl,
        },
      },
    ],
  };
}