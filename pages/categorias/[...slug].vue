<script setup lang="ts">
import { computed, watch } from "vue";
import { createError } from "h3";

import CategoryHero from "@/components/marketing/category/CategoryHero.vue";
import CategoryActionsGrid from "@/components/marketing/category/CategoryActionsGrid.vue";
import CategoryIntro from "@/components/marketing/category/CategoryIntro.vue";
import CategoryTabs from "@/components/marketing/category/CategoryTabs.vue";
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue";
import CategoryGuideCTA from "@/components/marketing/category/CategoryGuideCTA.vue";
import CategoryRelatedWorks from "@/components/marketing/category/CategoryRelatedWorks.vue";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";

import { parseTabsJson, normalizeTabs } from "~/utils/tabsJson";

type ApiCategoryResponse =
  | { category?: any; redirectTo?: string; children?: any[] }
  | { data?: any; redirectTo?: string; children?: any[] }
  | any;

const route = useRoute();
const cfg = useRuntimeConfig();

/** slugParts SIEMPRE array (1..N) */
const slugParts = computed<string[]>(() => {
  const s = route.params.slug;
  const arr = Array.isArray(s) ? s : s ? [s] : [];
  return arr.map((v) => String(v).trim()).filter(Boolean);
});

if (import.meta.server && !slugParts.value.length) {
  await navigateTo("/categorias", { redirectCode: 302 });
}

const categoryPath = computed(() => `/categorias/${slugParts.value.join("/")}`);
const slugForApi = computed(() => slugParts.value.map(encodeURIComponent).join("/"));

/** URL helpers */
const siteUrl = computed(() => {
  const raw = (cfg.public as any)?.siteUrl || "https://reprodisseny.com";
  return String(raw).trim().replace(/\/+$/, "");
});

