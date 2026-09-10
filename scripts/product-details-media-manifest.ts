import { XMLParser } from "fast-xml-parser";
import { ClientSecretCredential } from "@azure/identity";

export type ProductDetailsMediaManifestEntry = {
  productSlug: string;
  categoryPath: string;
  blobPath: string;
  mediaPath: string;
  filename: string;
  order: number;
};

export type ProductDetailsMediaManifest = {
  version: 1;
  source: {
    storageAccount: string;
    containerName: string;
    prefix: string;
  };
  products: Record<string, ProductDetailsMediaManifestEntry[]>;
};

type AzureBlobListPage = {
  names: string[];
  nextMarker: string;
};

export type AzureBlobListOptions = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  storageAccount: string;
  containerName: string;
  prefix?: string;
  maxResults?: number;
};

export type ProductSlugLike = {
  slug?: unknown;
};

const STORAGE_SCOPE = "https://storage.azure.com/.default";
const AZURE_BLOB_API_VERSION = "2023-11-03";
const DEFAULT_PREFIX = "product/";
const DETAILS_BLOB_RE = /^product\/(.+)\/details\/([^/]+)\/([^/]+)$/;
const DETAILS_FILENAME_RE = /^(\d+)-detail\.(webp|avif|jpe?g|png)$/i;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function blobListUrl({
  storageAccount,
  containerName,
  prefix,
  maxResults,
  marker,
}: {
  storageAccount: string;
  containerName: string;
  prefix: string;
  maxResults: number;
  marker?: string;
}) {
  const url = new URL(`https://${storageAccount}.blob.core.windows.net/${containerName}`);
  url.searchParams.set("restype", "container");
  url.searchParams.set("comp", "list");
  url.searchParams.set("prefix", prefix);
  url.searchParams.set("maxresults", String(maxResults));
  if (marker) url.searchParams.set("marker", marker);
  return url;
}

function parseBlobListXml(xml: string): AzureBlobListPage {
  const parsed = xmlParser.parse(xml) as {
    EnumerationResults?: {
      Blobs?: {
        Blob?: Array<{ Name?: unknown }> | { Name?: unknown };
      };
      NextMarker?: unknown;
    };
  };

  const enumeration = parsed.EnumerationResults || {};
  const blobs = asArray(enumeration.Blobs?.Blob);

  return {
    names: blobs.map((blob) => text(blob?.Name)).filter(Boolean),
    nextMarker: text(enumeration.NextMarker),
  };
}

async function readAzureError(response: Response) {
  const body = await response.text();
  try {
    const parsed = xmlParser.parse(body) as { Error?: { Code?: unknown; Message?: unknown } };
    return {
      code: text(parsed.Error?.Code) || "Unknown",
      message: text(parsed.Error?.Message) || response.statusText,
    };
  } catch {
    return { code: "Unknown", message: response.statusText };
  }
}

export async function listAzureBlobPaths({
  tenantId,
  clientId,
  clientSecret,
  storageAccount,
  containerName,
  prefix = DEFAULT_PREFIX,
  maxResults = 5000,
}: AzureBlobListOptions): Promise<string[]> {
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const accessToken = await credential.getToken(STORAGE_SCOPE);

  if (!accessToken?.token) {
    throw new Error("No se pudo obtener token para Azure Storage.");
  }

  const names: string[] = [];
  let marker = "";

  do {
    const response = await fetch(
      blobListUrl({ storageAccount, containerName, prefix, maxResults, marker }),
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "x-ms-version": AZURE_BLOB_API_VERSION,
        },
      }
    );

    if (!response.ok) {
      const error = await readAzureError(response);
      throw new Error(
        `Azure Blob list failed: HTTP ${response.status} ${response.statusText}; Code=${error.code}; Message=${error.message}`
      );
    }

    const page = parseBlobListXml(await response.text());
    names.push(...page.names);
    marker = page.nextMarker;
  } while (marker);

  return names;
}

function toManifestEntry(blobPath: string): ProductDetailsMediaManifestEntry | null {
  const normalizedBlobPath = text(blobPath).replace(/^\/+/, "");
  const pathMatch = normalizedBlobPath.match(DETAILS_BLOB_RE);
  if (!pathMatch) return null;

  const [, categoryPath, productSlug, filename] = pathMatch;
  const fileMatch = filename.match(DETAILS_FILENAME_RE);
  if (!fileMatch) return null;

  return {
    productSlug,
    categoryPath,
    blobPath: normalizedBlobPath,
    mediaPath: `/media/${normalizedBlobPath}`,
    filename,
    order: Number(fileMatch[1]),
  };
}

function compareEntries(
  a: ProductDetailsMediaManifestEntry,
  b: ProductDetailsMediaManifestEntry
) {
  return (
    a.productSlug.localeCompare(b.productSlug) ||
    a.categoryPath.localeCompare(b.categoryPath) ||
    a.order - b.order ||
    a.filename.localeCompare(b.filename) ||
    a.blobPath.localeCompare(b.blobPath)
  );
}

export function buildProductDetailsMediaManifest({
  blobPaths,
  storageAccount,
  containerName,
  prefix = DEFAULT_PREFIX,
}: {
  blobPaths: string[];
  storageAccount: string;
  containerName: string;
  prefix?: string;
}): ProductDetailsMediaManifest {
  const byBlobPath = new Map<string, ProductDetailsMediaManifestEntry>();

  for (const blobPath of blobPaths) {
    const entry = toManifestEntry(blobPath);
    if (entry) byBlobPath.set(entry.blobPath, entry);
  }

  const entries = [...byBlobPath.values()].sort(compareEntries);
  const products: ProductDetailsMediaManifest["products"] = {};

  for (const entry of entries) {
    (products[entry.productSlug] ||= []).push(entry);
  }

  return {
    version: 1,
    source: {
      storageAccount,
      containerName,
      prefix,
    },
    products: Object.fromEntries(
      Object.entries(products).sort(([a], [b]) => a.localeCompare(b))
    ),
  };
}

export async function buildProductDetailsMediaManifestFromAzure(
  options: AzureBlobListOptions
): Promise<{ manifest: ProductDetailsMediaManifest; totalScanned: number }> {
  const blobPaths = await listAzureBlobPaths(options);

  return {
    manifest: buildProductDetailsMediaManifest({
      blobPaths,
      storageAccount: options.storageAccount,
      containerName: options.containerName,
      prefix: options.prefix || DEFAULT_PREFIX,
    }),
    totalScanned: blobPaths.length,
  };
}

export function findDuplicateProductSlugs(products: ProductSlugLike[]): string[] {
  const counts = new Map<string, number>();

  for (const product of products) {
    const slug = text(product.slug);
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug)
    .sort((a, b) => a.localeCompare(b));
}
