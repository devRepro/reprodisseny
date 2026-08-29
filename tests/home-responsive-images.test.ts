import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { compile, NodeTypes, parse as parseTemplate } from "@vue/compiler-dom";
import { parse as parseSfc } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import * as vueRuntime from "vue";
import {
  createSSRApp,
  defineComponent,
  h,
  type Component,
  type RenderFunction,
} from "vue";

function readSource(relativePath: string) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

function readTemplate(relativePath: string) {
  const { descriptor, errors } = parseSfc(readSource(relativePath), {
    filename: relativePath,
  });

  assert.deepEqual(errors, []);
  assert.ok(descriptor.template, `${relativePath} must contain a template`);

  return descriptor.template.content;
}

function compileRender(relativePath: string) {
  const { code } = compile(readTemplate(relativePath), { mode: "function" });
  return new Function("Vue", code)(vueRuntime) as RenderFunction;
}

// compiler-dom function mode receives the complete Vue runtime as one object.
const ImageStub = defineComponent({
  inheritAttrs: false,
  setup(_, context) {
    return () => h("img", context.attrs);
  },
});

function silenceExpectedTemplateWarnings(app: ReturnType<typeof createSSRApp>) {
  app.config.warnHandler = () => {};
}

test("Home image strip renders responsive images without competing high priority", async () => {
  const render = compileRender("components/marketing/HomeImageStrip.vue");
  const component: Component = {
    props: ["images"],
    render,
  };

  const app = createSSRApp(component, {
    images: [
      {
        src: "/img/home/first.webp",
        alt: "first",
        width: 640,
        height: 480,
        avifSrcset: "/img/home/first-320.avif 320w, /img/home/first-640.avif 640w",
        sizes: "84vw",
      },
      {
        src: "https://media.reprodisseny.com/media/home/second.webp",
        alt: "second",
        width: 1200,
        height: 800,
      },
    ],
  });

  app.component("NuxtImg", ImageStub);
  silenceExpectedTemplateWarnings(app);

  const html = await renderToString(app);

  assert.match(html, /<source[^>]+first-320\.avif 320w/);
  assert.match(html, /<img[^>]+alt="first"[^>]+loading="eager"[^>]+fetchpriority="auto"/);
  assert.match(html, /<img[^>]+alt="second"[^>]+sizes="xs:84vw md:46vw xl:22vw xxl:330px"[^>]+quality="80"[^>]+loading="lazy"[^>]+fetchpriority="auto"/);
  assert.doesNotMatch(html, /fetchpriority="high"/);
});

test("Home marks the current solar banner as the only image-priority owner", () => {
  const ast = parseTemplate(readTemplate("pages/index.vue"));
  const elements: Array<{ tag: string; props: Array<{ type: number; name?: string }> }> = [];

  function visit(node: { type: number; children?: unknown[]; tag?: string; props?: unknown[] }) {
    if (node.type === NodeTypes.ELEMENT) {
      elements.push({
        tag: node.tag || "",
        props: (node.props || []) as Array<{ type: number; name?: string }>,
      });
    }

    for (const child of node.children || []) {
      if (child && typeof child === "object" && "type" in child) {
        visit(child as { type: number; children?: unknown[]; tag?: string; props?: unknown[] });
      }
    }
  }

  visit(ast);

  const banner = elements.find((element) => element.tag === "SolarProtectionHeroBanner");
  assert.ok(banner, "SolarProtectionHeroBanner must remain on Home");
  assert.ok(
    banner.props.some((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === "eager"),
    "the measured Home LCP must be eagerly loaded",
  );
});

test("CatalogCard renders bounded responsive CMS image requests", async () => {
  const render = compileRender("components/shared/catalog/CatalogCard.vue");
  const component: Component = {
    render,
    data() {
      return {
        props: {
          href: "/categorias/gran-formato",
          variant: "category",
          imageAspectClass: "aspect-[4/3]",
          imageSizes: "xs:78vw sm:46vw xl:22vw xxl:260px",
          imageQuality: 80,
        },
        linkAriaLabel: "Ver categoría: Gran formato",
        hasMedia: true,
        media: {
          src: "https://media.reprodisseny.com/media/category/gran-formato.webp",
          alt: "Gran formato",
          width: 2400,
          height: 2400,
        },
        safeFallbackLabel: "Categoría",
        safeBadge: "",
        safeTitle: "Gran formato",
        safeDescription: "Impresión de gran formato",
        safeCtaLabel: "Ver categoría",
      };
    },
  };

  const LinkStub = defineComponent({
    inheritAttrs: false,
    setup(_, context) {
      return () => h("a", context.attrs, context.slots.default?.());
    },
  });

  const app = createSSRApp(component);
  app.component("NuxtImg", ImageStub);
  app.component("NuxtLink", LinkStub);
  app.component("AppButton", LinkStub);
  silenceExpectedTemplateWarnings(app);

  const html = await renderToString(app);

  assert.match(
    html,
    /<img[^>]+src="https:\/\/media\.reprodisseny\.com\/media\/category\/gran-formato\.webp"[^>]+sizes="xs:78vw sm:46vw xl:22vw xxl:260px"[^>]+quality="80"[^>]+loading="lazy"[^>]+fetchpriority="auto"/,
  );
  assert.doesNotMatch(html, /loading="eager"|fetchpriority="high"/);
});

test("the desktop-only anniversary logo is not eagerly fetched on mobile", () => {
  const template = readTemplate("components/marketing/HomeHero.vue");
  const ast = parseTemplate(template);
  let loading: string | undefined;

  function visit(node: { type: number; children?: unknown[]; tag?: string; props?: unknown[] }) {
    if (node.type === NodeTypes.ELEMENT && node.tag === "img") {
      const props = (node.props || []) as Array<{
        type: number;
        name?: string;
        value?: { content?: string };
      }>;
      const src = props.find((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === "src");

      if (src?.value?.content === "/img/logo/reprodisseny_1983.svg") {
        loading = props.find(
          (prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === "loading",
        )?.value?.content;
      }
    }

    for (const child of node.children || []) {
      if (child && typeof child === "object" && "type" in child) {
        visit(child as { type: number; children?: unknown[]; tag?: string; props?: unknown[] });
      }
    }
  }

  visit(ast);
  assert.equal(loading, "lazy");
});
