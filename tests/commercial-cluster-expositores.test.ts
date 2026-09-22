import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import routes from "../cms/routes.json";
import {
  getCategoryDetailByPath,
  getCategoryProductsBySlug,
  getProductDetailBySlug,
} from "../server/services/cms/catalog.service";
import { buildCategoryPageSchema } from "../utils/seo/buildCategoryPageSchema";
import { buildCatalogCanonicalUrl } from "../utils/seo/catalogUrls";

type ItemListSchema = {
  "@type"?: string;
  numberOfItems?: number;
  itemListElement?: Array<{ position?: number }>;
};

const routeSet = new Set(routes as string[]);
const categoryPageSource = readFileSync(
  new URL("../pages/categorias/[...slug].vue", import.meta.url),
  "utf8",
);

function getExpositoresCategory() {
  const category = getCategoryDetailByPath("/categorias/expositores");
  assert.ok(category);
  assert.ok(category.commercialJson);
  return category;
}

function commercialSlugs(category: ReturnType<typeof getExpositoresCategory>): string[] {
  return [
    ...new Set(
      category.commercialJson?.solutions?.groups?.flatMap((group) => group.productSlugs || []) || [],
    ),
  ];
}

test("expositores obtiene su presentación comercial desde CommercialJson sin alterar eventos", () => {
  const category = getExpositoresCategory();
  const eventos = getCategoryDetailByPath("/categorias/eventos");

  assert.ok(eventos?.commercialJson);
  assert.equal(category.slug, "expositores");
  assert.equal(category.commercialJson?.anchorId, "soluciones-expositores");
  assert.equal(category.commercialJson?.hero?.primaryCta?.to, "/pedir-presupuesto");
  assert.equal(category.commercialJson?.hero?.secondaryCta?.to, "#soluciones-expositores");
  assert.equal(category.commercialJson?.finalCta?.primaryCta?.to, "/pedir-presupuesto");
  assert.deepEqual(
    category.commercialJson?.solutions?.groups?.map((group) => group.id),
    [
      "ferias-congresos-stands",
      "retail-punto-venta",
      "exterior-accesos-promociones",
      "proyectos-especiales-medida",
    ],
  );
});

test("expositores resuelve productos comerciales desde el catálogo CMS", () => {
  const category = getExpositoresCategory();

  assert.equal(routeSet.has("/categorias/expositores"), true);
  assert.equal(routeSet.has("/expositores-personalizados"), false);
  assert.equal(routeSet.has("/soluciones/expositores"), false);

  const expectedSlugs = [
    "roll-up-personalizado",
    "photocall-personalizado",
    "xbanner-personalizado",
    "marcos-photocall-personalizados",
    "cajas-de-luz-personalizadas",
    "expositores-de-mesa-personalizados",
    "expositores-suelo-personalizados",
    "totems-publicitarios-personalizados",
    "cubrealarmas-tiendas-retail",
    "marcos-click-system-personalizados",
    "banderolas-personalizadas",
    "banner-golf-personalizado",
    "caballetes-publicitarios-personalizados",
    "cubos-publicitarios-personalizados",
    "contenedores-de-reciclaje",
    "arbol-navidad-corporativo",
  ];

  const slugs = commercialSlugs(category);
  assert.deepEqual(slugs, expectedSlugs);
  assert.deepEqual(category.commercialProducts.map((product) => product.slug), expectedSlugs);

  const paths = new Set(category.commercialProducts.map((product) => product.path));
  assert.equal(paths.size, category.commercialProducts.length, "commercial product paths must be unique");

  for (const product of category.commercialProducts) {
    assert.ok(routeSet.has(product.path), `${product.path} must exist`);
    assert.ok(product.path.startsWith("/productos/"), `${product.path} must be a product URL`);

    const detail = getProductDetailBySlug(product.path);
    assert.ok(detail, `${product.path} must resolve as a product detail`);
    assert.equal(detail.path, product.path);
    assert.equal(detail.seo.canonical, `https://reprodisseny.com${product.path}`);
    assert.notEqual(detail.seo.robots, "noindex");
    assert.ok(detail.breadcrumbs.some((item) => item.to?.startsWith("/categorias/")));
  }
});

test("expositores keeps displays de mesa in the catalog but not as a highlighted duplicate", () => {
  const category = getExpositoresCategory();
  const slugs = commercialSlugs(category);

  assert.equal(slugs.includes("displays-de-mesa-personalizados"), false);
  assert.ok(slugs.includes("expositores-de-mesa-personalizados"));

  const listing = getCategoryProductsBySlug("expositores", {
    page: 1,
    limit: 30,
    includeSubcategories: true,
  });
  assert.ok(listing);

  const catalogSlugs = listing.items.map((item) => item.slug);
  assert.ok(catalogSlugs.includes("displays-de-mesa-personalizados"));
  assert.ok(catalogSlugs.includes("expositores-de-mesa-personalizados"));
});

