<script setup lang="ts">
import type { Component } from "vue";
import { ref } from "vue";
import {
  Check,
  FileText,
  LayoutGrid,
  MapPin,
  MessagesSquare,
  Monitor,
  Package,
  ShieldCheck,
  Timer,
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

const pageUrl = "https://reprodisseny.com/calendarios/calendarios-corporativos-2027";
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
    icon: Timer,
  },
  {
    title: "Las plataformas online no te asesoran",
    icon: Monitor,
  },
  {
    title: "Resultado genérico para una imagen que no lo es",
    icon: FileText,
  },
  {
    title: "Se te escapa el tiempo con la logística",
    icon: Package,
  },
];

const guarantees: GuaranteeCard[] = [
  {
    title: "Rapidez en las entregas",
    icon: ShieldCheck,
  },
  {
    title: "Desde 1983 en Barcelona",
    icon: MapPin,
  },
  {
    title: "4 Formatos de calendarios",
    icon: LayoutGrid,
  },
  {
    title: "Asesoramiento incluido",
    icon: MessagesSquare,
  },
];

const modelCards = ["sobremesa-triangular", "sobremesa-wire-o", "pared-grapado", "pared-wire-o"]
  .map((modelId) => calendarModels.find((model) => model.id === modelId))
  .filter((model): model is (typeof calendarModels)[number] => Boolean(model))
  .map((model) => ({
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
  robots: "index,follow",
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
      <div class="container-content calendar-container calendar-hero__grid">
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
          <h1 id="calendar-hero-title" class="calendar-hero__title section-title section-title--hero">
            <span>El calendario que</span>
            <span>mostrará tu marca</span>
            <span>los 365 días del año</span>
          </h1>

          <p class="calendar-hero__description text-body">
            Diseño e impresión de calendarios corporativos en Barcelona. Cuatro formatos diferentes, papel de calidad y acabados profesionales.
          </p>

          <p class="calendar-hero__microcopy text-body-s-bold">
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
      <div class="container-content calendar-container">
        <h2 id="calendar-problems-title" class="calendar-section__title calendar-section__title--wide section-title section-title--section">
          Cada año pasa lo mismo:<br />
          llega diciembre y los calendarios se convierten en un problema
        </h2>

        <ul class="calendar-icon-grid calendar-icon-grid--white" role="list">
          <li v-for="item in painPoints" :key="item.title" class="calendar-icon-card">
            <component :is="item.icon" class="calendar-icon-card__icon" aria-hidden="true" />
            <h3 class="calendar-icon-card__title text-h4">{{ item.title }}</h3>
          </li>
        </ul>
      </div>
    </section>

    <section class="calendar-section calendar-section--white" aria-labelledby="calendar-guarantees-title">
      <div class="container-content calendar-container">
        <h2 id="calendar-guarantees-title" class="calendar-section__title section-title section-title--section">
          Calendarios corporativos de calidad y con garantía
        </h2>

        <ul class="calendar-icon-grid calendar-icon-grid--cream" role="list">
          <li v-for="item in guarantees" :key="item.title" class="calendar-icon-card">
            <component :is="item.icon" class="calendar-icon-card__icon" aria-hidden="true" />
            <h3 class="calendar-icon-card__title text-h4">{{ item.title }}</h3>
          </li>
        </ul>
      </div>
    </section>

    <section class="calendar-promo" aria-label="Promoción">
      <p class="calendar-promo__title text-h3">Tu diseño a medida, gratis</p>
      <p class="calendar-promo__text text-body">
        Promoción válida para pedidos realizados hasta el 1 de diciembre.
      </p>
    </section>

    <section class="calendar-section calendar-section--models" aria-labelledby="calendar-models-title">
      <div class="container-content calendar-container">
        <h2 id="calendar-models-title" class="calendar-section__title calendar-section__title--models section-title section-title--section">
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

            <span class="calendar-model-card__title text-h4">{{ model.title }}</span>
            <span class="calendar-model-card__context text-body-s">{{ model.context }}</span>
          </button>
        </div>

        <p class="calendar-models__note text-body">
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
      <div class="container-content calendar-container">
        <h2 id="calendar-process-title" class="calendar-process__title section-title section-title--section">
          Tus calendarios corporativos para el 2027, listos en cinco pasos
        </h2>

        <LandingProcessSteps
          :steps="processSteps"
          variant="calendar"
          class="calendar-process__steps"
        />
      </div>
    </section>

    <section class="calendar-why" aria-labelledby="calendar-why-title">
      <div class="container-content calendar-container calendar-why__grid">
        <div class="calendar-why__media">
          <NuxtImg
            :src="teamImage.src"
            :alt="teamImage.alt"
            :width="teamImage.width"
            :height="teamImage.height"
            sizes="(max-width: 639px) 344px, (max-width: 1023px) 640px, 520px"
            loading="lazy"
            fetchpriority="auto"
            decoding="async"
            class="calendar-why__image"
          />
        </div>

        <div class="calendar-why__content">
          <h2 id="calendar-why-title" class="calendar-why__title section-title section-title--section">
            Por qué nos siguen eligiendo año tras año
          </h2>

          <ul class="calendar-why__list" role="list">
            <li v-for="reason in reasons" :key="reason" class="calendar-why__item text-body-bold">
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
      variant="calendar"
    />

    <LandingFaqs
      :items="faqs"
      title="Preguntas frecuentes"
      :default-open="false"
      variant="calendar"
    />

    <section id="quote-form" class="calendar-form-section" aria-labelledby="calendar-form-title">
      <div class="container-content calendar-container calendar-form-section__inner">
        <div class="calendar-form-section__heading">
          <h2 id="calendar-form-title" class="calendar-form-section__title section-title section-title--section">
            ¿Qué calendario quieres?
          </h2>
          <p class="calendar-form-section__subtitle text-body">
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
  background: hsl(var(--background));
  color: hsl(var(--foreground));
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
  min-width: 0;
}

.calendar-hero {
  background: hsl(var(--background));
  padding: 48px 0 70px;
}

.calendar-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 570px) minmax(0, 590px);
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.calendar-hero__media {
  min-width: 0;
}

.calendar-hero__image {
  display: block;
  width: min(100%, 570px);
  height: auto;
  aspect-ratio: 1667 / 1244;
  object-fit: contain;
}

.calendar-hero__content {
  min-width: 0;
  padding-top: 10px;
}

.calendar-hero__title {
  color: hsl(var(--foreground));
}

.calendar-hero__title span {
  display: block;
}

.calendar-hero__description {
  max-width: 540px;
  margin-top: 26px;
  color: hsl(var(--muted-foreground));
}

.calendar-hero__microcopy {
  margin-top: 22px;
  color: hsl(var(--foreground));
}

.calendar-cta {
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
  background: hsl(var(--brand-base-light));
}

.calendar-section--white {
  background: hsl(var(--background));
}

.calendar-section__title,
.calendar-process__title,
.calendar-why__title,
.calendar-form-section__title {
  color: hsl(var(--foreground));
  text-align: left;
}

.calendar-section__title--wide {
  max-width: none;
  margin-inline: 0;
}

.calendar-icon-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 36px;
}

