import assert from "node:assert/strict";
import test from "node:test";

import routes from "../cms/routes.json";
import catalog from "../cms/catalog.json";
import {
  getCommercialClusterConfig,
  getCommercialClusterProductSlugs,
} from "../utils/config/commercialClusters";
import {
  getCategoryDetailByPath,
  getCategoryProductsBySlug,
} from "../server/services/cms/catalog.service";
import { buildCategoryPageSchema } from "../utils/seo/buildCategoryPageSchema";

type ItemListSchema = {
  "@type"?: string;
  numberOfItems?: number;
  itemListElement?: Array<{ position?: number }>;
};

const routeSet = new Set(routes as string[]);
type MutableCategoryCatalog = { categories?: Array<Record<string, unknown>> };
const mutableCatalog = catalog as MutableCategoryCatalog;

test("Category DTO conserva CommercialJson y resuelve sus productos canonicos", () => {
  const category = mutableCatalog.categories?.find((item) => item.slug === "eventos");
  assert.ok(category);
  const previous = category.commercialJson;
  const commercialJson = {
    solutions: {
      groups: [{
        id: "identificacion",
        title: "Identificacion",
        primaryProductSlug: "acreditaciones-personalizadas",
        productSlugs: ["acreditaciones-personalizadas"],
      }],
    },
  };

  category.commercialJson = commercialJson;
  try {
    const detail = getCategoryDetailByPath("/categorias/eventos");
    assert.deepEqual(detail?.commercialJson, commercialJson);
    assert.deepEqual(detail?.commercialProducts.map((item) => item.slug), ["acreditaciones-personalizadas"]);
    assert.equal(detail?.commercialProducts[0]?.path, "/productos/acreditaciones-personalizadas");
  } finally {
    if (previous === undefined) delete category.commercialJson;
    else category.commercialJson = previous;
  }
});

test("Category DTO mantiene la compatibilidad sin CommercialJson", () => {
  const detail = getCategoryDetailByPath("/categorias/adhesivos-personalizados");
  assert.equal(detail?.commercialJson, undefined);
  assert.deepEqual(detail?.commercialProducts, []);
});

function collectEventClusterCopy(cluster: NonNullable<ReturnType<typeof getCommercialClusterConfig>>): string[] {
  return [
    ...cluster.facts.flatMap((item) => [item.label, item.value]),
    cluster.intro.eyebrow,
    cluster.intro.title,
    cluster.intro.description,
    ...cluster.products.flatMap((product) => [
      product.title,
      product.description,
      product.image.alt,
    ]),
    ...cluster.solutions.flatMap((solution) => [
      solution.eyebrow,
      solution.title,
      solution.description,
    ]),
    cluster.project.eyebrow,
    cluster.project.title,
    cluster.project.description,
    ...cluster.project.points,
    cluster.useCases.eyebrow,
    cluster.useCases.title,
    cluster.useCases.description,
    ...cluster.useCases.items.flatMap((item) => [item.title, item.description]),
    cluster.finalCta.eyebrow,
    cluster.finalCta.title,
    cluster.finalCta.description,
    cluster.finalCta.primaryCta.label,
  ];
}

test("commercial cluster is strictly opt-in for eventos", () => {
  assert.ok(getCommercialClusterConfig("eventos"));
  assert.ok(getCommercialClusterConfig("/categorias/eventos"));

  for (const slug of [
    "gran-formato",
    "adhesivos-personalizados",
    "libros-revistas-catalogos",
    "hosteleria-restauracion",
    "publicidad-oficina",
  ]) {
    assert.equal(getCommercialClusterConfig(slug), null, `${slug} must keep default layout`);
  }
});

