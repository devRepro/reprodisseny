<template>
  <div>
    <HomeHero>
      <HomeImageStrip :images="stripImages" />
    </HomeHero>

    <div class="home-campaign-band">
      <div class="home-section__inner">
        <HomeCampaignBanner
          title="Calendarios de empresa para 2027"
          description="Personaliza tus calendarios con tu imagen de marca y tenlos listos con tiempo para empezar 2027 sin prisas de última hora."
          image-src="https://webcms.blob.core.windows.net/media/landing/calendarios/hero.webp"
          image-sizes="(min-width: 1024px) 34vw, 100vw"
          :image-width="1667"
          :image-height="1244"
          image-alt="Calendarios corporativos personalizados impresos para empresas"
          eager
          :benefits="calendarBannerBenefits"
          primary-label="Ver calendarios 2027"
          primary-to="/calendarios/calendarios-corporativos-2027"
        />
      </div>
    </div>

    <MarketingProductCategoryGrid
      title="Productos y soluciones de impresión"
      description="Explora nuestras soluciones de impresión, gran formato, adhesivos, packaging, eventos y producción gráfica para empresas."
      :categories="safeHomeCategories"
      :total-slots="8"
      :pending="homeCategoriesPending"
      container-class="home-section__inner py-10 md:py-14 lg:py-16"
    />

    <HomeBusinessIntro />

    <MarketingServicesGrid />

    <MarketingProcessSection
      section-class="home-section home-section--compact bg-background"
      container-class="home-section__inner"
      cta-label="Contacta con nosotros"
      cta-to="/contacto"
    />

    <section class="home-trust-block">
      <ClientLogosBand :logos="clientLogos" />

      <GoogleReviewsSection />
    </section>

    <GetFiles submit-endpoint="/api/price-requests" />
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

import HomeHero from "@/components/marketing/HomeHero.vue";
import HomeImageStrip from "@/components/marketing/HomeImageStrip.vue";
import HomeBusinessIntro from "@/components/marketing/HomeBusinessIntro.vue";
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import MarketingProcessSection from "@/components/marketing/ProcessSection.vue";
import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue";
import GetFiles from "@/components/marketing/GetFiles.vue";
import HomeCampaignBanner from "@/components/shared/banner/HomeCampaignBanner.vue";

import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid";

import { GoogleReviewsSection, MarketingServicesGrid } from "#components";

import {
  buildSiteIdentitySchema,
  SITE_IDENTITY,
  SITE_URL,
} from "~/utils/seo/siteIdentity";

definePageMeta({
  layout: "home",
});

const {
  categories: homeCategories,
  pending: homeCategoriesPending,
} = await useHomeCategoriesGrid(8);

const safeHomeCategories = computed(() => homeCategories.value ?? []);

/**
 * SEO principal de la home.
 *
 * GSC está mostrando oportunidad para:
 * - imprenta digital barcelona
 * - imprenta barcelona
 * - impresión digital barcelona
 * - reprografía barcelona
 *
 * No intentamos introducir todas las variantes en el <title>.
 * Las secundarias deben trabajarse en el contenido visible.
 */
const HOME_URL = `${SITE_URL}/`;

const HOME_TITLE = "Imprenta en Barcelona | Digital, offset y gran formato";

const HOME_DESCRIPTION =
  "Imprenta en Barcelona para empresas: impresión digital, offset, gran formato, vinilos, PLV y packaging. Producción, acabados y logística. Pide presupuesto.";

const homeIdentitySchema = buildSiteIdentitySchema({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  inLanguage: "es-ES",
});

useSeoMeta({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,

  ogType: "website",
  ogTitle: HOME_TITLE,
  ogDescription: HOME_DESCRIPTION,
  ogUrl: HOME_URL,
  ogImage: SITE_IDENTITY.imageUrl,

  twitterCard: "summary_large_image",
  twitterTitle: HOME_TITLE,
  twitterDescription: HOME_DESCRIPTION,
  twitterImage: SITE_IDENTITY.imageUrl,
});

useHead({
  link: [
    {
      rel: "canonical",
      href: HOME_URL,
    },
    {
      rel: "preconnect",
      href: "https://webcms.blob.core.windows.net",
    },
    {
      rel: "dns-prefetch",
      href: "https://webcms.blob.core.windows.net",
    },
  ],

  script: [
    {
      id: "site-identity-jsonld",
      type: "application/ld+json",
      textContent: JSON.stringify(homeIdentitySchema),
    },
  ],
});

const calendarBannerBenefits = [
  {
    icon: "calendar" as const,
    title: "4 formatos",
    description: "De mesa y de pared",
  },
  {
    icon: "design" as const,
    title: "Diseño a medida, gratis",
    description: "Adaptado a tu empresa",
  },
  {
    icon: "production" as const,
    title: "Producción propia",
    description: "En Barcelona",
  },
];

const stripImages = [
  {
    src: "/img/home/preimpresion-960.webp",
    width: 1066,
    height: 800,
    webpSrcset:
      "/img/home/preimpresion-640.webp 640w, /img/home/preimpresion-960.webp 960w, /img/home/preimpresion-1066.webp 1066w",
    avifSrcset:
      "/img/home/preimpresion-640.avif 640w, /img/home/preimpresion-960.avif 960w, /img/home/preimpresion-1066.avif 1066w",
    sizes: "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 84vw",
    alt: "Preparación y preimpresión de trabajos gráficos",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/impresion.webp",
    width: 1200,
    height: 800,
    alt: "Producción de impresión profesional",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/instalacion-vinilo.webp",
    width: 1200,
    height: 800,
    alt: "Instalación profesional de vinilo",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/logistica.webp",
    width: 1200,
    height: 800,
    alt: "Preparación y logística de trabajos gráficos",
  },
];

const clientLogos = [
  {
    src: "/img/customers/vallhebron.svg",
    alt: "Vall d'Hebron",
  },
  {
    src: "/img/customers/fcf.svg",
    alt: "Federació Catalana",
  },
  {
    src: "/img/customers/adevinta.svg",
    alt: "Adevinta",
  },
  {
    src: "/img/customers/hitachi.svg",
    alt: "Hitachi",
  },
  {
    src: "/img/customers/tuv.svg",
    alt: "TÜV Rheinland",
  },
  {
    src: "/img/customers/vueling.svg",
    alt: "Vueling",
  },
  {
    src: "/img/customers/cromology.svg",
    alt: "Cromology",
  },
  {
    src: "/img/customers/who.svg",
    alt: "World Health Organization",
  },
  {
    src: "/img/customers/uab.svg",
    alt: "UAB",
  },
  {
    src: "/img/customers/alcon.svg",
    alt: "Alcon",
  },
  {
    src: "/img/customers/renault.svg",
    alt: "Renault",
  },
  {
    src: "/img/customers/green-vita.svg",
    alt: "Green Vita",
  },
];
</script>
