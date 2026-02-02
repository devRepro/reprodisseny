<!-- pages/categorias/[...slug].vue -->
<script setup lang="ts">
import CategoryHero from "@/components/marketing/category/CategoryHero.vue"
import CategoryActionsGrid from "@/components/marketing/category/CategoryActionsGrid.vue"
import CategoryIntro from "@/components/marketing/category/CategoryIntro.vue"
import CategoryTabs from "@/components/marketing/category/CategoryTabs.vue"
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue"
import CategoryGuideCTA from "@/components/marketing/category/CategoryGuideCTA.vue"
import CategoryRelatedWorks from "@/components/marketing/category/CategoryRelatedWorks.vue"
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue"

const route = useRoute()

const slugParts = computed<string[]>(() => {
  const s = route.params.slug
  if (Array.isArray(s)) return s.filter(Boolean).map(String)
  return s ? [String(s)] : []
})

const categoryPath = computed(() => "/categorias/" + slugParts.value.join("/"))

const { data: category, pending, error } = await useAsyncData(
  () => `cat:${categoryPath.value}`,
  () => $fetch(`/api/cms/category/${slugParts.value.join("/")}`),
  { server: true }
)

console.log("CATEGORÍA:", categoryPath.value, category.value);
const buildBreadcrumbs = (c: any) => {
  // Si ya vienen definidos, respétalos (mejor para SEO y control)
  if (Array.isArray(c?.breadcrumbs) && c.breadcrumbs.length) return c.breadcrumbs

  // Fallback automático
  const crumbs = [
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/categorias" },
  ]
  if (c?.parent) crumbs.push({ name: c.parent, url: `/categorias/${c.parent}` })

  const currentName = c?.nav || c?.title || slugParts.value[0] || "Categoría"
  crumbs.push({ name: currentName, url: categoryPath.value })
  return crumbs
}

const parseImage = (c: any) => {
  // Soporta:
  // - image: "https://...png, Alt..."
  // - image: { src, width, height }
  // - imageSrc suelto
  const raw = c?.image
  const fromImageSrc = c?.imageSrc ? String(c.imageSrc).trim() : ""

  if (typeof raw === "string") {
    const parts = raw.split(",")
    const src = (parts.shift() || "").trim() || fromImageSrc || null
    const legacyAlt = parts.join(",").trim()
    return {
      src,
      width: undefined,
      height: undefined,
      alt: (c?.alt || legacyAlt || c?.title || c?.nav || "Categoría").trim(),
    }
  }

  if (raw && typeof raw === "object") {
    const src = (raw?.src ? String(raw.src).split(",")[0].trim() : "") || fromImageSrc || null
    return {
      src,
      width: Number(raw?.width) || undefined,
      height: Number(raw?.height) || undefined,
      alt: (c?.alt || c?.title || c?.nav || "Categoría").trim(),
    }
  }

  if (fromImageSrc) {
    return {
      src: fromImageSrc,
      width: undefined,
      height: undefined,
      alt: (c?.alt || c?.title || c?.nav || "Categoría").trim(),
    }
  }

  return { src: null, width: undefined, height: undefined, alt: (c?.alt || c?.title || c?.nav || "Categoría").trim() }
}

const buildSeo = (c: any) => {
  // Soporta seo anidado o campos a nivel raíz
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

const guideCtaBg = computed(() => {
  const base = String(mediaBaseUrl || "").replace(/\/$/, "")
  return `${base}/ui/guia-preparar-archivos.webp` // 👈 tu ruta real dentro de /ui
})


const gridItems = computed(() => {
  const prods = safeCategory.value?.products || [] // ajusta al campo real
  return prods.map((p: any) => ({
    title: p.title,
    to: `/productos/${p.slug}`,
    imageSrc: p.imageSrc || p.image?.src,
    imageAlt: p.imageAlt || p.image?.alt || p.title,
  }))
})


const safeCategory = computed<any | null>(() => {
  const c = category.value
  if (!c) return null

  const img = parseImage(c)
  const seo = buildSeo(c)

  return {
    ...c,

    // Plantilla (aprovecha todo)
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
    cta: c.cta?.link ? c.cta : { text: c.cta?.text || "Ver Productos", link: c.cta?.link || "#productos" },

    keywords: Array.isArray(c.keywords) ? c.keywords : [],
    searchTerms: Array.isArray(c.searchTerms) ? c.searchTerms : [],
    faqs: c.faqs ?? c.faq ?? [],

    // Compatibilidad vieja
    faq: c.faq ?? c.faqs ?? [],
    actions: c.actions ?? [],
    tabs: c.tabs ?? [],
    relatedWorks: c.relatedWorks ?? [],

    // Imagen “plana” para tus componentes existentes
    imageSrc: img.src,

    // SEO consolidado en un sitio
    seo,
  }
})

const seo = computed(() => safeCategory.value?.seo)

const robots = computed(() => (safeCategory.value?.hidden ? "noindex,follow" : "index,follow"))

useSeoMeta(()=>{
  const c = safeCategory.value
  const s = seo.value
  if (!c || !s) return {}

  return {
    title: s.metaTitle || c.title,
    description: s.metaDescription || c.description,
    robots: robots.value,

    ogTitle: s.metaTitle || c.title,
    ogDescription: s.metaDescription || c.description,
    ogImage: c.imageSrc || undefined,
    ogUrl: s.canonical || undefined,

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

  // Canonical (si no viene, usa el path actual)
  links.push({ rel: "canonical", href: s.canonical || categoryPath.value })

  // hreflang
  for (const h of s.hreflang || []) {
    if (h?.lang && h?.url) links.push({ rel: "alternate", hreflang: h.lang, href: h.url })
  }

  // Schema: aquí es donde añadimos lo que faltaba para SEO real:
  // - BreadcrumbList
  // - FAQPage
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (c.breadcrumbs || []).map((b: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: b.name,
      item: b.url,
    })),
  }

  const faqs = (c.faqs || []).filter((f: any) => f?.question && f?.answer)
  const faqSchema =
    faqs.length
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

  // Si ya tienes schema base (CollectionPage), lo mantenemos y lo complementamos
  const baseSchema = s.schema ? (Array.isArray(s.schema) ? s.schema : [s.schema]) : []
  const fullSchema = [...baseSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])]

  return {
    link: links,
    script: fullSchema.length
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(fullSchema),
          },
        ]
      : [],
  }
})




</script>

<template>
  <main>
    <div v-if="pending" class="mx-auto max-w-7xl px-6 py-16">
      Cargando…
    </div>

    <div v-else-if="error" class="mx-auto max-w-7xl px-6 py-16">
      No se ha podido cargar la categoría.
    </div>

    <template v-else-if="safeCategory">
      <CategoryHero :category="safeCategory" />

      <CategoryProductsGrid
  title="¿Qué quieres hacer?"
  :items="gridItems"
/>

      <!-- Solo si existen (evita romper si el catálogo no trae estos campos) -->
      <CategoryActionsGrid v-if="safeCategory.actions?.length" :items="safeCategory.actions" />

      <CategoryIntro :category="safeCategory" />

      <CategoryTabs v-if="safeCategory.tabs?.length" :tabs="safeCategory.tabs" />

      <CategoryFaq v-if="safeCategory.faqs?.length" :items="safeCategory.faqs" />

      <!-- Aquí ya usas Azure Blob (SharePoint ImageSrc) -->
      <CategoryGuideCTA
  :image-src="guideCtaBg"
  to="/guia-impresion"
/>


      <CategoryRelatedWorks v-if="safeCategory.relatedWorks?.length" :items="safeCategory.relatedWorks" />
    </template>
  </main>
</template>