function normalizeRelPath(p: string) {
  let out = String(p || "").trim();
  if (!out) return "/";
  if (/^https?:\/\//i.test(out)) return out;
  if (!out.startsWith("/")) out = `/${out}`;
  out = out.replace(/\/{2,}/g, "/");
  out = out.replace(/\/+$/, "") || "/";
  return out;
}

function absUrl(p?: string) {
  const rel = normalizeRelPath(p || categoryPath.value);
  if (/^https?:\/\//i.test(rel)) return rel;
  return `${siteUrl.value}${rel}`.replace(/\/{2,}/g, "/").replace(":/", "://");
}

/** Fetch (SSR + refresca al cambiar ruta) */
const { data: apiRes, pending, error } = await useAsyncData<ApiCategoryResponse>(
  () =>
    $fetch(`/api/cms/category/${slugForApi.value}`, {
      query: {
        includeProducts: 1,
        productLimit: 24,
        includeChildren: 1,
        childLimit: 50,
      },
    }),
  { server: true, watch: [slugForApi] }
);

/** redirect canónico */
const redirectTo = computed(() => {
  const v: any = apiRes.value;
  return v?.redirectTo || v?.data?.redirectTo || "";
});

// SSR redirect (sin loops)
if (import.meta.server && redirectTo.value) {
  const current = normalizeRelPath(route.fullPath);
  const target = normalizeRelPath(redirectTo.value);
  if (current !== target) await navigateTo(target, { redirectCode: 301 });
}

// Client redirect (sin loops)
watch(
  () => redirectTo.value,
  async (to) => {
    if (!to) return;
    const current = normalizeRelPath(route.fullPath);
    const target = normalizeRelPath(to);
    if (current === target) return;
    await navigateTo(target, { replace: true });
  }
);

/** category extraction tolerante */
function extractCategory(v: any) {
  if (!v) return null;
  if (v.category) return v.category;
  if (v.data?.category) return v.data.category;
  if (v.slug || v.id || v.path) return v;
  if (v.data && (v.data.slug || v.data.id || v.data.path)) return v.data;
  return null;
}

const rawCategory = computed(() => extractCategory(apiRes.value));
const notFound = computed(() => !pending.value && !error.value && !rawCategory.value);

if (import.meta.server && notFound.value) {
  throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" });
}

/** Tabs */
const categoryTabs = computed(() => {
  const c: any = rawCategory.value;
  if (!c) return [];
  if (Array.isArray(c.tabs) && c.tabs.length) return c.tabs;
  return normalizeTabs(parseTabsJson(c?.TabsJson ?? c?.tabsJson ?? ""));
});

/** Breadcrumbs */
const humanize = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function buildBreadcrumbs(c: any) {
  if (Array.isArray(c?.breadcrumbs) && c.breadcrumbs.length) return c.breadcrumbs;

  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/categorias" },
  ];

  let acc = "";
  slugParts.value.forEach((seg, idx) => {
    acc += `/${seg}`;
    const isLast = idx === slugParts.value.length - 1;
    const label = isLast ? c?.nav || c?.title || humanize(seg) : humanize(seg);
    crumbs.push({ name: label, url: `/categorias${acc}` });
  });

  return crumbs;
}

/** Image + SEO */
function parseImage(c: any) {
  const raw = c?.image;
  const fromImageSrc = c?.imageSrc ? String(c.imageSrc).trim() : "";

  if (raw && typeof raw === "object") {
    const src =
      (raw?.src ? String(raw.src).split(",")[0].trim() : "") || fromImageSrc || null;
    return {
      src,
      width: Number(raw?.width) || undefined,
      height: Number(raw?.height) || undefined,
      alt: (c?.alt || c?.title || c?.nav || "Categoría").trim(),
    };
  }

  if (typeof raw === "string") {
    const parts = raw.split(",");
    const src = (parts.shift() || "").trim() || fromImageSrc || null;
    const legacyAlt = parts.join(",").trim();
    return {
      src,
      width: undefined,
      height: undefined,
      alt: (c?.alt || legacyAlt || c?.title || c?.nav || "Categoría").trim(),
    };
  }

  return {
    src: fromImageSrc || null,
    width: undefined,
    height: undefined,
    alt: (c?.alt || c?.title || c?.nav || "Categoría").trim(),
  };
}

function buildSeo(c: any) {
  const seo = c?.seo || {};
  return {
    metaTitle: seo.metaTitle || c?.metaTitle || c?.title,
    metaDescription: seo.metaDescription || c?.metaDescription || c?.description,
    canonical: seo.canonical || c?.canonical || "",
    hreflang: seo.hreflang || c?.hreflang || [],
    schema: seo.schema || c?.schema || null,
  };
}

/** children robusto: dentro o arriba */
const children = computed<any[]>(() => {
  const v: any = apiRes.value;
  const c: any = rawCategory.value;
  const inside = c?.children;
  const top = v?.children || v?.data?.children;
  return Array.isArray(inside) ? inside : Array.isArray(top) ? top : [];
});

/** Normaliza SIEMPRE links a /categorias/... (evita que alguien cuele /api/...) */
function toCategoryPath(p: any) {
  let s = String(p || "").trim();
  if (!s) return "";
  // si por error viene un /api/cms/category/...
  s = s.replace(/^\/api\/cms\/category\//, "/categorias/");
  if (!s.startsWith("/")) s = "/" + s;
  if (!s.startsWith("/categorias/")) s = "/categorias/" + s.replace(/^\/+/, "");
  return s.replace(/\/+$/, "");
}

const safeCategory = computed<any | null>(() => {
  const c = rawCategory.value;
  if (!c) return null;

  const img = parseImage(c);
  const seo = buildSeo(c);

  return {
    ...c,
    title: c.title ?? "",
    nav: c.nav ?? "",
    description: c.description ?? "",
    image:
      c.image && typeof c.image === "object"
        ? c.image
        : { src: img.src, width: img.width, height: img.height },
    imageSrc: img.src,
    alt: c.alt ?? img.alt,

    breadcrumbs: buildBreadcrumbs(c),

    faqs: c.faqs ?? c.faq ?? [],
    actions: c.actions ?? [],
    relatedWorks: c.relatedWorks ?? [],
    products: Array.isArray(c.products) ? c.products : [],

    children: children.value,

    tabs: categoryTabs.value,
    seo,
    hidden: !!c.hidden,
    path: toCategoryPath(c.path || categoryPath.value),
  };
});

const isHub = computed(() => children.value.length > 0);

const productItems = computed(() =>
  (safeCategory.value?.products || []).map((p: any) => ({
    title: p.title,
    to: `/productos/${p.slug}`,
    imageSrc: p.imageSrc || p.image?.src,
    imageAlt: p.imageAlt || p.image?.alt || p.title,
  }))
);

const childItems = computed(() => {
  const parentPath = toCategoryPath(safeCategory.value?.path || categoryPath.value);
  return (children.value || []).map((k: any) => {
    const childPath =
      toCategoryPath(k.path) ||
      toCategoryPath(`${parentPath}/${String(k.slug || "").trim()}`);
    return {
      title: k.nav || k.title,
      to: childPath,
      imageSrc: k.imageSrc || k.image?.src,
      imageAlt: k.alt || k.nav || k.title,
    };
  });
});

/** SEO */
const seo = computed(() => safeCategory.value?.seo);
const robots = computed(() =>
  safeCategory.value?.hidden ? "noindex,follow" : "index,follow"
);

useSeoMeta(() => {
  const c = safeCategory.value;
  const s = seo.value;
  if (!c || !s) return {};

  const canonicalAbs = s.canonical
    ? absUrl(s.canonical)
    : absUrl(c.path || categoryPath.value);

  return {
    title: s.metaTitle || c.title,
    description: s.metaDescription || c.description,
    robots: robots.value,

    ogTitle: s.metaTitle || c.title,
    ogDescription: s.metaDescription || c.description,
    ogImage: c.imageSrc || undefined,
    ogUrl: canonicalAbs,

    twitterCard: c.imageSrc ? "summary_large_image" : "summary",
    twitterTitle: s.metaTitle || c.title,
    twitterDescription: s.metaDescription || c.description,
    twitterImage: c.imageSrc || undefined,
  };
});

const {
  public: { mediaBaseUrl },
} = useRuntimeConfig();
const guideCtaBg = computed(
  () => `${String(mediaBaseUrl || "").replace(/\/$/, "")}/ui/guia-preparar-archivos.webp`
);

useHead(() => {
  const c = safeCategory.value;
  const s = seo.value;
  if (!c || !s) return {};

  const links: any[] = [];
  const canonicalAbs = s.canonical
    ? absUrl(s.canonical)
    : absUrl(c.path || categoryPath.value);
  links.push({ rel: "canonical", href: canonicalAbs });

  for (const h of s.hreflang || []) {
    if (h?.lang && h?.url)
      links.push({ rel: "alternate", hreflang: h.lang, href: absUrl(h.url) });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (c.breadcrumbs || []).map((b: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: b.name,
      item: absUrl(b.url),
    })),
  };

  const faqs = (c.faqs || []).filter((f: any) => f?.question && f?.answer);
  const faqSchema = faqs.length
    ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f: any) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    }
    : null;

  const baseSchema = s.schema ? (Array.isArray(s.schema) ? s.schema : [s.schema]) : [];
  const fullSchema = [...baseSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return {
    link: links,
    script: fullSchema.length
      ? [{ type: "application/ld+json", children: JSON.stringify(fullSchema) }]
      : [],
  };
});
</script>

