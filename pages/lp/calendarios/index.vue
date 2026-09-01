<script setup lang="ts">
import type { Component } from "vue";
import { ref } from "vue";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  Handshake,
  Headphones,
  LayoutGrid,
  PackageCheck,
  Sparkles,
  Truck,
} from "lucide-vue-next";

import LandingFaqs from "@/components/marketing/landing/LandingFaqs.vue";
import LandingProcessSteps from "@/components/marketing/landing/LandingProcessSteps.vue";
import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue";
import CalendarQuoteForm from "@/components/marketing/landing/CalendarQuoteForm.vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import type { TrackingContext } from "~/types/tracking";
import {
  CALENDAR_LANDING_CAMPAIGN,
  CALENDAR_PRODUCT_SLUG,
  calendarModels,
} from "~/shared/data/calendarProducts";
import { SITE_SCHEMA_IDS } from "~/utils/seo/siteIdentity";

definePageMeta({
  layout: "landing",
  landingVariant: "calendar",
});

type IconCard = {
  title: string;
  icon: Component;
};

type GuaranteeCard = {
  title: string;
  icon: Component;
};

const selectedModelId = ref("");

const pageUrl = "https://reprodisseny.com/lp/calendarios";
const pageTitle = "Calendarios corporativos personalizados en Barcelona | Repro Disseny";
const pageDescription =
  "Diseño e impresión de calendarios corporativos personalizados en Barcelona con producción propia, asesoramiento incluido y acabados profesionales.";

const config = useRuntimeConfig();

const mediaBaseUrl = String(
  config.public.mediaBaseUrl || "https://webcms.blob.core.windows.net/media",
).replace(/\/+$/, "");

