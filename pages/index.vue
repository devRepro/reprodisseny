<template>
  <div>
    <HomeHero>
      <HomeImageStrip :images="stripImages" />
    </HomeHero>

    <SolarProtectionHeroBanner
      title="Láminas solares para cristales"
      image-src="/img/banners/sala_reunions.webp"
      :bullets="[
        'Reduce calor y reflejos sin obras',
        'Instalación profesional en Barcelona',
        'Presupuesto en menos de 24 h laborales',
      ]"
      primary-to="/lp/laminas-solares#quote-form"
    />

    <MarketingProductCategoryGrid
      title="Ofrecemos una amplia gama de productos"
      description="Explora las principales categorías y encuentra la solución que mejor encaja con tu proyecto."
      :categories="safeHomeCategories"
      :total-slots="8"
      :pending="homeCategoriesPending"
      container-class="home-section__inner py-10 md:py-14 lg:py-16"
    />

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
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import MarketingProcessSection from "@/components/marketing/ProcessSection.vue";
import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue";
import GetFiles from "@/components/marketing/GetFiles.vue";
import SolarProtectionHeroBanner from "@/components/shared/banner/SolarProtectionHeroBanner.vue";
import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid";
import { GoogleReviewsSection, MarketingServicesGrid } from "#components";

import {
  buildSiteIdentitySchema,
  SITE_IDENTITY,
  SITE_URL,
} from "~/utils/seo/siteIdentity";

definePageMeta({ layout: "home" });

const {
  categories: homeCategories,
  pending: homeCategoriesPending,
} = useHomeCategoriesGrid(8);

const safeHomeCategories = computed(() => homeCategories.value ?? []);

const HOME_TITLE = "Imprenta en Barcelona | Repro Disseny";

const HOME_DESCRIPTION =
  "Impresión profesional en Barcelona: impresión digital y offset, gran formato, vinilos, PLV, packaging y soluciones gráficas para empresas.";

const homeIdentitySchema = buildSiteIdentitySchema({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  inLanguage: "es-ES",
});

useSeoMeta({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,

  ogTitle: HOME_TITLE,
  ogDescription: HOME_DESCRIPTION,
  ogUrl: `${SITE_URL}/`,
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
      href: `${SITE_URL}/`,
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

const stripImages = [
  {
    src: "https://webcms.blob.core.windows.net/media/home/preimpresion.webp",
    alt: "Diseño y producción",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/impresion.webp",
    alt: "Impresión profesional",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/instalacion-vinilo.webp",
    alt: "Instalación",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/logistica.webp",
    alt: "Logística",
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