<template>
  <main class="bg-white min-h-screen">
    <div v-if="pending" class="flex items-center justify-center min-h-[60vh]">
      <div class="animate-pulse text-slate-400 font-medium text-lg">
        Cargando categoría...
      </div>
    </div>

    <div v-else-if="error || notFound" class="mx-auto max-w-[1440px] px-6 py-24 text-center">
      <h1 class="text-3xl font-bold text-slate-900">¡Ups! Categoría no encontrada</h1>
      <p class="mt-4 text-slate-600">
        Parece que la página que buscas no existe o ha cambiado de lugar.
      </p>
      <NuxtLink to="/categorias" class="mt-8 inline-block bg-sky-700 text-white px-8 py-3 rounded-full font-semibold">
        Ver todas las categorías
      </NuxtLink>
    </div>

    <template v-else-if="safeCategory">
      <CategoryHero :category="safeCategory" />

      <nav class="bg-slate-50 border-b border-slate-200">
        <div class="mx-auto max-w-[1440px] px-6 py-4">
          <SiteBreadcrumbs :items="safeCategory.breadcrumbs.map((b: any) => ({ label: b.name, to: b.url }))"
            :auto="false" :json-ld="false" />
        </div>
      </nav>

      <section class="py-12 md:py-16">
        <CategoryProductsGrid :title="isHub ? 'Elige una subcategoría' : 'Selecciona el tipo de producto'" :subtitle="isHub
            ? 'Explora las opciones dentro de esta categoría'
            : 'Configura tu impresión a medida'
          " :items="isHub ? childItems : productItems" />
      </section>

      <div class="border-y border-slate-100 bg-slate-50/50 py-16">
        <CategoryTabs v-if="safeCategory.tabs?.length" :tabs="safeCategory.tabs" :sticky-top="112" :scroll-offset="140"
            bar-container-class="mx-auto w-full max-w-[1440px] px-6"
  content-container-class="mx-auto w-full max-w-[1440px] px-6 lg:px-16 xl:px-24"
/>
      </div>

      <section>
        <div class="mx-auto max-w-[1440px] px-6">
          <div class="grid lg:grid-cols-2 gap-12 items-start">
            <div class="space-y-8">
              <CategoryGuideCTA :image-src="guideCtaBg" to="/como-preparar-archivos" />
              <CategoryRelatedWorks v-if="safeCategory.relatedWorks?.length" :items="safeCategory.relatedWorks" />
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>