function media(path: string) {
  const cleanPath = path.replace(/^\/+/, "").replace(/^media\//, "");
  return `${mediaBaseUrl}/${cleanPath}`;
}

const calendarImage = {
  src: media("landing/calendarios/hero.webp"),
  width: 1667,
  height: 1244,
  alt: "Calendarios corporativos personalizados impresos para empresas",
};

const teamImage = {
  src: media("landing/calendarios/porque-repro.webp"),
  width: 1200,
  height: 896,
  alt: "Equipo de Repro Disseny trabajando en producción gráfica",
};

const trackingContext: TrackingContext = {
  pageType: "landing",
  pageLanguage: "es",
  contentGroup: "material-oficina",
  serviceName: "Calendarios corporativos",
  campaignName: CALENDAR_LANDING_CAMPAIGN,
  productSlug: CALENDAR_PRODUCT_SLUG,
  categorySlug: "material-oficina",
  formId: "calendar_quote_form",
  formName: "calendar_quote_form",
};

const painPoints: IconCard[] = [
  {
    title: "Demasiado tarde para elegir un buen producto",
    icon: Clock3,
  },
  {
    title: "Las plataformas online no te asesoran",
    icon: Headphones,
  },
  {
    title: "Resultado genérico para una imagen que no lo es",
    icon: Sparkles,
  },
  {
    title: "Se te escapa el tiempo con la logística",
    icon: Truck,
  },
];

const guarantees: GuaranteeCard[] = [
  {
    title: "Rapidez en las entregas",
    icon: PackageCheck,
  },
  {
    title: "Desde 1983 en Barcelona",
    icon: BadgeCheck,
  },
  {
    title: "4 Formatos de calendarios",
    icon: LayoutGrid,
  },
  {
    title: "Asesoramiento incluido",
    icon: Handshake,
  },
];

const modelCards = calendarModels.slice(0, 4).map((model) => ({
  ...model,
  imageSrc: media(model.imagePath),
}));

const processSteps = [
  {
    number: "01",
    title: "Elige tu calendario",
    description: "Escoge el modelo ideal para tu empresa",
  },
  {
    number: "02",
    title: "Te lo diseñamos",
    description: "Envíanos tu logo y dinos colores, estilo e idioma",
  },
  {
    number: "03",
    title: "Apruebas el diseño",
    description: "Te enviamos una propuesta personalizada antes de imprimir",
  },
  {
    number: "04",
    title: "Los imprimimos",
    description: "Producimos tus calendarios rápidamente y con alta calidad",
  },
  {
    number: "05",
    title: "Los recibes",
    description: "Te los entregamos en la dirección que nos indiques",
  },
];

const reasons = [
  "Asesoramiento real, no automatizado",
  "Desde 1983 en Barcelona",
  "Producción propia",
  "Revisión de archivo incluida",
  "Un único interlocutor de principio a fin",
];

const clientLogos = [
  { src: "/img/customers/vallhebron.svg", alt: "Vall d'Hebron" },
  { src: "/img/customers/fcf.svg", alt: "FCF" },
  { src: "/img/customers/adevinta.svg", alt: "Adevinta" },
  { src: "/img/customers/hitachi.svg", alt: "Hitachi" },
  { src: "/img/customers/tuv.svg", alt: "TÜV Rheinland" },
  { src: "/img/customers/vueling.svg", alt: "Vueling" },
  { src: "/img/customers/cromology.svg", alt: "Cromology" },
  { src: "/img/customers/who.svg", alt: "World Health Organization" },
  { src: "/img/customers/uab.svg", alt: "UAB" },
  { src: "/img/customers/alcon.svg", alt: "Alcon" },
  { src: "/img/customers/renault.svg", alt: "Renault" },
  { src: "/img/customers/green-vita.svg", alt: "Green Vita" },
];

const faqs = [
  {
    question: "¿Puedo personalizar los calendarios?",
    answer:
      "Sí. Podemos incorporar logotipo, colores corporativos, imágenes, datos de contacto, mensajes, QR y fechas relevantes para tu empresa.",
  },
  {
    question: "¿Puedo encargar calendarios si no tengo diseño?",
    answer:
      "Sí. Podemos preparar una propuesta visual a partir de tu marca y de las indicaciones de estilo, idioma y contenido.",
  },
  {
    question: "¿Hay cantidad mínima de pedido?",
    answer:
      "Depende del modelo y del acabado. Indícanos el formato y la cantidad aproximada para ajustar el presupuesto.",
  },
  {
    question: "¿Cuánto tarda la producción?",
    answer:
      "El plazo depende de la cantidad y del tipo de calendario. Revisamos cada solicitud y confirmamos fecha viable antes de producir.",
  },
  {
    question: "¿Hacéis entregas fuera de Barcelona?",
    answer:
      "Sí. Podemos entregar en Barcelona y enviar calendarios a otras ubicaciones según el volumen y la planificación del pedido.",
  },
  {
    question: "¿Qué pasa si se produce algún error en la impresión?",
    answer:
      "Revisamos los archivos antes de imprimir y trabajamos con prueba o aprobación previa cuando procede para reducir riesgos.",
  },
];

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogType: "website",
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: calendarImage.src,
  ogUrl: pageUrl,
  twitterCard: "summary_large_image",
  robots: "noindex,follow",
});

useHead({
  htmlAttrs: { lang: "es" },
  link: [
    { rel: "canonical", href: pageUrl },
    { rel: "preload", as: "image", href: calendarImage.src, fetchpriority: "high" },
  ],
  script: [
    {
      key: "calendar-landing-schema",
      type: "application/ld+json",
      textContent: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${pageUrl}#webpage`,
            url: pageUrl,
            name: pageTitle,
            description: pageDescription,
            inLanguage: "es-ES",
            isPartOf: {
              "@id": SITE_SCHEMA_IDS.website,
            },
            publisher: {
              "@id": SITE_SCHEMA_IDS.organization,
            },
            mainEntity: {
              "@id": `${pageUrl}#service`,
            },
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: calendarImage.src,
              width: calendarImage.width,
              height: calendarImage.height,
            },
          },
          {
            "@type": "Service",
            "@id": `${pageUrl}#service`,
            url: pageUrl,
            name: "Calendarios corporativos personalizados",
            description: pageDescription,
            serviceType: "Diseño e impresión de calendarios corporativos personalizados",
            areaServed: {
              "@type": "City",
              name: "Barcelona",
            },
            provider: {
              "@id": SITE_SCHEMA_IDS.organization,
            },
            mainEntityOfPage: {
              "@id": `${pageUrl}#webpage`,
            },
          },
        ],
      }),
    },
  ],
});

