type CatalogQuery = Record<string, unknown>;

export function parseCatalogPageQuery(value: unknown): number {
  if (Array.isArray(value) && value.length !== 1) {
    return 0;
  }

  const raw = Array.isArray(value)
    ? value[0]
    : value;

  if (raw === undefined || raw === null || raw === "") {
    return 1;
  }

  const normalized = String(raw).trim();

  if (!/^[1-9]\d*$/.test(normalized)) {
    return 0;
  }

  const parsed = Number(normalized);

  return Number.isSafeInteger(parsed) ? parsed : 0;
}

export function hasOnlyCatalogPaginationQuery(query: CatalogQuery): boolean {
  return Object.keys(query).every((key) => key === "page");
}

export function buildCatalogCanonicalUrl(options: {
  siteUrl: string;
  path: string;
  page?: number;
}): string {
  const siteUrl = String(options.siteUrl || "https://reprodisseny.com");
  const url = new URL(options.path || "/", siteUrl);

  url.search = "";
  url.hash = "";

  if ((options.page || 1) > 1) {
    url.searchParams.set("page", String(options.page));
  }

  return url.toString();
}
