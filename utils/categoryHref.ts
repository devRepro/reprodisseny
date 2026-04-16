type CategoryHrefInput = {
  canonicalPath?: string | null;
  categoryPath?: string | null;
  path?: string | null;
  slugPath?: string | null;
  fullPath?: string | null;
  slug?: string | null;
};

function normalizePath(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function isCategoryLikePath(value?: string | null): value is string {
  const path = normalizePath(value);
  if (!path) return false;
  if (/^https?:\/\//i.test(path)) return true;
  return path.startsWith("/categorias/");
}

export function categoryHref(cat: CategoryHrefInput | null | undefined) {
  const explicitCandidates = [
    cat?.canonicalPath,
    cat?.categoryPath,
    cat?.path,
    cat?.slugPath,
    cat?.fullPath,
  ].filter((value): value is string => isCategoryLikePath(value));

  if (explicitCandidates.length > 0) {
    return normalizePath(explicitCandidates[0]);
  }

  const slug = String(cat?.slug ?? "").trim();
  if (!slug) return "/categorias";

  return `/categorias/${slug}`;
}