function scrollToQuote() {
  if (!import.meta.client) return;

  document.querySelector("#quote-form")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function selectCalendarModel(modelId: string) {
  selectedModelId.value = modelId;
  scrollToQuote();
}
</script>

<template>
  <div class="calendar-page">
    <section class="calendar-hero" aria-labelledby="calendar-hero-title">
      <div class="calendar-container calendar-hero__grid">
        <div class="calendar-hero__media">
          <NuxtImg
            :src="calendarImage.src"
            :alt="calendarImage.alt"
            :width="calendarImage.width"
            :height="calendarImage.height"
            sizes="(max-width: 639px) 344px, (max-width: 1023px) 520px, 560px"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            class="calendar-hero__image"
          />
        </div>

        <div class="calendar-hero__content">
          <h1 id="calendar-hero-title" class="calendar-hero__title">
            <span>El calendario que</span>
            <span>mostrará tu marca</span>
            <span>los 365 días del año</span>
          </h1>

          <p class="calendar-hero__description">
            Diseño e impresión de calendarios corporativos en Barcelona. Cuatro formatos diferentes, papel de calidad y acabados profesionales.
          </p>

          <p class="calendar-hero__microcopy">
            Desde 1983 · Producción propia · Asesoramiento incluido
          </p>

          <AppButton
            type="button"
            size="lg"
            class="calendar-cta calendar-hero__cta"
            @click="scrollToQuote"
          >
            SOLICITA TU PRESUPUESTO SIN COMPROMISO
          </AppButton>
        </div>
      </div>
    </section>

    <section class="calendar-section calendar-section--soft" aria-labelledby="calendar-problems-title">
      <div class="calendar-container">
        <h2 id="calendar-problems-title" class="calendar-section__title calendar-section__title--wide">
          Cada año pasa lo mismo:<br />
          llega diciembre y los calendarios se convierten en un problema
        </h2>

        <ul class="calendar-icon-grid calendar-icon-grid--white" role="list">
          <li v-for="item in painPoints" :key="item.title" class="calendar-icon-card">
            <component :is="item.icon" class="calendar-icon-card__icon" aria-hidden="true" />
            <h3 class="calendar-icon-card__title">{{ item.title }}</h3>
          </li>
        </ul>
      </div>
    </section>

    <section class="calendar-section calendar-section--white" aria-labelledby="calendar-guarantees-title">
      <div class="calendar-container">
        <h2 id="calendar-guarantees-title" class="calendar-section__title">
          Calendarios corporativos de calidad y con garantía
        </h2>

        <ul class="calendar-icon-grid calendar-icon-grid--cream" role="list">
          <li v-for="item in guarantees" :key="item.title" class="calendar-icon-card">
            <component :is="item.icon" class="calendar-icon-card__icon" aria-hidden="true" />
            <h3 class="calendar-icon-card__title">{{ item.title }}</h3>
          </li>
        </ul>
      </div>
    </section>

    <section class="calendar-promo" aria-label="Promoción">
      <p class="calendar-promo__title">Tu diseño a medida, gratis</p>
      <p class="calendar-promo__text">
        Promoción válida para pedidos realizados hasta el 1 de diciembre.
      </p>
    </section>

    <section class="calendar-section calendar-section--models" aria-labelledby="calendar-models-title">
      <div class="calendar-container">
        <h2 id="calendar-models-title" class="calendar-section__title calendar-section__title--models">
          Elige el calendario que más se ajusta a tus necesidades
        </h2>
        <div class="calendar-models-grid" role="list">
          <button
            v-for="model in modelCards"
            :key="model.id"
            type="button"
            class="calendar-model-card"
            :class="{ 'calendar-model-card--selected': selectedModelId === model.id }"
            :aria-pressed="selectedModelId === model.id"
            @click="selectCalendarModel(model.id)"
          >
            <span class="calendar-model-card__media">
              <NuxtImg
                :src="model.imageSrc"
                :alt="model.imageAlt"
                width="1000"
                height="747"
                sizes="(max-width: 639px) 344px, (max-width: 1023px) 300px, 252px"
                loading="lazy"
                decoding="async"
                class="calendar-model-card__image"
              />
            </span>

            <span class="calendar-model-card__title">{{ model.title }}</span>
            <span class="calendar-model-card__context">{{ model.context }}</span>
          </button>
        </div>

        <p class="calendar-models__note">
          Todos nuestros calendarios se personalizan según las necesidades de cada empresa. Si tienes dudas, te asesoramos para elegir la mejor opción.
        </p>

        <AppButton
          type="button"
          size="lg"
          class="calendar-cta calendar-models__cta"
          @click="scrollToQuote"
        >
          SOLICITA TU PRESUPUESTO SIN COMPROMISO
        </AppButton>
      </div>
    </section>

    <section class="calendar-process" aria-labelledby="calendar-process-title">
      <div class="calendar-container">
        <h2 id="calendar-process-title" class="calendar-process__title">
          Tus calendarios corporativos para el 2027, listos en cinco pasos
        </h2>

        <LandingProcessSteps :steps="processSteps" class="calendar-process__steps" />
      </div>
    </section>

    <section class="calendar-why" aria-labelledby="calendar-why-title">
      <div class="calendar-container calendar-why__grid">
        <div class="calendar-why__media">
          <NuxtImg
            :src="teamImage.src"
            :alt="teamImage.alt"
            :width="teamImage.width"
            :height="teamImage.height"
            sizes="(max-width: 639px) 0px, (max-width: 1023px) 640px, 520px"
            loading="lazy"
            fetchpriority="auto"
            decoding="async"
            class="calendar-why__image"
          />
        </div>

        <div class="calendar-why__content">
          <h2 id="calendar-why-title" class="calendar-why__title">
            Por qué nos siguen eligiendo año tras año
          </h2>

          <ul class="calendar-why__list" role="list">
            <li v-for="reason in reasons" :key="reason" class="calendar-why__item">
              <Check class="calendar-why__check" aria-hidden="true" />
              <span>{{ reason }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <ClientLogosBand
      :logos="clientLogos"
      title="Clientes que confían en nosotros"
      eyebrow=""
      heading-align="center"
    />

    <LandingFaqs
      :items="faqs"
      title="Preguntas frecuentes"
      :default-open="false"
    />

    <section id="quote-form" class="calendar-form-section" aria-labelledby="calendar-form-title">
      <div class="calendar-container calendar-form-section__inner">
        <div class="calendar-form-section__heading">
          <CalendarDays class="calendar-form-section__icon" aria-hidden="true" />
          <h2 id="calendar-form-title" class="calendar-form-section__title">
            ¿Qué calendario quieres?
          </h2>
          <p class="calendar-form-section__subtitle">
            Recibirás tu presupuesto en pocos minutos
          </p>
        </div>
        <CalendarQuoteForm
          :preselected-model-id="selectedModelId"
          :tracking-context="trackingContext"
          @model-change="selectedModelId = $event"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.calendar-page {
  --calendar-blue: #0076b3;
  --calendar-blue-dark: #004f78;
  --calendar-soft: #e8f5fb;
  --calendar-cream: #f8f1df;
  --calendar-cream-card: #f6edd8;
  --calendar-ink: #1f2529;
  --calendar-muted: #4e6672;
  background: #ffffff;
  color: var(--calendar-ink);
  overflow-x: clip;
}

.calendar-page :where(h1, h2, h3, p, ul) {
  margin: 0;
}

.calendar-page :where(ul) {
  padding: 0;
  list-style: none;
}

.calendar-container {
  width: min(100% - 40px, 1200px);
  margin-inline: auto;
}

.calendar-hero {
  background: #ffffff;
  padding: 48px 0 70px;
}

.calendar-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 530px) minmax(0, 560px);
  align-items: center;
  justify-content: space-between;
  gap: 70px;
}

