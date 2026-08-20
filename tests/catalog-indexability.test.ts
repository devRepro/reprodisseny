import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCatalogCanonicalUrl,
  hasOnlyCatalogPaginationQuery,
  parseCatalogPageQuery,
} from "../utils/seo/catalogUrls";
import {
  getCategoryProductsBySlug,
  getProductDetailBySlug,
} from "../server/services/cms/catalog.service";
import catalog from "../cms/catalog.json";

test("catalog pagination accepts only canonical positive integers", () => {
  assert.equal(parseCatalogPageQuery(undefined), 1);
  assert.equal(parseCatalogPageQuery("1"), 1);
  assert.equal(parseCatalogPageQuery("2"), 2);

  for (const invalid of ["0", "01", "2.5", "abc", ["2", "3"]]) {
    assert.equal(parseCatalogPageQuery(invalid), 0);
  }
});

test("only page is an indexable catalog query parameter", () => {
  assert.equal(hasOnlyCatalogPaginationQuery({}), true);
  assert.equal(hasOnlyCatalogPaginationQuery({ page: "2" }), true);
  assert.equal(hasOnlyCatalogPaginationQuery({ sort: "name-asc" }), false);
  assert.equal(hasOnlyCatalogPaginationQuery({ category: "eventos", page: "2" }), false);
  assert.equal(hasOnlyCatalogPaginationQuery({ q: "flyer" }), false);
});

test("catalog canonicals discard inherited parameters and preserve valid pages", () => {
  assert.equal(
    buildCatalogCanonicalUrl({
      siteUrl: "https://reprodisseny.com",
      path: "/productos?sort=name-asc",
    }),
    "https://reprodisseny.com/productos",
  );

  assert.equal(
    buildCatalogCanonicalUrl({
      siteUrl: "https://reprodisseny.com",
      path: "/categorias/gran-formato?sort=title",
      page: 2,
    }),
    "https://reprodisseny.com/categorias/gran-formato?page=2",
  );
});

test("product details expose a canonical category path and reliable related products", () => {
  const product = getProductDetailBySlug("agendas-personalizadas");

  assert.ok(product?.category?.path.startsWith("/categorias/"));
  assert.ok(product?.relatedProducts.length);
  assert.ok(
    product?.relatedProducts.every(
      (related) => related.path !== product.path && related.path.startsWith("/productos/"),
    ),
  );
});

test("product legacy slugs resolve to the canonical product URL", () => {
  const product = getProductDetailBySlug("idenficador-maleta");

  assert.equal(product?.path, "/productos/identificador-maleta");
  assert.equal(product?.redirectTo, "/productos/identificador-maleta");
});

test("every published product is linked from its primary category and back to it", () => {
  const publishedProducts = catalog.products.filter(
    (product) => product.isPublished !== false && product.hidden !== true,
  );
  const categoryListings = new Map<string, Set<string>>();

  for (const product of publishedProducts) {
    const categorySlug = String(product.categorySlug || "").trim();
    assert.ok(categorySlug, `${product.path}: categoría primaria ausente`);

    if (!categoryListings.has(categorySlug)) {
      const listing = getCategoryProductsBySlug(categorySlug, {
        page: 1,
        limit: 100,
        includeSubcategories: false,
      });

      assert.ok(listing, `${categorySlug}: categoría no publicada`);
      categoryListings.set(
        categorySlug,
        new Set(listing.items.map((item) => item.path)),
      );
    }

    assert.ok(
      categoryListings.get(categorySlug)?.has(product.path),
      `${product.path}: no enlazado desde ${categorySlug}`,
    );

    const detail = getProductDetailBySlug(product.slug);
    assert.ok(detail?.category?.path.startsWith("/categorias/"));
    assert.ok(
      detail?.breadcrumbs.some((item) => item.to === detail.category?.path),
      `${product.path}: breadcrumb de categoría ausente`,
    );
    assert.ok(
      detail?.relatedProducts.length,
      `${product.path}: productos relacionados ausentes`,
    );
    assert.ok(
      detail?.relatedProducts.every((related) => related.path !== product.path),
      `${product.path}: relacionado autorreferente`,
    );
  }
});
