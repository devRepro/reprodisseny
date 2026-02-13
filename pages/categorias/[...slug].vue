<!-- pages/categorias/[...slug].vue -->
<script setup lang="ts">
import { computed } from "vue"
import CategoryHero from "@/components/marketing/category/CategoryHero.vue"
import CategoryActionsGrid from "@/components/marketing/category/CategoryActionsGrid.vue"
import CategoryIntro from "@/components/marketing/category/CategoryIntro.vue"
import CategoryTabs from "@/components/marketing/category/CategoryTabs.vue"
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue"
import CategoryGuideCTA from "@/components/marketing/category/CategoryGuideCTA.vue"
import CategoryRelatedWorks from "@/components/marketing/category/CategoryRelatedWorks.vue"
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue"
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue"

import { parseTabsJson, normalizeTabs } from "~/utils/tabsJson"

const route = useRoute()
const cfg = useRuntimeConfig()

const slugParts = computed<string[]>(() => {
  const s = route.params.slug
  const arr = Array.isArray(s) ? s : s ? [s] : []
  return arr.map((v) => String(v).trim()).filter(Boolean)
})

const categoryPath = computed(() => {
  const base = "/categorias"
  return slugParts.value.length ? `${base}/${slugParts.value.join("/")}` : base
})

const slugForApi = computed(() =>
  slugParts.value.map((seg) => encodeURIComponent(seg)).join("/")
)

const siteUrl = computed(() => {
  const raw = (cfg.public as any)?.siteUrl || "https://reprodisseny.com"
  return String(raw).trim().replace(/\/+$/, "")
})

function normalizeRelPath(p: string) {
  let out = String(p || "").trim()
  if (!out) return "/"
  if (/^https?:\/\//i.test(out)) return out
  if (!out.startsWith("/")) out = `/${out}`
  out = out.replace(/\/{2,}/g, "/")
  out = out.replace(/\/+$/, "") || "/"
  return out
}

function absUrl(p?: string) {
  const rel = normalizeRelPath(p || categoryPath.value)
  if (/^https?:\/\//i.test(rel)) return rel
  return `${siteUrl.value}${rel}`.replace(/\/{2,}/g, "/").replace(":/", "://")
}

type ApiCategoryResponse =
  | { category: any; redirectTo?: string }
  | { data?: { category?: any }; redirectTo?: string }
  | { redirectTo: string }

const { data: apiRes, pending, error } = await useAsyncData<ApiCategoryResponse>(
  () => `cat:${slugForApi.value}`,
  () =>
    $fetch(`/api/cms/category/${slugForApi.value}`, {
      // si tu API soporta incluir productos, esto evita “products: []”
      params: { includeProducts: 1, productLimit: 24 },
    }),
  { server: true }
)

// ✅ Redirect si el API te pide canonicalizar
const redirectTo = computed(() => {
  const v: any = apiRes.value
  return v?.redirectTo || v?.data?.redirectTo || ""
})

if (redirectTo.value) {
  await navigateTo(redirectTo.value, { redirectCode: 301 })
}

// ✅ Coger SOLO la categoría, nunca el objeto raíz
const rawCategory = computed(() => {
  const v: any = apiRes.value
  return v?.category ?? v?.data?.category ?? null
})

// ✅ Tabs: array directo o TabsJson
const categoryTabs = computed(() => {
  const c: any = rawCategory.value
  if (!c) return []

  // 1) si ya viene array (como en tu JSON: "tabs":[...]) => úsalo tal cual
  if (Array.isArray(c.tabs) && c.tabs.length) return c.tabs

  // 2) si viene de SharePoint como string TabsJson
  const source = c?.TabsJson ?? c?.tabsJson ?? ""
  return normalizeTabs(parseTabsJson(source))
})

const humanize = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

const buildBreadcrumbs = (c: any) => {
  if (Array.isArray(c?.breadcrumbs) && c.breadcrumbs.length) return c.breadcrumbs

  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/categorias" },
  ]

  let acc = ""
  slugParts.value.forEach((seg, idx) => {
    acc += `/${seg}`
    const isLast = idx === slugParts.value.length - 1
    const label = isLast ? c?.nav || c?.title || humanize(seg) : humanize(seg)
    crumbs.push({ name: label, url: `/categorias${acc}` })
  })

  if (!slugParts.value.length) {
    crumbs.push({ name: c?.nav || c?.title || "Categoría", url: categoryPath.value })
  }
  return crumbs
}

const parseImage = (c: any) => {
  const raw = c?.image
  const fromImageSrc = c?.imageSrc ? String(c.imageSrc).trim() : ""

  if (typeof raw === "string") {
    const parts = raw.split(",")
    const src = (parts.shift() || "").trim() || fromImageSrc || null
    const legacyAlt = parts.join(",").trim()
    return { src, width: undefined, height: undefined, alt: (c?.alt || legacyAlt || c?.title || c?.nav || "Categoría").trim() }
  }

  if (raw && typeof raw === "object") {
    const src = (raw?.src ? String(raw.src).split(",")[0].trim() : "") || fromImageSrc || null
    return { src, width: Number(raw?.width) || undefined, height: Number(raw?.height) || undefined, alt: (c?.alt || c?.title || c?.nav || "Categoría").trim() }
  }

  if (fromImageSrc) return { src: fromImageSrc, width: undefined, height: undefined, alt: (c?.alt || c?.title || c?.nav || "Categoría").trim() }
  return { src: null, width: undefined, height: undefined, alt: (c?.alt || c?.title || c?.nav || "Categoría").trim() }
}

const buildSeo = (c: any) => {
  const seo = c?.seo || {}
  return {
    metaTitle: seo.metaTitle || c?.metaTitle || c?.title,
    metaDescription: seo.metaDescription || c?.metaDescription || c?.description,
    canonical: seo.canonical || c?.canonical || "",
    hreflang: seo.hreflang || c?.hreflang || [],
    schema: seo.schema || c?.schema || null,
  }
}

const { public: { mediaBaseUrl } } = useRuntimeConfig()
const guideCtaBg = computed(() => `${String(mediaBaseUrl || "").replace(/\/$/, "")}/ui/guia-preparar-archivos.webp`)

const safeCategory = computed<any | null>(() => {
  const c = rawCategory.value
  if (!c) return null

  const img = parseImage(c)
  const seo = buildSeo(c)

  return {
    ...c,
    title: c.title ?? "",
    nav: c.nav ?? "",
    order: Number(c.order ?? 0) || 0,
    parent: c.parent ?? "",
    featured: !!c.featured,
    hidden: !!c.hidden,

    description: c.description ?? "",
    image: c.image && typeof c.image === "object" ? c.image : { src: img.src, width: img.width, height: img.height },
    alt: c.alt ?? img.alt,
    galleryImages: Array.isArray(c.galleryImages) ? c.galleryImages : [],

    breadcrumbs: buildBreadcrumbs(c),

    keywords: Array.isArray(c.keywords) ? c.keywords : [],
    searchTerms: Array.isArray(c.searchTerms) ? c.searchTerms : [],
    faqs: c.faqs ?? c.faq ?? [],

    actions: c.actions ?? [],
    relatedWorks: c.relatedWorks ?? [],
    products: Array.isArray(c.products) ? c.products : [],

    // ✅ tabs definitivas
    tabs: categoryTabs.value,

    imageSrc: img.src,
    seo,
  }
})

const gridItems = computed(() => {
  const prods = safeCategory.value?.products || []
  return prods.map((p: any) => ({
    title: p.title,
    to: `/productos/${p.slug}`,
    imageSrc: p.imageSrc || p.image?.src,
    imageAlt: p.imageAlt || p.image?.alt || p.title,
  }))
})

const seo = computed(() => safeCategory.value?.seo)
const robots = computed(() => (safeCategory.value?.hidden ? "noindex,follow" : "index,follow"))

useSeoMeta(() => {
  const c = safeCategory.value
  const s = seo.value
  if (!c || !s) return {}

  const canonicalAbs = s.canonical ? absUrl(s.canonical) : absUrl(categoryPath.value)

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
  }
})

