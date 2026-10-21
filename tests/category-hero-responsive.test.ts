import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { compile } from "@vue/compiler-dom";
import { parse as parseSfc } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import * as vueRuntime from "vue";
import {
  createSSRApp,
  defineComponent,
  type Component,
  type RenderFunction,
} from "vue";

const COMPONENT_PATH = "components/marketing/category/CategoryHero.vue";
const DEFAULT_IMAGE_SIZES =
  "xs:100vw sm:100vw md:100vw lg:38vw xl:38vw 2xl:435px";
const COMMERCIAL_IMAGE_SIZES =
  "xs:100vw sm:100vw md:100vw lg:53vw xl:52vw 2xl:622px";

function readSource() {
  return readFileSync(new URL(`../${COMPONENT_PATH}`, import.meta.url), "utf8");
}

function compileRender() {
  const { descriptor, errors } = parseSfc(readSource(), {
    filename: COMPONENT_PATH,
  });

  assert.deepEqual(errors, []);
  assert.ok(descriptor.template, `${COMPONENT_PATH} must contain a template`);

  const { code } = compile(descriptor.template.content, { mode: "function" });
  return new Function("Vue", code)(vueRuntime) as RenderFunction;
}

const NuxtImgStub = defineComponent({
  inheritAttrs: false,
  setup(_, context) {
    return () => {
      const {
        alt,
        decoding,
        densities,
        fetchpriority,
        loading,
        preload,
        quality,
        sizes,
        src,
      } = context.attrs;
      const preloadPriority =
        preload && typeof preload === "object" && "fetchPriority" in preload
          ? String(preload.fetchPriority)
          : "";

      return context.slots.default?.({
        src,
        imgAttrs: {
          alt,
          decoding,
          fetchpriority,
          loading,
          sizes,
          "data-component": "nuxt-img",
          "data-densities": densities,
          "data-preload-priority": preloadPriority,
          "data-quality": quality,
        },
      });
    };
  },
});

function createCategoryHeroTemplate(imageSizes: string): Component {
  return defineComponent({
    render: compileRender(),
    setup() {
      return {
        props: {
          containerClass: "",
          showPrimaryCta: false,
          showSecondaryCta: false,
        },
        cn: (...classes: Array<string | false | null | undefined>) =>
          classes.filter(Boolean).join(" "),
        showPrimaryCta: false,
        showSecondaryCta: false,
        isCommercial: false,
        headerClass: "category-hero category-hero--default",
        gridClass: "category-hero__grid category-hero__grid--default",
        titleClass: "category-hero__title category-hero__title--default",
        descriptionClass: "category-hero__description",
        mediaWrapperClass: "category-hero__media-wrapper",
        mediaFrameClass: "category-hero__media-frame category-hero__media-frame--default",
        imageClass: "category-hero__image category-hero__image--default",
        kicker: "Impresión personalizada",
        title: "Gran formato",
        description: "Impresión de gran formato para empresas.",
        highlights: [],
        primaryCta: null,
        secondaryCta: null,
        imgSrc: "https://media.reprodisseny.com/media/category/gran-formato.webp",
        imgAlt: "Soportes publicitarios impresos en gran formato",
        imgWidth: 2400,
        imgHeight: 1200,
        categoryHeroImageSizes: imageSizes,
        CATEGORY_HERO_IMAGE_QUALITY: 85,
        categoryHeroImagePreload: { fetchPriority: "high" },
      };
    },
  });
}

test("CategoryHero renders its CMS hero as a responsive high-priority Nuxt image in SSR", async () => {
  const app = createSSRApp(createCategoryHeroTemplate(DEFAULT_IMAGE_SIZES));
  app.component("NuxtImg", NuxtImgStub);
  app.config.warnHandler = () => {};

  const html = await renderToString(app);

  assert.match(html, /data-component="nuxt-img"/);
  assert.match(
    html,
    /src="https:\/\/media\.reprodisseny\.com\/media\/category\/gran-formato\.webp"/,
  );
  assert.match(html, /alt="Soportes publicitarios impresos en gran formato"/);
  assert.match(html, /width="2400"/);
  assert.match(html, /height="1200"/);
  assert.match(html, new RegExp(`sizes="${DEFAULT_IMAGE_SIZES}"`));
  assert.match(html, /data-quality="85"/);
  assert.match(html, /data-densities="1x 2x"/);
  assert.match(html, /loading="eager"/);
  assert.match(html, /decoding="async"/);
  assert.match(html, /fetchpriority="high"/);
  assert.match(html, /data-preload-priority="high"/);
});

test("CategoryHero keeps separate responsive size hints for both existing layouts", () => {
  const source = readSource();
  const nuxtImgOpeningTag = source.match(/<NuxtImg[\s\S]*?>/)?.[0] || "";

  assert.match(source, /<NuxtImg/);
  assert.match(source, /v-slot="\{ src, imgAttrs \}"/);
  assert.match(source, /\bcustom\b/);
  assert.match(source, /<img\s+v-bind="imgAttrs"/);
  assert.doesNotMatch(nuxtImgOpeningTag, /:width="imgWidth"/);
  assert.doesNotMatch(nuxtImgOpeningTag, /:height="imgHeight"/);
  assert.match(source, new RegExp(DEFAULT_IMAGE_SIZES));
  assert.match(source, new RegExp(COMMERCIAL_IMAGE_SIZES));
  assert.match(
    source,
    /isCommercial\.value\s*\?\s*COMMERCIAL_CATEGORY_HERO_IMAGE_SIZES\s*:\s*DEFAULT_CATEGORY_HERO_IMAGE_SIZES/,
  );
});
