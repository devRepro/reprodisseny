<!-- pages/productos/[slug].vue -->
<script setup lang="ts">
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import ProductHero from "@/components/marketing/product/Hero.vue";
import ProductGuideCTA from "@/components/marketing/product/GuideCTA.vue";
import ProductDetails from "@/components/marketing/product/Details.vue";
import ProductFaq from "@/components/marketing/product/Faq.vue";
import ProductRelated from "@/components/marketing/product/Related.vue";

const route = useRoute();
const slug = String(route.params.slug || "").trim();

const { data, pending, error } = await useAsyncData(
  () => `cms:product:${slug}`,
  () =>
    $fetch(`/api/cms/product/${slug}`, {
      params: { includeRelated: 1, relatedLimit: 4 },
    }),
  { server: true }
);

const product = computed(() => data.value?.product);
const category = computed(() => data.value?.category);
const related = computed(() => data.value?.related || []);
const detailsTabs = computed(() => data.value?.detailsTabs || []);
const faqs = computed(() => data.value?.faqs || []);
const breadcrumbItems = computed(() =>
  (data.value?.breadcrumbs || []).map((b: any) => ({ label: b.name, to: b.url }))
);

useSeoMeta({
  title: () => product.value?.seo?.metaTitle || product.value?.title,
  description: () =>
    product.value?.seo?.metaDescription || product.value?.shortDescription,
  ogTitle: () => product.value?.seo?.metaTitle || product.value?.title,
  ogDescription: () =>
    product.value?.seo?.metaDescription || product.value?.shortDescription,
  ogImage: () => product.value?.seo?.ogImageSrc || product.value?.image?.src,
});


</script>

<template>
  <main class="bg-white">
    <!-- 1440 fijo como Figma -->
    <div class="mx-auto max-w-[1440px]">
      <!-- Breadcrumb (controlas padding desde aquí para pixel-perfect) -->
      <SiteBreadcrumbs class="px-[120px] pt-6" :items="breadcrumbItems" />

      <div v-if="pending" class="px-[120px] py-10 text-sm text-[#959595]">Cargando…</div>
      <div v-else-if="error || !product" class="px-[120px] py-10 text-sm text-red-600">
        Producto no disponible.
      </div>

      <template v-else>
        <!-- HERO: dentro de 1200 (margen 120) -->
        <div class="px-[120px] mt-[50px]">
          <ProductHero :product="product" :category="category" />
        </div>

        <!-- CTA full width 1440x225 -->
        <div class="mt-[100px]">
          <ProductGuideCTA
            title="Cómo preparar tus archivos"
            cta-label="Contacta con un experto"
            cta-to="/contacto"
            background-src="/img/placeholder.webp"
          />
        </div>

        <!-- Detalles: 1000 centrado -->
        <div class="mt-[100px] flex justify-center">
          <div class="w-[1000px]">
            <h2 class="text-[30px] leading-[36px] font-semibold text-[#212121]">
              Detalles del producto
            </h2>
            <ProductDetails class="mt-8" :tabs="detailsTabs" />
          </div>
        </div>

        <!-- FAQs -->
        <div class="mt-[100px] flex justify-center">
          <div class="w-[1000px]">
            <h2 class="text-[30px] leading-[36px] font-semibold text-[#212121]">
              Preguntas frecuentes sobre {{ product.title }}
            </h2>
            <ProductFaq class="mt-10" :faqs="faqs" />
          </div>
        </div>

        <!-- Relacionados -->
        <div class="mt-[100px] mb-[120px] flex justify-center">
          <div class="w-[1000px]">
            <h2 class="text-[30px] leading-[36px] font-semibold text-[#212121]">
              Productos relacionados
            </h2>
            <ProductRelated class="mt-10" :items="related" />
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