useHead(() => {
  const c = safeCategory.value
  const s = seo.value
  if (!c || !s) return {}

  const links: any[] = []
  const canonicalAbs = s.canonical ? absUrl(s.canonical) : absUrl(categoryPath.value)
  links.push({ rel: "canonical", href: canonicalAbs })

  for (const h of s.hreflang || []) {
    if (h?.lang && h?.url) links.push({ rel: "alternate", hreflang: h.lang, href: absUrl(h.url) })
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
  }

  const faqs = (c.faqs || []).filter((f: any) => f?.question && f?.answer)
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
    : null

  const baseSchema = s.schema ? (Array.isArray(s.schema) ? s.schema : [s.schema]) : []
  const fullSchema = [...baseSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])]

  return {
    link: links,
    script: fullSchema.length ? [{ type: "application/ld+json", children: JSON.stringify(fullSchema) }] : [],
  }
})
</script>

<template>
  <main>
    <div v-if="pending" class="mx-auto max-w-7xl px-6 py-16">Cargando…</div>

    <div v-else-if="error" class="mx-auto max-w-7xl px-6 py-16">
      No se ha podido cargar la categoría.
    </div>

    <template v-else-if="safeCategory">
      <CategoryHero :category="safeCategory" />

      <SiteBreadcrumbs
        :items="safeCategory.breadcrumbs.map((b: any) => ({ label: b.name, to: b.url }))"
        :auto="false"
        :json-ld="false"
        class="mx-auto max-w-7xl px-6 pt-6"
      />

      <CategoryProductsGrid title="¿Qué quieres hacer?" :items="gridItems" />

      <CategoryActionsGrid v-if="safeCategory.actions?.length" :items="safeCategory.actions" />

      <CategoryIntro :category="safeCategory" />

      <CategoryTabs v-if="safeCategory.tabs?.length" :tabs="safeCategory.tabs" />

      <CategoryFaq v-if="safeCategory.faqs?.length" :items="safeCategory.faqs" />

      <CategoryGuideCTA :image-src="guideCtaBg" to="/guia-impresion" />

      <CategoryRelatedWorks v-if="safeCategory.relatedWorks?.length" :items="safeCategory.relatedWorks" />
    </template>
  </main>
</template>