.calendar-hero__media {
  min-width: 0;
}

.calendar-hero__image {
  display: block;
  width: min(100%, 520px);
  height: auto;
  aspect-ratio: 1667 / 1244;
  object-fit: contain;
}

.calendar-hero__content {
  min-width: 0;
  padding-top: 10px;
}

.calendar-hero__title {
  color: var(--calendar-ink);
  font-family: var(--font-sans);
  font-size: 52px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
}

.calendar-hero__title span {
  display: block;
}

.calendar-hero__description {
  max-width: 540px;
  margin-top: 26px;
  color: var(--calendar-muted);
  font-size: 21px;
  font-weight: 400;
  line-height: 1.38;
}

.calendar-hero__microcopy {
  margin-top: 22px;
  color: var(--calendar-ink);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.calendar-cta {
  min-height: 52px !important;
  border-radius: 8px !important;
  padding-inline: 24px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
  white-space: normal !important;
  text-align: center !important;
}

.calendar-hero__cta {
  margin-top: 32px;
}

.calendar-section {
  padding: 70px 0 76px;
}

.calendar-section--soft,
.calendar-section--models,
.calendar-form-section {
  background: var(--calendar-soft);
}

.calendar-section--white {
  background: #ffffff;
}

.calendar-section__title,
.calendar-process__title,
.calendar-why__title,
.calendar-form-section__title {
  color: var(--calendar-ink);
  font-family: var(--font-sans);
  font-size: clamp(30px, 3vw, 40px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: 0;
  text-align: center;
}

.calendar-section__title--wide {
  max-width: 870px;
  margin-inline: auto;
}

.calendar-icon-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 44px;
}

.calendar-icon-card {
  display: flex;
  min-height: 170px;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  border-radius: 8px;
  padding: 28px 18px;
  text-align: center;
}

.calendar-icon-grid--white .calendar-icon-card {
  background: #ffffff;
}

.calendar-icon-grid--cream .calendar-icon-card {
  background: var(--calendar-cream-card);
}

.calendar-icon-card__icon {
  width: 38px;
  height: 38px;
  color: var(--calendar-blue);
  stroke-width: 1.8;
}

.calendar-icon-card__title {
  color: var(--calendar-ink);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.22;
}

.calendar-promo {
  display: grid;
  min-height: 132px;
  place-items: center;
  gap: 8px;
  background: var(--calendar-blue-dark);
  padding: 28px 20px;
  color: #ffffff;
  text-align: center;
}

.calendar-promo__title {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.12;
}

.calendar-promo__text {
  color: rgb(255 255 255 / 0.84);
  font-size: 16px;
  line-height: 1.35;
}

.calendar-section--models {
  padding-bottom: 72px;
}

.calendar-section__title--models {
  max-width: 760px;
  margin-inline: auto;
}

.calendar-models-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
  margin-top: 42px;
}

