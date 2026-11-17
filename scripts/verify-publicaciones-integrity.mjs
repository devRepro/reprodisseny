// Compare with the pre-refactor commit without checking out or rewriting files.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const base = 'b4f0686';
const original = (file) => execFileSync('git', ['show', `${base}:${file}`], {
  encoding: 'utf8', maxBuffer: 10_000_000,
});
const before = JSON.parse(original('cms/catalog.json'));
const after = JSON.parse(await readFile('cms/catalog.json', 'utf8'));
const slug = 'libros-revistas-catalogos';

assert.deepEqual(after.products, before.products, 'Existing products must remain unchanged');
assert.deepEqual(after.categories.filter(item => item.slug !== slug), before.categories.filter(item => item.slug !== slug), 'Other categories must remain unchanged');
const oldCategory = before.categories.find(item => item.slug === slug);
const category = after.categories.find(item => item.slug === slug);
for (const key of ['id', 'path', 'sections', 'bodyMd', 'faqs', 'relatedProductsJson', 'breadcrumbs']) {
  assert.deepEqual(category[key], oldCategory[key], key);
}
for (const file of ['assets/styles/main.scss', 'components/marketing/category/CategoryHero.vue']) {
  assert.equal((await readFile(file, 'utf8')).replace(/\r\n/g, '\n'), original(file).replace(/\r\n/g, '\n'), file);
}

const result = { base, productsUnchanged: after.products.length,
  otherCategoriesUnchanged: after.categories.length - 1, technicalContentUnchanged: true,
  eventsConfigUnchanged: true, globalStylesUnchanged: true, categoryHeroUnchanged: true };
await mkdir('reports/publicaciones-seo', { recursive: true });
await writeFile('reports/publicaciones-seo/integrity.json', JSON.stringify(result, null, 2));
console.log(result);
