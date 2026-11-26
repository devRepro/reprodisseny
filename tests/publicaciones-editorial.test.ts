import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import catalog from '../cms/catalog.json';
import routes from '../cms/routes.json';
import { getCategoryDetailByPath, getCategoryProductsBySlug, getProductDetailBySlug, getNavigationCategories } from '../server/services/cms/catalog.service';
import { toNavigationDto } from '../shared/navigation';
import { editorialLandings } from '../shared/data/editorialLandings';
import { EDITORIAL_LANDING_PATHS, EDITORIAL_SEO, EDITORIAL_PRODUCT_LINKS, PUBLICATIONS_PATH, resolveEditorialQuoteContext } from '../shared/seo/editorialRoutes';
import { redirectRouteRules } from '../redirect-rules.generated';
import { buildEditorialQuotePath } from '../utils/tracking/editorialQuote';
import { createAttributionTouchFromUrl, normalizeLeadTracking, updateLeadAttribution } from '../utils/tracking/leadAttribution';

const expectedSlugs = ['encuadernacion-wire-o-oculto', 'cosida-tapa-blanda', 'encuadernacion-cosida-tapa-dura', 'encuadernacion-encolada-tapa-blanda', 'encuadernacion-wire-o', 'encuadernado-con-grapas', 'hojas-sueltas-archivadores'];

test('la navegación editorial añade las dos landings sin convertirlas en productos ni modificar otras categorías', () => {
  const source = getNavigationCategories({includeProducts: true, productLimit: 12});
  const menu = toNavigationDto(source);
  const publications = menu.find(item => item.path === PUBLICATIONS_PATH);
  assert.ok(publications);
  assert.deepEqual(publications.commercialLinks?.map(item => item.path), Object.values(EDITORIAL_LANDING_PATHS));
  assert.equal(publications.products.length, 7);
  assert.equal(publications.products.some(item => Object.values(EDITORIAL_LANDING_PATHS).some(path => path === item.path)), false);
  for (const item of menu.filter(item => item.path !== PUBLICATIONS_PATH)) {
    assert.equal(item.commercialLinks, undefined);
  }
});

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

test('los dos CTA editoriales llevan al presupuesto dedicado sin formulario incrustado', () => {
  const source = readFileSync('components/marketing/landing/EditorialLanding.vue', 'utf8');
  assert.doesNotMatch(source, /QuoteFormSection|<form\b|to: '#presupuesto-editorial'/);
  assert.match(source, /primary-cta="\{label: quoteLabel, to: quoteTo\}"/);
  assert.match(source, /<AppButton :to="quoteTo" size="lg"/);
  assert.match(source, /id="presupuesto-editorial"/);
  assert.doesNotMatch(source, /generate_lead|submitAndTrack|trackConversion/);
  const formPage = readFileSync('pages/pedir-presupuesto.vue', 'utf8');
  assert.match(formPage, /resolveEditorialQuoteContext\(route.query.publicacion\)/);
  assert.match(formPage, /v-bind="quoteContext \|\| \{\}"/);
  for (const publication of ['catalogos', 'revistas'] as const) {
    assert.equal(buildEditorialQuotePath(publication), `/pedir-presupuesto?publicacion=${publication}`);
  }
});

test('el enlace editorial conserva solo parámetros publicitarios permitidos y su atribución al solicitar presupuesto', () => {
  const query = { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'editorial', utm_id: 'campaign-01',
    gad_campaignid: 'ads-01', utm_term: 'imprimir catálogo', utm_content: 'hero',
    gclid: 'test-click', gbraid: 'test-gbraid', wbraid: 'test-wbraid',
    publicacion: 'revistas', email: 'private@example.test', redirect: 'https://example.test' };
  for (const publication of ['catalogos', 'revistas'] as const) {
    const sourceUrl = `https://reprodisseny.com${buildEditorialQuotePath(publication, query)}`;
    const params = new URL(sourceUrl).searchParams;
    assert.equal(params.get('publicacion'), publication);
    for (const key of ['email', 'redirect']) assert.equal(params.has(key), false);
    for (const key of ['utm_campaign', 'gclid', 'gbraid', 'wbraid', 'gad_campaignid']) assert.equal(params.get(key), query[key as keyof typeof query]);
    const landing = createAttributionTouchFromUrl({url: `https://reprodisseny.com${EDITORIAL_LANDING_PATHS[publication]}?${new URLSearchParams(query)}`});
    const attribution = updateLeadAttribution({first: null, last: null}, landing);
    const normalized = normalizeLeadTracking({sourceUrl, tracking: {attribution}});
    assert.equal(normalized.trackingSource, 'google');
    assert.equal(normalized.trackingMedium, 'cpc');
    assert.equal(normalized.trackingCampaign, 'editorial');
    assert.equal(normalized.attribution.first?.landingPath, EDITORIAL_LANDING_PATHS[publication]);
    assert.equal(normalized.attribution.last?.gclid, 'test-click');
    // A fresh page (new tab or reload), with no in-memory attribution, retains the campaign.
    assert.equal(normalizeLeadTracking({sourceUrl}).trackingCampaign, 'editorial');
  }
  assert.equal(new URL(buildEditorialQuotePath('catalogos', {UTM_SOURCE: ['google', 'ignored'], gclid: ' x ', unknown: 'x'}), 'https://reprodisseny.com').searchParams.get('utm_source'), 'google');
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

test('SEO-02 completa formatos y presupuesto sin duplicar secciones ni alterar las rutas técnicas', () => {
  const magazine = editorialLandings.revistas;
  const formats = magazine.sections.find(section => section.id === 'formatos');
  assert.ok(formats);
  assert.match(JSON.stringify(formats), /210 × 297 mm/);
  assert.match(JSON.stringify(formats), /148 × 210 mm/);
  for (const content of Object.values(editorialLandings)) {
    assert.equal(new Set(content.sections.map(section => section.id)).size, content.sections.length);
    assert.match(content.quoteDescription, /cubierta/);
    assert.match(content.quoteDescription, /entrega/);
    assert.doesNotMatch(JSON.stringify(content), /blog\.reprodisseny\.com/);
  }
  for (const [slug, link] of Object.entries(EDITORIAL_PRODUCT_LINKS)) {
    assert.ok(expectedSlugs.includes(slug));
    assert.ok(getProductDetailBySlug(`/productos/${slug}`));
    assert.ok([PUBLICATIONS_PATH, ...Object.values(EDITORIAL_LANDING_PATHS)].includes(link.to));
  }
  assert.equal(EDITORIAL_PRODUCT_LINKS['encuadernado-con-grapas'].to, EDITORIAL_LANDING_PATHS.revistas);
  assert.equal(EDITORIAL_PRODUCT_LINKS['encuadernacion-encolada-tapa-blanda'].to, EDITORIAL_LANDING_PATHS.catalogos);
});