.calendar-model-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;
  color: inherit;
  text-align: left;
  box-shadow: 0 12px 30px rgb(0 0 0 / 7%);
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.calendar-model-card:hover,
.calendar-model-card:focus-visible,
.calendar-model-card--selected {
  border-color: var(--calendar-blue);
  box-shadow: 0 16px 36px rgb(0 118 179 / 15%);
  transform: translateY(-2px);
}

.calendar-model-card__media {
  display: block;
  overflow: hidden;
  border-radius: 6px;
  aspect-ratio: 1000 / 747;
  background: #ffffff;
}

.calendar-model-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.calendar-model-card__title {
  display: block;
  color: var(--calendar-ink);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.22;
}

.calendar-model-card__context {
  display: block;
  color: var(--calendar-muted);
  font-size: 14px;
  line-height: 1.35;
}

.calendar-models__note {
  max-width: 790px;
  margin: 34px auto 0;
  color: var(--calendar-muted);
  font-size: 18px;
  line-height: 1.45;
  text-align: center;
}

.calendar-models__cta {
  display: flex !important;
  width: fit-content !important;
  margin: 28px auto 0;
}

.calendar-process {
  background: var(--calendar-blue);
  padding: 70px 0 78px;
  color: #ffffff;
}

.calendar-process__title {
  max-width: 820px;
  margin-inline: auto;
  color: #ffffff;
}

.calendar-process__steps {
  margin-top: 40px;
}

.calendar-why {
  background: #ffffff;
  padding: 72px 0 76px;
}

.calendar-why__grid {
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 520px);
  align-items: center;
  justify-content: space-between;
  gap: 70px;
}

.calendar-why__media {
  overflow: hidden;
  border-radius: 8px;
}

.calendar-why__image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1200 / 896;
  object-fit: cover;
}

.calendar-why__title {
  text-align: left;
}

