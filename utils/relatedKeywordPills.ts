export type KeywordPillItem = {
  label: string;
  to: string;
  ariaLabel?: string;
};

type ProductLike = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
};

type KeywordPillReference = {
  label?: string;
  productSlug: string;
};

function normalizeKey(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const CATEGORY_KEYWORD_PILL_REFS: Record<string, KeywordPillReference[]> = {
  "adhesivos-personalizados": [
    {
      label: "Etiquetas en bobina",
      productSlug: "etiquetas-adhesivas-en-bobina",
    },
    {
      label: "Hojas con pegatinas",
      productSlug: "hojas-pegatinas-personalizadas",
    },
    {
      label: "Pegatinas personalizadas",
      productSlug: "pegatinas-personalizadas",
    },
  ],
};

const PRODUCT_KEYWORD_PILL_REFS: Record<string, KeywordPillReference[]> = {};

function resolveKeywordPills(
  refs: KeywordPillReference[] = [],
  products: ProductLike[] = []
): KeywordPillItem[] {
  if (!refs.length || !products.length) return [];

  const productIndex = new Map<
    string,
    { slug: string; path: string; title: string }
  >(
    products
      .filter((product) => product?.slug && product?.path)
      .map((product) => [
        normalizeKey(product.slug),
        {
          slug: String(product.slug),
          path: String(product.path),
          title: String(product.title || ""),
        },
      ])
  );

  const seen = new Set<string>();

  return refs
    .reduce<KeywordPillItem[]>((acc, ref) => {
      const product = productIndex.get(normalizeKey(ref.productSlug));
      if (!product?.path) return acc;

      const to = product.path.trim();
      if (!to || seen.has(to)) return acc;

      const label = String(ref.label || product.title || "").trim();
      if (!label) return acc;

      seen.add(to);

      acc.push({
        label,
        to,
        ariaLabel: label,
      });

      return acc;
    }, [])
    .slice(0, 3);
}

export function getCategoryKeywordPills(
  categorySlug?: string | null,
  products: ProductLike[] = []
): KeywordPillItem[] {
  const refs = CATEGORY_KEYWORD_PILL_REFS[normalizeKey(categorySlug)] || [];
  return resolveKeywordPills(refs, products);
}

export function getProductKeywordPills(
  productSlug?: string | null,
  products: ProductLike[] = []
): KeywordPillItem[] {
  const refs = PRODUCT_KEYWORD_PILL_REFS[normalizeKey(productSlug)] || [];
  return resolveKeywordPills(refs, products);
}