.calendar-icon-card {
  display: flex;
  min-height: 184px;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  border-radius: 8px;
  padding: 30px 22px;
  text-align: center;
}

.calendar-icon-grid--white .calendar-icon-card {
  background: hsl(var(--background));
}

.calendar-icon-grid--cream .calendar-icon-card {
  background: hsl(var(--brand-bg-2));
}

.calendar-icon-card__icon {
  width: 42px;
  height: 42px;
  color: hsl(var(--primary));
  stroke-width: 1.8;
}

.calendar-icon-card__title {
  color: hsl(var(--foreground));
}

.calendar-promo {
  display: grid;
  min-height: 132px;
  place-items: center;
  gap: 8px;
  background: hsl(var(--brand-base-dark));
  padding: 28px 20px;
  color: #ffffff;
  text-align: center;
}

.calendar-promo__text {
  color: rgb(255 255 255 / 0.84);
}

.calendar-section--models {
  padding-bottom: 72px;
}

.calendar-section__title--models {
  max-width: none;
  margin-inline: 0;
  white-space: nowrap;
}

.calendar-models-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin-top: 36px;
}

.calendar-model-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: hsl(var(--background));
  padding: 14px;
  color: inherit;
  text-align: left;
  box-shadow: 0 12px 30px rgb(0 0 0 / 7%);
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.calendar-model-card:hover,
.calendar-model-card:focus-visible,
.calendar-model-card--selected {
  border-color: hsl(var(--primary));
  box-shadow: 0 16px 36px rgb(0 118 179 / 15%);
  transform: translateY(-2px);
}

.calendar-model-card__media {
  display: block;
  overflow: hidden;
  border-radius: 6px;
  aspect-ratio: 1000 / 747;
  background: hsl(var(--background));
}

.calendar-model-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.calendar-model-card__title {
  display: block;
  color: hsl(var(--foreground));
}

.calendar-model-card__context {
  display: block;
  color: hsl(var(--muted-foreground));
}

.calendar-models__note {
  max-width: 790px;
  margin: 34px auto 0;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.calendar-models__cta {
  display: flex !important;
  width: fit-content !important;
  margin: 28px auto 0;
}

.calendar-process {
  background: hsl(var(--primary));
  padding: 70px 0 78px;
  color: #ffffff;
}

.calendar-process__title {
  max-width: none;
  margin-inline: 0;
  color: #ffffff;
}

.calendar-process__steps {
  margin-top: 28px;
}

.calendar-why {
  background: hsl(var(--background));
  padding: 72px 0 76px;
}

.calendar-why__grid {
  display: grid;
  grid-template-columns: minmax(0, 570px) minmax(0, 570px);
  align-items: center;
  justify-content: space-between;
  gap: 60px;
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
  color: hsl(var(--foreground));
  font-weight: var(--weight-body-bold);
}

.calendar-why__check {
  width: 21px;
  height: 21px;
  color: hsl(var(--primary));
  stroke-width: 2.4;
}

.calendar-form-section {
  scroll-margin-top: 84px;
  padding: 68px 0 78px;
}

.calendar-form-section__inner {
  display: grid;
  gap: 24px;
}

.calendar-form-section__heading {
  text-align: left;
}

.calendar-form-section__subtitle {
  margin-top: 10px;
  color: hsl(var(--muted-foreground));
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

  .calendar-hero__title span {
    display: inline;
  }

  .calendar-hero__description {
    margin-top: 20px;
  }

  .calendar-hero__microcopy {
    margin-top: 18px;
  }

  .calendar-hero__cta,
  .calendar-models__cta {
    width: 100% !important;
    margin-top: 26px;
  }

  .calendar-section {
    padding: 54px 0 58px;
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


  .calendar-promo {
    min-height: 112px;
    padding: 24px 24px;
  }

  .calendar-models-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 34px;
  }

  .calendar-models__note {
    margin-top: 28px;
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
    display: block;
  }

  .calendar-section__title--models {
    white-space: normal;
  }

  .calendar-why__list {
    gap: 13px;
    margin-top: 24px;
  }

  .calendar-form-section {
    padding: 56px 0 64px;
  }

}

</style>
