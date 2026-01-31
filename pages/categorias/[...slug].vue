<script setup lang="ts">
  import { computed } from "vue"
  
  import CategoryHero from "@/components/marketing/category/CategoryHero.vue"
  import CategoryActionGrid from "@/components/marketing/category/CategoryActionGrid.vue"
  import CategoryGuideTabs from "@/components/marketing/category/CategoryGuideTabs.vue"
  import CategoryFaqList from "@/components/marketing/category/CategoryFaqList.vue"
  
  const route = useRoute()
  
  const slugParts = computed<string[]>(() => {
    const s = route.params.slug
    return Array.isArray(s) ? s : s ? [s] : []
  })
  
  const categorySlug = computed(() => slugParts.value[0] || null)
  
  const categoryPath = computed(() =>
    ["/categorias", ...slugParts.value].join("/").replace(/\/+$/, "")
  )
  
  // Doc (content / CMS)
  const { data: doc } = await useAsyncData(
    () => `cat:doc:${categoryPath.value}`,
    () => queryCollection("categorias").path(categoryPath.value).first(),
    { server: true }
  )
  
  // Hero
  const heroTitle = computed(
    () =>
      doc.value?.title ??
      (categorySlug.value ? categorySlug.value.replace(/-/g, " ") : "Categoría")
  )
  
  const heroDesc = computed(() => doc.value?.description ?? "")
  
  const heroImg = computed(() => {
    const img = doc.value?.image
    return typeof img === "string" ? img : img?.src ?? "/img/placeholders/categoria.webp"
  })
  
  // SEO
  const reqUrl = useRequestURL()
  const canonical = computed(() => new URL(route.fullPath, `${reqUrl.origin}`).toString())
  const seoTitle = computed(() => doc.value?.metaTitle ?? heroTitle.value)
  const seoDesc = computed(() =>
    (doc.value?.metaDescription ?? heroDesc.value ?? "Impresión profesional.")
      .toString()
      .slice(0, 160)
  )
  
  const robots = computed(() => (doc.value?.hidden ? "noindex, nofollow" : "index, follow"))
  
  useSeoMeta({
    title: seoTitle,
    description: seoDesc,
    ogTitle: seoTitle,
    ogDescription: seoDesc,
    ogType: "website",
    ogUrl: canonical,
    ogImage: heroImg,
    twitterCard: "summary_large_image",
    twitterTitle: seoTitle,
    twitterDescription: seoDesc,
    robots,
  })
  
  useHead({ link: [{ rel: "canonical", href: canonical.value }] })
  
  const hasFaqs = computed(() => Array.isArray(doc.value?.faqs) && doc.value!.faqs.length > 0)
  
  // Data “landing”
  const actions = computed(() => doc.value?.actions ?? []) // [{title,to,imageSrc}]
  const guides = computed(() => doc.value?.guides ?? [])   // [{key,label,imageSrc,bullets:[]}]
  </script>
  

<template>
  <main class="bg-background text-foreground">
    <SharedMenuCategories />

    <CategoryHero
      :title="heroTitle"
      :subtitle="heroDesc"
      :image-src="heroImg"
      :primary-cta="{ label: 'Pide tu presupuesto', to: '/contacto' }"
    />

    <CategoryActionGrid
      title="¿Qué quieres hacer?"
      :items="doc?.actions ?? []"
    />

    <CategoryGuideTabs
      title="Impresión de libros, revistas y catálogos."
      subtitle="Elementos clave en la estrategia de comunicación."
      :tabs="doc?.guides ?? []"
    />

    <CategoryFaqList
      :title="`Preguntas frecuentes sobre ${heroTitle}`"
      :items="doc?.faqs ?? []"
    />
  </main>
</template>
