// Local release payload and read-only CMS preflight. There is deliberately no remote write mode.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';

const args = process.argv.slice(2);
assert.ok(args.every(arg => ['--write-local', '--read-cms', '--require-integrated'].includes(arg)), 'Unknown option');
assert.ok(!args.includes('--require-integrated') || args.includes('--read-cms'), '--require-integrated requires --read-cms');

const slug = 'libros-revistas-catalogos';
const catalog = JSON.parse(await readFile('cms/catalog.json', 'utf8'));
const category = catalog.categories.find(item => item.slug === slug);
assert.equal(category?.id, '7');
assert.equal(category.path, `/categorias/${slug}`);
const fields = {
  Title: category.title, Description: category.description,
  MetaTitle: category.seo.metaTitle, MetaDescription: category.seo.metaDescription,
  ImageWidth: category.image.width, ImageHeight: category.image.height,
  CommercialJson: JSON.stringify(category.commercialJson),
};
const file = 'docs/cms/publicaciones-editorial.fields.json';
if (process.argv.includes('--write-local')) {
  await mkdir('docs/cms', {recursive: true});
  await writeFile(file, JSON.stringify(fields, null, 2) + '\n');
} else {
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), fields, 'Regenerate the local CMS payload with --write-local');
}
console.log('CMS payload: 7 fields match the approved snapshot; URLs, products and technical content excluded.');

if (process.argv.includes('--read-cms')) {
  const {default: dotenv} = await import('dotenv');
  const {ClientSecretCredential} = await import('@azure/identity');
  dotenv.config({path: '.env.imports', override: true, quiet: true});
  const env = process.env;
  assert.equal(env.CMS_CATEGORY_COMMERCIAL_JSON_FIELD || 'CommercialJson', 'CommercialJson', 'Use the verified CommercialJson internal field');
  const credential = new ClientSecretCredential(env.TENANT_ID || env.AZURE_TENANT_ID, env.CLIENT_ID || env.AZURE_CLIENT_ID, env.CLIENT_SECRET || env.AZURE_CLIENT_SECRET);
  const token = await credential.getToken('https://graph.microsoft.com/.default');
  const get = async path => {
    const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {headers: {Authorization: `Bearer ${token.token}`}, signal: AbortSignal.timeout(30000)});
    assert.ok(response.ok, `Graph GET failed (${response.status})`);
    return response.json();
  };
  const site = env.SHAREPOINT_SITE_ID || env.CMS_SITE_ID || env.GRAPH_CMS_SITE_ID || (await get(`/sites/${env.CMS_SITE_HOSTNAME || env.SHAREPOINT_HOSTNAME}:${env.CMS_SITE_PATH || env.SHAREPOINT_SITE_PATH}`)).id;
  const list = env.SP_LIST_CATEGORIES_ID || env.CMS_CATEGORIES_LIST_ID || env.NUXT_SHAREPOINT_CMS_CATEGORIES_LIST_ID;
  assert.ok(list);
  // https://learn.microsoft.com/en-us/graph/api/list-list-columns?view=graph-rest-1.0
  const columns = [];
  let page = await get(`/sites/${site}/lists/${list}/columns`);
  while (true) {
    columns.push(...page.value);
    if (!page['@odata.nextLink']) break;
    const next = new URL(page['@odata.nextLink']);
    assert.equal(next.origin, 'https://graph.microsoft.com');
    page = await get(next.pathname.replace('/v1.0', '') + next.search);
  }
  const item = await get(`/sites/${site}/lists/${list}/items/7?expand=fields`);
  assert.equal(item.fields.CategorySlug, slug);
  assert.equal(item.fields.Path, category.path);
  const missingColumns = Object.keys(fields).filter(name => !columns.some(column => column.name === name));
  const commercial = columns.find(column => column.name === 'CommercialJson');
  const sameValue = name => {
    if (name !== 'CommercialJson') return isDeepStrictEqual(item.fields[name] ?? null, fields[name]);
    try { return isDeepStrictEqual(JSON.parse(item.fields[name] || 'null'), JSON.parse(fields[name])); }
    catch { return false; }
  };
  const drift = Object.keys(fields).filter(name => !sameValue(name));
  const report = {checkedAt: new Date().toISOString(), site, list, itemId: '7', etag: item['@odata.etag'] || item.fields['@odata.etag'],
    missingColumns, commercialColumn: commercial ? {name: commercial.name, text: commercial.text, readOnly: commercial.readOnly} : null,
    pendingFields: drift, beforeFields: Object.fromEntries(Object.keys(fields).map(name => [name, item.fields[name] ?? null])),
    backup: item.fields};
  await mkdir('reports/publicaciones-seo', {recursive: true});
  if (drift.length && !args.includes('--require-integrated')) {
    const backupPath = `reports/publicaciones-seo/cms-before-${report.checkedAt.replace(/[:.]/g, '-')}.json`;
    await writeFile(backupPath, JSON.stringify(report, null, 2), {flag: 'wx'});
    report.beforeIntegrationBackup = backupPath;
  }
  await writeFile('reports/publicaciones-seo/cms-preflight.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({missingColumns, commercialColumn: report.commercialColumn, pendingFields: drift}));
  if (process.argv.includes('--require-integrated')) {
    assert.deepEqual(missingColumns, [], 'CMS columns pending');
    assert.ok(commercial?.text?.allowMultipleLines && commercial.text.textType === 'plain' && !commercial.text.appendChangesToExistingText && !commercial.readOnly, 'CommercialJson must be writable multiline plain text without append');
    assert.deepEqual(drift, [], 'CMS values pending integration');
  }
}
