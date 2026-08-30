import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { compile } from "@vue/compiler-dom";
import { parse as parseSfc } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import * as vueRuntime from "vue";
import { createSSRApp, defineComponent, h } from "vue";

import { toNavigationDto } from "../shared/navigation";

function readSource(relativePath: string) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("el DTO de navegación solo conserva los campos consumidos por el header", () => {
  const tree = toNavigationDto([
    {
      title: "Gran formato",
      nav: "Gran formato",
      path: "/categorias/gran-formato",
      children: [],
      products: [
        {
          title: "Panel rígido",
          path: "/productos/panel-rigido",
          image: { src: "/media/panel.webp" },
        },
      ],
    },
  ]);

  assert.deepEqual(tree, [
    {
      label: "Gran formato",
      path: "/categorias/gran-formato",
      children: [],
      products: [
        {
          title: "Panel rígido",
          path: "/productos/panel-rigido",
          imageSrc: "/media/panel.webp",
        },
      ],
    },
  ]);
  assert.deepEqual(Object.keys(tree[0]).sort(), [
    "children",
    "label",
    "path",
    "products",
  ]);
});

test("el flujo SSR no duplica la respuesta de navegación en useState", () => {
  const composable = readSource("composables/useCategoriasNav.ts");
  const endpoint = readSource("server/api/nav/categorias.get.ts");

  assert.doesNotMatch(composable, /useState|stableNav|indexBySlug|menuItems/);
  assert.doesNotMatch(endpoint, /indexBySlug|menuItems/);
  assert.match(endpoint, /tree:\s*toNavigationDto\(/);
});

test("el menú conserva enlaces SSR compactos y desktop", async () => {
  const source = readSource("components/shared/menu/Categorias.vue");
  const { descriptor, errors } = parseSfc(source);
  assert.deepEqual(errors, []);
  assert.ok(descriptor.template);

  const { code } = compile(descriptor.template.content, { mode: "function" });
  const render = new Function("Vue", code)(vueRuntime);
  const category = {
    label: "Gran formato",
    path: "/categorias/gran-formato",
    children: [],
    products: [
      {
        title: "Panel rígido",
        path: "/productos/panel-rigido",
        imageSrc: "/media/panel.webp",
      },
    ],
  };

  const component = {
    render,
    data: () => ({
      categories: [category],
      directCategories: [category],
      overflowCategories: [],
      hasCategories: true,
      pending: false,
      error: null,
      isMoreActive: false,
      desktopLinkClass: "desktop-link",
      moreTriggerClass: "more-trigger",
      productLinkClass: "product-link",
    }),
    methods: {
      labelOf: (item: typeof category) => item.label,
      nodeKeyOf: (item: typeof category) => item.path,
      toCat: (item: typeof category) => item.path,
      toProd: (item: { path: string }) => item.path,
      productLabelOf: (item: { title: string }) => item.title,
      childrenOf: (item: typeof category) => item.children,
      previewProducts: (item: typeof category) => item.products,
      hasChildren: (item: typeof category) => item.children.length > 0,
      hasPreviewProducts: (item: typeof category) => item.products.length > 0,
      hasDropdown: (item: typeof category) => item.products.length > 0,
      isCategoryActive: () => false,
      desktopLinkStateClass: () => "",
      menuContentClass: () => "",
      menuInnerClass: () => "",
      imageSrcOf: (item: { imageSrc?: string }) => item.imageSrc || "",
      setDesktopMeasurement: () => undefined,
    },
  };

  const LinkStub = defineComponent({
    inheritAttrs: false,
    props: { to: { type: String, default: "" } },
    setup(props, { attrs, slots }) {
      return () => h("a", { ...attrs, href: props.to }, slots.default?.());
    },
  });
  const PassthroughStub = defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h("div", attrs, slots.default?.());
    },
  });

  const app = createSSRApp(component);
  app.config.warnHandler = () => undefined;
  app.component("NuxtLink", LinkStub);
  app.component("CmsImage", PassthroughStub);
  app.component("ChevronDownIcon", PassthroughStub);
  for (const name of [
    "Menubar",
    "MenubarMenu",
    "MenubarTrigger",
    "MenubarContent",
    "MenubarItem",
    "MenubarSub",
    "MenubarSubContent",
    "MenubarSubTrigger",
  ]) {
    app.component(name, PassthroughStub);
  }

  const html = await renderToString(app);
  assert.match(html, /href="\/categorias\/gran-formato"/);
  assert.match(html, /href="\/productos\/panel-rigido"/);
  assert.match(html, /xl:hidden/);
  assert.match(html, /xl:block/);
});

test("el megamenú mantiene SSR y difiere hidratación solo fuera de desktop", () => {
  const header = readSource("components/layout/SiteHeader.vue");

  assert.match(header, /defineLazyHydrationComponent\(\s*"mediaQuery"/);
  assert.match(header, /hydrate-on-media-query="\(min-width: 1024px\)"/);
  assert.doesNotMatch(header, /ClientOnly/);
});