test("expositores conserva hero, facts, intro, project, useCases y finalCta del CMS", () => {
  const category = getExpositoresCategory();
  const commercial = category.commercialJson;

  assert.ok(commercial?.hero?.kicker);
  assert.ok((commercial?.facts || []).length >= 4);
  assert.ok(commercial?.intro?.title);
  assert.ok(commercial?.project?.title);
  assert.ok((commercial?.project?.points || []).length > 0);
  assert.ok(commercial?.useCases?.title);
  assert.ok((commercial?.useCases?.items || []).length > 0);
  assert.ok(commercial?.finalCta?.title);
  assert.equal(commercial?.finalCta?.primaryCta?.to, "/pedir-presupuesto");
});

test("expositores keeps category SEO, indexability and catalog pagination", () => {
  const category = getExpositoresCategory();
  assert.equal(category.path, "/categorias/expositores");
  assert.equal(
    category.title,
    "Expositores publicitarios y PLV para tiendas, ferias y eventos",
  );
  assert.equal(
    category.seo.title,
    "Expositores personalizados | Roll-ups, photocalls y displays",
  );
  assert.equal(
    category.seo.description,
    "Expositores para ferias y punto de venta en Barcelona: roll-ups, banners, tótems, photocalls y cajas de luz. También displays, cubrealarmas y marcos a medida.",
  );
  assert.equal(category.seo.canonical, "https://reprodisseny.com/categorias/expositores");
  assert.notEqual(category.seo.robots, "noindex");
  assert.ok(category.faqs.length > 0);
  assert.ok(category.breadcrumbs.some((item) => item.label === "Expositores"));

  const listing = getCategoryProductsBySlug("expositores", {
    page: 1,
    limit: 12,
    includeSubcategories: true,
  });
  assert.ok(listing);
  assert.equal(listing.total, 17);
  assert.equal(listing.items.length, 12);
  assert.equal(listing.pages, 2);

  const secondPage = getCategoryProductsBySlug("expositores", {
    page: 2,
    limit: 12,
    includeSubcategories: true,
  });
  assert.ok(secondPage);
  assert.equal(secondPage.items.length, 5);

  assert.equal(
    buildCatalogCanonicalUrl({
      siteUrl: "https://reprodisseny.com",
      path: category.seo.canonical,
      page: 2,
    }),
    "https://reprodisseny.com/categorias/expositores?page=2",
  );
});

test("expositores category schema keeps ItemList semantics", () => {
  const category = getExpositoresCategory();

  const listing = getCategoryProductsBySlug("expositores", {
    page: 1,
    limit: 12,
    includeSubcategories: true,
  });
  assert.ok(listing);

  const schema = buildCategoryPageSchema({
    siteUrl: "https://reprodisseny.com",
    canonicalUrl: category.seo.canonical,
    title: category.seo.title || category.title,
    description: category.seo.description,
    image: category.seo.image,
    breadcrumbs: category.breadcrumbs
      .map((item) => ({ name: item.label, url: item.to || category.seo.canonical }))
      .filter((item) => item.name && item.url),
    items: listing.items.map((product) => ({
      name: product.title,
      url: product.path,
      image: product.image?.src,
    })),
    positionOffset: 0,
    inLanguage: "es-ES",
  });

  assert.ok(schema);
  const itemList = schema["@graph"].find(
    (item): item is ItemListSchema => item["@type"] === "ItemList",
  );
  assert.ok(itemList);
  assert.equal(itemList.numberOfItems, listing.items.length);
  assert.deepEqual(
    itemList.itemListElement?.map((item) => item.position),
    listing.items.map((_, index) => index + 1),
  );
});

test("commercial presentation is rendered only from CMS CommercialJson on the canonical first page", () => {
  assert.equal((categoryPageSource.match(/<CategoryHero/g) || []).length, 1);
  assert.doesNotMatch(
    categoryPageSource,
    /commercialClusters|getCommercialClusterConfig|legacyCommercialCluster|toCommercialPresentationConfig/,
  );
  assert.match(
    categoryPageSource,
    /const commercialCluster = computed\(\(\) => \{\s*if \(currentPage\.value !== 1\) return null;\s*return category\.value\?\.commercialJson \?\? null;/,
  );
  assert.match(
    categoryPageSource,
    /<CommercialSolutions\s+v-if="hasCommercialCluster"/,
  );
});