.calendar-why__list {
  display: grid;
  gap: 15px;
  margin-top: 30px;
}

.calendar-why__item {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  color: var(--calendar-ink);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.calendar-why__check {
  width: 21px;
  height: 21px;
  color: var(--calendar-blue);
  stroke-width: 2.4;
}

.calendar-form-section {
  scroll-margin-top: 84px;
  padding: 68px 0 78px;
}

.calendar-form-section__inner {
  display: grid;
  gap: 30px;
}

.calendar-form-section__heading {
  text-align: center;
}

.calendar-form-section__icon {
  display: block;
  width: 32px;
  height: 32px;
  margin: 0 auto 14px;
  color: var(--calendar-blue);
}

.calendar-form-section__subtitle {
  margin-top: 10px;
  color: var(--calendar-muted);
  font-size: 18px;
  line-height: 1.4;
}

@media (max-width: 1023px) {
  .calendar-hero__grid,
  .calendar-why__grid {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 34px;
  }

  .calendar-hero__content {
    max-width: 640px;
    padding-top: 0;
    text-align: center;
  }

  .calendar-hero__description {
    margin-inline: auto;
  }

  .calendar-icon-grid,
  .calendar-models-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .calendar-why__content {
    max-width: 640px;
  }
}

@media (max-width: 639px) {
  .calendar-container {
    width: min(100% - 32px, 392px);
  }

  .calendar-hero {
    padding: 28px 0 52px;
  }

  .calendar-hero__grid {
    gap: 24px;
  }

  .calendar-hero__image {
    width: min(100%, 344px);
  }

  .calendar-hero__content {
    text-align: left;
  }

  .calendar-hero__title {
    font-size: 36px;
    line-height: 1.07;
  }

  .calendar-hero__title span {
    display: inline;
  }

  .calendar-hero__description {
    margin-top: 20px;
    font-size: 18px;
    line-height: 1.36;
  }

  .calendar-hero__microcopy {
    margin-top: 18px;
    font-size: 14px;
  }

  .calendar-hero__cta,
  .calendar-models__cta {
    width: 100% !important;
    margin-top: 26px;
  }

  .calendar-section {
    padding: 54px 0 58px;
  }

  .calendar-section__title,
  .calendar-process__title,
  .calendar-why__title,
  .calendar-form-section__title {
    font-size: 29px;
    line-height: 1.16;
  }

  .calendar-section__title--wide br {
    display: none;
  }

  .calendar-icon-grid {
    gap: 12px;
    margin-top: 32px;
  }

  .calendar-icon-card {
    min-height: 142px;
    gap: 16px;
    padding: 22px 12px;
  }

  .calendar-icon-card__icon {
    width: 32px;
    height: 32px;
  }

  .calendar-icon-card__title {
    font-size: 15px;
    line-height: 1.2;
  }

  .calendar-promo {
    min-height: 112px;
    padding: 24px 24px;
  }

  .calendar-promo__title {
    font-size: 25px;
  }

  .calendar-promo__text {
    font-size: 14px;
  }

  .calendar-models-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 34px;
  }

  .calendar-models__note {
    margin-top: 28px;
    font-size: 16px;
    text-align: left;
  }

  .calendar-process {
    padding: 56px 0 64px;
  }

  .calendar-process__steps {
    margin-top: 32px;
  }

  .calendar-why {
    padding: 56px 0 60px;
  }

  .calendar-why__grid {
    gap: 28px;
    justify-items: stretch;
  }

  .calendar-why__media {
    display: none;
  }

  .calendar-why__list {
    gap: 13px;
    margin-top: 24px;
  }

  .calendar-why__item {
    font-size: 16px;
  }

  .calendar-form-section {
    padding: 56px 0 64px;
  }

  .calendar-form-section__subtitle {
    font-size: 16px;
  }
}

@media (max-width: 360px) {
  .calendar-hero__title {
    font-size: 32px;
  }

  .calendar-section__title,
  .calendar-process__title,
  .calendar-why__title,
  .calendar-form-section__title {
    font-size: 26px;
  }

  .calendar-cta {
    padding-inline: 18px !important;
    font-size: 13px !important;
  }
}
</style>