test("eventos cluster links only to existing canonical product URLs", () => {
  const cluster = getCommercialClusterConfig("eventos");
  assert.ok(cluster);

  assert.equal(cluster.anchorId, "soluciones-evento");
  assert.equal(cluster.hero.primaryCta.to, "/pedir-presupuesto");
  assert.equal(cluster.hero.secondaryCta.to, "#soluciones-evento");

  assert.equal(routeSet.has("/eventos-ferias-congresos"), false);
  assert.equal(routeSet.has("/soluciones/eventos"), false);
  assert.equal(routeSet.has("/categorias/eventos"), true);

  const slugs = getCommercialClusterProductSlugs(cluster);
  assert.ok(slugs.includes("acreditaciones-personalizadas"));
  assert.ok(slugs.includes("lanyards-eventos-barcelona"));

  const paths = new Set(cluster.products.map((product) => product.path));
  assert.equal(paths.size, cluster.products.length, "cluster product paths must be unique");

  for (const product of cluster.products) {
    assert.ok(routeSet.has(product.path), `${product.path} must exist`);
    assert.ok(product.path.startsWith("/productos/"), `${product.path} must be a product URL`);
  }
});


test("eventos commercial copy keeps Spanish accents and normalized terms", () => {
  const cluster = getCommercialClusterConfig("eventos");
  assert.ok(cluster);

  const visibleCopy = collectEventClusterCopy(cluster).join("\n");

  for (const typo of [
    /\bidentificacion\b/i,
    /\bacreditacion\b/i,
    /funciónen/i,
    /presentaciónes/i,
    /promociónes/i,
    /recepciónes/i,
    /formaciónes/i,
    /\bsenaletica\b/i,
    /\bfacil\b/i,
    /\brapido\b/i,
    /\bestandar\b/i,
    /\btransito\b/i,
    /\bcombinacion\b/i,
    /Documentacion/,
    /Impresion/,
  ]) {
    assert.equal(typo.test(visibleCopy), false, `${typo} should not appear in visible copy`);
  }
});
test("eventos keeps canonical category data, pagination and ItemList semantics", () => {
  const category = getCategoryDetailByPath("/categorias/eventos");
  assert.ok(category);
  assert.equal(category.path, "/categorias/eventos");
  assert.equal(category.seo.canonical, "https://reprodisseny.com/categorias/eventos");
  assert.notEqual(category.seo.robots, "noindex");
  assert.ok(category.faqs.length > 0);
  assert.ok(category.breadcrumbs.some((item) => item.label === category.nav));

  const listing = getCategoryProductsBySlug("eventos", {
    page: 1,
    limit: 12,
    includeSubcategories: true,
  });
  assert.ok(listing);
  assert.equal(listing.total, 18);
  assert.equal(listing.items.length, 12);
  assert.equal(listing.pages, 2);

  const secondPage = getCategoryProductsBySlug("eventos", {
    page: 2,
    limit: 12,
    includeSubcategories: true,
  });
  assert.ok(secondPage);
  assert.equal(secondPage.items.length, 6);

  const schemaItems = listing.items.map((product) => ({
    name: product.title,
    url: product.path,
    image: product.image?.src,
  }));

  const schema = buildCategoryPageSchema({
    siteUrl: "https://reprodisseny.com",
    canonicalUrl: category.seo.canonical,
    title: category.seo.title || category.title,
    description: category.seo.description,
    image: category.seo.image,
    breadcrumbs: category.breadcrumbs
      .map((item) => ({ name: item.label, url: item.to || category.seo.canonical }))
      .filter((item) => item.name && item.url),
    items: schemaItems,
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

test("default category controls keep children, related products and pagination sources", () => {
  const categoryWithChildren = getCategoryDetailByPath("/categorias/gran-formato");
  assert.ok(categoryWithChildren);
  assert.equal(getCommercialClusterConfig(categoryWithChildren.slug), null);
  assert.ok(categoryWithChildren.children.length > 0);

  const categoryWithRelated = getCategoryDetailByPath("/categorias/adhesivos-personalizados");
  assert.ok(categoryWithRelated);
  assert.equal(getCommercialClusterConfig(categoryWithRelated.slug), null);
  assert.ok(categoryWithRelated.relatedProducts.length > 0);

  const listing = getCategoryProductsBySlug("gran-formato", {
    page: 1,
    limit: 12,
    includeSubcategories: true,
  });
  assert.ok(listing);
  assert.ok(listing.total > listing.items.length);
  assert.ok(listing.pages > 1);
});
