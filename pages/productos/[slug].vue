<script setup lang="ts">
  import { computed } from "vue"
  
  import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue"
  import ProductHero from "@/components/marketing/product/Hero.vue"
  import GuideBanner from "@/components/marketing/GuideBanner.vue"
  import ProductDetails from "@/components/marketing/product/Details.vue"
  import ProductFaq from "@/components/marketing/product/Faq.vue"
  
  const route = useRoute()
  const slug = computed(() => String(route.params.slug || "").trim())
  
  // ✅ tus shells (consistentes con el resto)
  const containerClass = "page-shell"
  const contentNarrowClass = "mx-auto w-full max-w-[880px]"
  
  // ✅ fetch server-side del producto
  const { data, pending, error } = await useAsyncData(
    () => `cms:product:${slug.value}`,
    () =>
      $fetch(`/api/cms/product/${slug.value}`, {
        params: { includeRelated: 1, relatedLimit: 4 },
      }),
    { server: true }
  )
  
  if (error.value) {
    // 404 o fallo API
    throw createError({
      statusCode: (error.value as any)?.statusCode || 404,
      statusMessage: "Producto no encontrado",
    })
  }
  
  const product = computed(() => data.value?.product || null)
  const category = computed(() => data.value?.category || null)
  const detailsTabs = computed(() => data.value?.detailsTabs || [])
  const faqs = computed(() => data.value?.faqs || [])
  
  // ✅ breadcrumbs
  const breadcrumbItems = computed(() => {
    const items: Array<{ label: string; to?: string }> = [
      { label: "Inicio", to: "/" },
      { label: "Productos", to: "/productos" },
    ]
  
    if (category.value?.title && category.value?.slug) {
      items.push({ label: category.value.title, to: `/categorias/${category.value.slug}` })
    }
  
    if (product.value?.title) {
      items.push({ label: product.value.title })
    }
  
    return items
  })
  </script>
  
  <template>
    <main class="min-h-screen bg-background">
      <!-- Breadcrumbs -->
      <nav class="border-b border-border bg-background/60">
        <div :class="containerClass" class="py-4">
          <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
        </div>
      </nav>
  
      <!-- Loading -->
      <div v-if="pending" class="flex min-h-[40vh] items-center justify-center">
        <div class="animate-pulse text-muted-foreground font-medium">
          Cargando detalles del producto...
        </div>
      </div>
  
      <!-- Product -->
      <template v-else-if="product">
        <section :class="containerClass" class="pt-8 md:pt-16">
          <div class="grid items-start gap-12 lg:grid-cols-2">
            <ProductHero :product="product" :category="category" />
  
            <!-- Caja CTA -->
            <div class="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h3 class="text-xl font-semibold text-foreground mb-2">
                Solicitar presupuesto personalizado
              </h3>
              <p class="text-sm text-muted-foreground mb-6">
                Cuéntanos qué necesitas y nuestros expertos te responderán en menos de 24h.
              </p>
  
              <div class="space-y-4">
                <div class="flex items-center gap-3 text-sm text-foreground/80">
                  <div
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700"
                  >
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      />
                    </svg>
                  </div>
                  Revisión de archivos incluida
                </div>
  
                <button
                  class="w-full rounded-xl bg-brand py-4 font-semibold text-brand-ink-light shadow-md transition-colors hover:bg-brand-dark"
                >
                  Configurar mi {{ product.title }}
                </button>
              </div>
            </div>
          </div>
        </section>
  
        <!-- Banner guía (full bleed) -->
        <section class="mt-16 md:mt-24">
          <!-- Importante: NO lo metas dentro de container si el banner es fullBleed -->
          <GuideBanner
            title="¿No estás seguro de las medidas?"
            :cta="{ label: 'Consultar Guía', to: '/guia-impresion' }"
            base-path="/img/ui/banners/como-preparar-archivos"
            :height="240"
            :full-bleed="true"
            :rounded="false"
          />
        </section>
  
        <!-- Details -->
        <section id="detalles" class="mt-20 border-y border-border bg-muted/20 py-20 md:mt-32">
          <div :class="containerClass">
            <div :class="contentNarrowClass">
              <h2 class="mb-10 text-center">
                Especificaciones Técnicas
              </h2>
              <ProductDetails :tabs="detailsTabs" />
            </div>
          </div>
        </section>
  
        <!-- FAQ -->
        <section class="py-20">
          <div :class="containerClass">
            <div :class="contentNarrowClass">
              <h2 class="mb-8 text-center">
                Dudas frecuentes
              </h2>
              <ProductFaq :faqs="faqs" />
            </div>
          </div>
        </section>
  
        <!-- CTA final -->
        <section class="bg-brand-dark py-16 text-center text-brand-ink-light">
          <div class="page-shell">
            <h2>¿Tienes un proyecto especial?</h2>
            <p class="mx-auto mt-4 max-w-xl text-brand-ink-light/80">
              Si no encuentras lo que buscas en los detalles, contáctanos directamente y lo
              fabricaremos a medida.
            </p>
            <button
              class="mt-8 rounded-full bg-background px-10 py-4 font-semibold text-foreground transition-colors hover:bg-brand-bg-2"
            >
              Contactar con un asesor
            </button>
          </div>
        </section>
      </template>
    </main>
  </template>