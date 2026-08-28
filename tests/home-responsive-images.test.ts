import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(relativePath: string) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("the Home image strip preserves its responsive carousel and image fallback", () => {
  const source = readSource("components/marketing/HomeImageStrip.vue");

  assert.match(source, /overflow-x-auto/);
  assert.match(source, /snap-x snap-mandatory/);
  assert.match(source, /md:grid/);
  assert.match(source, /<picture\s+v-if="img\.avifSrcset \|\| img\.webpSrcset"/);
  assert.match(source, /<NuxtImg\s+v-else/);
  assert.match(source, /xs:84vw md:46vw xl:22vw xxl:330px/);
  assert.match(source, /index === 0 \? 'eager' : 'lazy'/);
  assert.match(source, /index === 0 \? 'high' : 'auto'/);
});

test("only the first Home strip image is prioritized above the fold", () => {
  const source = readSource("pages/index.vue");
  const banner = source.match(/<SolarProtectionHeroBanner[\s\S]*?\/>/)?.[0] || "";

  assert.ok(banner, "SolarProtectionHeroBanner must remain on Home");
  assert.doesNotMatch(banner, /\seager(?:\s|\/>)/);
  assert.match(source, /preimpresion-640\.avif 640w/);
  assert.match(source, /preimpresion-1066\.webp 1066w/);
});

test("Home category cards request responsive CMS image variants", () => {
  const grid = readSource("components/marketing/ProductCategoryGrid.vue");
  const card = readSource("components/shared/catalog/CatalogCard.vue");

  assert.match(grid, /image-sizes="xs:78vw sm:46vw xl:22vw xxl:260px"/);
  assert.match(card, /<NuxtImg/);
  assert.match(card, /:sizes="props\.imageSizes"/);
  assert.match(card, /loading="lazy"/);
  assert.match(card, /fetchpriority="auto"/);
});
