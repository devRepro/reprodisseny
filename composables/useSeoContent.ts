// composables/useSeoContent.ts
import { useHead, useRoute, useRuntimeConfig, useSeoMeta } from "#imports";

type JsonLdObject = Record<string, unknown>;

interface ContentData {
  metaTitle?: string | null;
  metaDescription?: string | null;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: string | null;
  slug?: string | null;
  path?: string | null;
  schema?: JsonLdObject | null;
  schemaType?: string | null;
  robots?: string | null;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePath(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function absoluteUrl(siteUrl: string, pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${trimTrailingSlash(siteUrl)}${normalizePath(pathOrUrl)}`;
}

function resolveImageUrl(
  siteUrl: string,
  image?: string | null,
  type?: string | null,
) {
  if (!image) return undefined;

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("/")) {
    return absoluteUrl(siteUrl, image);
  }

  return absoluteUrl(siteUrl, `/img/${type || "otros"}/${image}`);
}

export function useSeoContent(content: ContentData) {
  const route = useRoute();
  const config = useRuntimeConfig();

  const siteUrl = String(config.public.siteUrl || "https://reprodisseny.com");

  const title = content.metaTitle || content.title;
  const description = content.metaDescription || content.description || "";

  // Importante: route.path, no route.fullPath, para evitar query params en canonical.
  const canonicalUrl = absoluteUrl(siteUrl, content.path || route.path);
  const imageUrl = resolveImageUrl(siteUrl, content.image, content.type);

  useSeoMeta({
    title,
    description,

    ogType: "website",
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,

    twitterCard: imageUrl ? "summary_large_image" : "summary",
    twitterTitle: title,
    twitterDescription: description,

    ...(imageUrl
      ? {
          ogImage: imageUrl,
          twitterImage: imageUrl,
        }
      : {}),

    ...(content.robots
      ? {
          robots: content.robots,
        }
      : {}),
  });

  useHead({
    link: canonicalUrl
      ? [
          {
            rel: "canonical",
            href: canonicalUrl,
          },
        ]
      : [],

    script: content.schema
      ? [
          {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
              "@context": "https://schema.org",
              "@type":
                content.schemaType ||
                String(content.schema["@type"] || "WebPage"),
              ...content.schema,
            }),
          },
        ]
      : [],
  });
}