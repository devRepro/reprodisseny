import assert from "node:assert/strict";
import test from "node:test";

import routes from "../cms/routes.json";
import catalog from "../cms/catalog.json";
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

type MutableCategoryCatalog = { categories?: Array<Record<string, unknown>> };
const mutableCatalog = catalog as MutableCategoryCatalog;
const routeSet = new Set(routes as string[]);

function commercialSlugs(category: NonNullable<ReturnType<typeof getCategoryDetailByPath>>): string[] {
  return [
    ...new Set(
      category.commercialJson?.solutions?.groups?.flatMap((group) => group.productSlugs || []) || [],
    ),
  ];
}

function collectCommercialCopy(category: NonNullable<ReturnType<typeof getCategoryDetailByPath>>): string[] {
  const commercial = category.commercialJson;
  assert.ok(commercial);

  return [
    commercial.hero?.kicker,
    commercial.hero?.primaryCta?.label,
    commercial.hero?.secondaryCta?.label,
    ...(commercial.facts || []).flatMap((item) => [item.label, item.value]),
    commercial.intro?.eyebrow,
    commercial.intro?.title,
    commercial.intro?.description,
    ...(category.commercialProducts || []).flatMap((product) => [
      product.title,
      product.description,
      product.image?.alt,
    ]),
    ...(commercial.solutions?.groups || []).flatMap((solution) => [
      solution.eyebrow,
      solution.title,
      solution.description,
    ]),
    commercial.project?.eyebrow,
    commercial.project?.title,
    commercial.project?.description,
    ...(commercial.project?.points || []),
    commercial.useCases?.eyebrow,
    commercial.useCases?.title,
    commercial.useCases?.description,
    ...(commercial.useCases?.items || []).flatMap((item) => [item.title, item.description]),
    commercial.finalCta?.eyebrow,
    commercial.finalCta?.title,
    commercial.finalCta?.description,
    commercial.finalCta?.primaryCta?.label,
  ].filter((value): value is string => Boolean(value));
}

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

test("Category DTO mantiene categorias sin CommercialJson en modo estándar", () => {
  const detail = getCategoryDetailByPath("/categorias/adhesivos-personalizados");
  assert.equal(detail?.commercialJson, undefined);
  assert.deepEqual(detail?.commercialProducts, []);
});

test("eventos obtiene su presentación comercial desde CommercialJson del CMS", () => {
  const category = getCategoryDetailByPath("/categorias/eventos");
  assert.ok(category);
  assert.ok(category.commercialJson);
  assert.equal(category.commercialJson.hero?.primaryCta?.to, "/pedir-presupuesto");
  assert.equal(category.commercialJson.hero?.secondaryCta?.to, "#soluciones-evento");
  assert.deepEqual(
    category.commercialJson.solutions?.groups?.map((group) => group.id),
    [
      "identificacion-acreditacion",
      "visibilidad-stand",
      "senaletica-orientacion",
      "material-impreso",
    ],
  );

  const slugs = commercialSlugs(category);
  assert.equal(slugs.length, 18);
  assert.deepEqual(new Set(category.commercialProducts.map((product) => product.slug)), new Set(slugs));
  assert.ok(slugs.includes("acreditaciones-personalizadas"));
  assert.ok(slugs.includes("lanyards-eventos-barcelona"));

  for (const product of category.commercialProducts) {
    assert.ok(routeSet.has(product.path), `${product.path} must exist`);
    assert.ok(product.path.startsWith("/productos/"), `${product.path} must be a product URL`);
  }
});

test("eventos conserva hero, facts, intro, project, useCases y finalCta del CMS", () => {
  const category = getCategoryDetailByPath("/categorias/eventos");
  assert.ok(category?.commercialJson);
  const commercial = category.commercialJson;

  assert.ok(commercial.hero?.kicker);
  assert.ok((commercial.facts || []).length >= 4);
  assert.ok(commercial.intro?.title);
  assert.ok(commercial.project?.title);
  assert.ok((commercial.project?.points || []).length > 0);
  assert.ok(commercial.useCases?.title);
  assert.ok((commercial.useCases?.items || []).length > 0);
  assert.ok(commercial.finalCta?.title);
  assert.equal(commercial.finalCta?.primaryCta?.to, "/pedir-presupuesto");
});

test("eventos commercial copy keeps Spanish accents and normalized terms", () => {
  const category = getCategoryDetailByPath("/categorias/eventos");
  assert.ok(category);
  const visibleCopy = collectCommercialCopy(category).join("\n");

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

test("default category controls keep children, related products and pagination sources", () => {
  const categoryWithChildren = getCategoryDetailByPath("/categorias/gran-formato");
  assert.ok(categoryWithChildren);
  assert.equal(categoryWithChildren.commercialJson, undefined);
  assert.deepEqual(categoryWithChildren.commercialProducts, []);
  assert.ok(categoryWithChildren.children.length > 0);

  const categoryWithRelated = getCategoryDetailByPath("/categorias/adhesivos-personalizados");
  assert.ok(categoryWithRelated);
  assert.equal(categoryWithRelated.commercialJson, undefined);
  assert.deepEqual(categoryWithRelated.commercialProducts, []);
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