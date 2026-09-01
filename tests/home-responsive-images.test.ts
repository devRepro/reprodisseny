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

test("Home category grid uses the refined responsive image sizing", () => {
  const template = readTemplate("components/marketing/ProductCategoryGrid.vue");

  assert.match(
    template,
    /image-sizes="xs:78vw sm:46vw 1279:22vw xl:22vw 2xl:300px"/,
  );
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
test("Home category endpoint items survive hydration fallback and render as cards", async () => {
  const sampleCategories = [
    {
      id: "2",
      title: "Adhesivos personalizados para branding e interiorismo",
      slug: "adhesivos-personalizados",
      href: "/categorias/adhesivos-personalizados",
      image: {
        src: "https://media.reprodisseny.com/media/category/adhesivos.webp",
        alt: "Adhesivos personalizados",
        width: 350,
        height: 321,
      },
    },
    {
      id: "5",
      title: "Impresión gran formato Barcelona | Vinilos, lonas y rígidos",
      slug: "gran-formato",
      href: "/categorias/gran-formato",
      image: {
        src: "https://media.reprodisseny.com/media/category/gran-formato.webp",
        alt: "Gran formato",
        width: 2400,
        height: 1200,
      },
    },
  ];

  const previousUseFetch = (globalThis as Record<string, unknown>).useFetch;
  const previousUseState = (globalThis as Record<string, unknown>).useState;
  const stateRefs = new Map<string, ReturnType<typeof vueRuntime.ref>>();
  let fetchMode: "items" | "null" = "items";

  (globalThis as Record<string, unknown>).useState = (key: string, init: () => unknown) => {
    if (!stateRefs.has(key)) {
      stateRefs.set(key, vueRuntime.ref(init()));
    }

    return stateRefs.get(key);
  };

  (globalThis as Record<string, unknown>).useFetch = async (
    url: string,
    options: { query?: unknown; transform?: (input: unknown) => unknown },
  ) => {
    assert.equal(url, "/api/home/categorias");
    assert.deepEqual(options.query, { limit: 8 });

    const value = fetchMode === "items"
      ? options.transform?.({ items: sampleCategories })
      : null;

    return {
      data: vueRuntime.ref(value),
      pending: vueRuntime.ref(false),
      error: vueRuntime.ref(null),
      status: vueRuntime.ref("success"),
      refresh: async () => undefined,
      execute: async () => undefined,
      clear: () => undefined,
    };
  };

  try {
    const moduleUrl = `${new URL("../composables/useHomeCategoriesGrid.ts", import.meta.url).href}?home-grid-regression=${Date.now()}`;
    const { useHomeCategoriesGrid } = await import(moduleUrl);

    const firstRequest = await useHomeCategoriesGrid(8);
    assert.equal(firstRequest.data.value.items.length, 2);
    assert.equal(firstRequest.categories.value.length, 2);
    assert.equal(
      (stateRefs.get("home-categorias-items-8")?.value as typeof sampleCategories | undefined)?.length,
      2,
    );

    fetchMode = "null";
    const hydratedRequest = await useHomeCategoriesGrid(8);
    assert.equal(hydratedRequest.data.value, null);
    assert.equal(hydratedRequest.categories.value.length, 2);
    assert.equal(
      hydratedRequest.categories.value[0].title,
      "Adhesivos personalizados para branding e interiorismo",
    );
  } finally {
    if (previousUseFetch === undefined) {
      delete (globalThis as Record<string, unknown>).useFetch;
    } else {
      (globalThis as Record<string, unknown>).useFetch = previousUseFetch;
    }

    if (previousUseState === undefined) {
      delete (globalThis as Record<string, unknown>).useState;
    } else {
      (globalThis as Record<string, unknown>).useState = previousUseState;
    }
  }

  const pageSource = readSource("pages/index.vue");
  assert.match(pageSource, /await\s+useHomeCategoriesGrid\(8\)/);
  assert.match(pageSource, /:categories="safeHomeCategories"/);

  const render = compileRender("components/marketing/ProductCategoryGrid.vue");
  const component: Component = defineComponent({
    props: {
      id: { type: String, default: "home-product-category-grid" },
      title: { type: String, default: "Productos y soluciones de impresión" },
      description: { type: String, default: "" },
      categories: { type: Array, default: () => [] },
      totalSlots: { type: Number, default: 8 },
      pending: { type: Boolean, default: false },
      sectionClass: { type: String, default: "" },
      containerClass: { type: String, default: "home-section__inner" },
    },
    setup(componentProps) {
      const props = componentProps as {
        id: string;
        title: string;
        description: string;
        categories: typeof sampleCategories;
        totalSlots: number;
        pending: boolean;
        sectionClass: string;
        containerClass: string;
      };
      const headingId = vueRuntime.computed(() => `${props.id}-title`);
      const safeTitle = vueRuntime.computed(() => String(props.title || "").trim());
      const safeDescription = vueRuntime.computed(() => String(props.description || "").trim());
      const safeTotalSlots = vueRuntime.computed(() => Math.max(0, Math.floor(Number(props.totalSlots) || 8)));
      const sourceCategories = vueRuntime.computed(() => props.categories);
      const visibleItems = vueRuntime.computed(() => sourceCategories.value.slice(0, safeTotalSlots.value));
      const skeletonCount = vueRuntime.computed(() => props.pending ? Math.max(0, safeTotalSlots.value - visibleItems.value.length) : 0);
      const hasHeader = vueRuntime.computed(() => Boolean(safeTitle.value || safeDescription.value));

      return {
        props,
        headingId,
        safeTitle,
        safeDescription,
        safeTotalSlots,
        sourceCategories,
        visibleItems,
        skeletonCount,
        hasHeader,
      };
    },
    render,
  });

  const SectionHeadingStub = defineComponent({
    props: ["id", "as", "title"],
    setup(stubProps) {
      return () => h(stubProps.as || "h2", { id: stubProps.id }, stubProps.title);
    },
  });

  const CatalogCardStub = defineComponent({
    props: ["href", "title"],
    setup(stubProps) {
      return () => h("article", { class: "catalog-card-stub" }, [
        h("a", { href: String(stubProps.href) }, String(stubProps.title)),
      ]);
    },
  });

  const app = createSSRApp(component, {
    categories: sampleCategories,
    totalSlots: 8,
    pending: false,
  });
  app.component("SectionHeading", SectionHeadingStub);
  app.component("CatalogCard", CatalogCardStub);
  silenceExpectedTemplateWarnings(app);

  const html = await renderToString(app);
  assert.equal((html.match(/home-category-grid__item/g) || []).length, 2);
  assert.equal((html.match(/catalog-card-stub/g) || []).length, 2);
  assert.match(html, /Adhesivos personalizados para branding e interiorismo/);
});
