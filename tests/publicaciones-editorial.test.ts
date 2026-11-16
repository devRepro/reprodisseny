import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import catalog from '../cms/catalog.json';
import routes from '../cms/routes.json';
import { getCategoryDetailByPath, getCategoryProductsBySlug, getProductDetailBySlug } from '../server/services/cms/catalog.service';
import { editorialLandings } from '../shared/data/editorialLandings';
import { EDITORIAL_LANDING_PATHS, EDITORIAL_SEO, PUBLICATIONS_PATH, resolveEditorialQuoteContext } from '../shared/seo/editorialRoutes';
import { redirectRouteRules } from '../redirect-rules.generated';

const expectedSlugs = ['encuadernacion-wire-o-oculto', 'cosida-tapa-blanda', 'encuadernacion-cosida-tapa-dura', 'encuadernacion-encolada-tapa-blanda', 'encuadernacion-wire-o', 'encuadernado-con-grapas', 'hojas-sueltas-archivadores'];

test('Publicaciones conserva sus siete productos originales y sus URL canónicas', () => {
  const category = getCategoryDetailByPath(PUBLICATIONS_PATH);
  assert.ok(category);
  assert.equal(category.seo.canonical, `https://reprodisseny.com${PUBLICATIONS_PATH}`);
  const products = getCategoryProductsBySlug('libros-revistas-catalogos', {page: 1, limit: 12, includeSubcategories: true});
  assert.ok(products);
  assert.equal(products.total, 7);
  assert.deepEqual(products.items.map(item => item.slug), expectedSlugs);
  assert.deepEqual(new Set(category.commercialProducts.map(item => item.slug)), new Set(expectedSlugs));
  for (const product of products.items) {
    assert.ok((routes as string[]).includes(product.path));
    const detail = getProductDetailBySlug(product.path);
    assert.ok(detail);
    assert.equal(detail.seo.canonical, `https://reprodisseny.com${product.path}`);
    assert.ok(detail.formFields.length > 0);
  }
});

test('el recorrido editorial prioriza catálogos y revistas y mantiene contenido técnico', () => {
  const category = getCategoryDetailByPath(PUBLICATIONS_PATH);
  assert.ok(category?.commercialJson);
  const config = category.commercialJson;
  assert.deepEqual(config.solutions?.groups?.map(item => item.id), ['catalogos', 'revistas', 'libros', 'manuales-dossiers']);
  assert.equal(config.solutions?.groups?.[0]?.primaryProductSlug, 'encuadernacion-encolada-tapa-blanda');
  assert.equal(config.solutions?.groups?.[1]?.primaryProductSlug, 'encuadernado-con-grapas');
  assert.equal(config.solutions?.groups?.[0]?.cta?.to, EDITORIAL_LANDING_PATHS.catalogos);
  assert.equal(config.solutions?.groups?.[1]?.cta?.to, EDITORIAL_LANDING_PATHS.revistas);
  assert.equal(config.useCases?.items?.length, 5);
  assert.deepEqual(category.sections.map(item => item.id), ['details', 'types', 'formats', 'finishes']);
  const raw = catalog.categories.find(item => item.slug === 'libros-revistas-catalogos');
  const content = JSON.stringify(raw?.sections);
  for (const term of ['Papeles interiores', 'Cubiertas', 'Soft touch', 'Barniz selectivo', 'Stamping', 'gofrado', 'Solapas']) assert.ok(content.includes(term), term);
  assert.equal(category.faqs.length, 5);
});

test('las landings son páginas comerciales distintas sin registros de productos ficticios', () => {
  assert.notEqual(EDITORIAL_SEO.catalogos.title, EDITORIAL_SEO.revistas.title);
  assert.notEqual(EDITORIAL_SEO.catalogos.description, EDITORIAL_SEO.revistas.description);
  assert.notDeepEqual(editorialLandings.catalogos.faqs, editorialLandings.revistas.faqs);
  for (const [key, path] of Object.entries(EDITORIAL_LANDING_PATHS)) {
    assert.ok(existsSync(`pages${path}.vue`), path);
    assert.equal(catalog.products.some(item => item.path === path), false);
    const content = editorialLandings[key as keyof typeof editorialLandings];
    assert.ok(content.faqs.length >= 5);
    for (const group of content.commercial.solutions.groups) {
      for (const slug of group.productSlugs) assert.ok(getProductDetailBySlug(`/productos/${slug}`), slug);
    }
  }
  assert.match(JSON.stringify(editorialLandings.revistas), /múltiplos de cuatro/);
});

test('presupuesto conserva contexto editorial con una lista cerrada y sin campos obligatorios nuevos', () => {
  assert.equal(resolveEditorialQuoteContext('catalogos')?.productSlug, 'impresion-catalogos-barcelona');
  assert.equal(resolveEditorialQuoteContext('revistas')?.categorySlug, 'libros-revistas-catalogos');
  assert.equal(resolveEditorialQuoteContext('editorial')?.productName, 'Publicaciones editoriales');
  for (const value of [undefined, null, ['revistas'], '__proto__', 'constructor', 'inexistente']) assert.equal(resolveEditorialQuoteContext(value), undefined);
});

test('la antigua URL de revistas redirige directamente a su landing con 301', () => {
  const rules = redirectRouteRules as Record<string, {redirect: {to: string; statusCode: number}}>;
  for (const origin of ['/product/imprimir-revista-presupuesto', '/product/imprimir-revista-presupuesto/printestimate']) {
    assert.deepEqual(rules[origin]?.redirect, {to: EDITORIAL_LANDING_PATHS.revistas, statusCode: 301});
  }
  assert.equal(rules[EDITORIAL_LANDING_PATHS.revistas], undefined);
  const sitemap = readFileSync('server/api/__sitemap__/urls.ts','utf8');
  assert.ok(sitemap.includes('Object.values(EDITORIAL_LANDING_PATHS)'));
});
