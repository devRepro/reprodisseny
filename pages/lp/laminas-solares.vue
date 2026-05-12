<script setup lang="ts">
import type { Component } from "vue";
import { BadgeCheck, Factory, Wrench } from "lucide-vue-next";

import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import LandingFaqs from "@/components/marketing/landing/LandingFaqs.vue";
import LandingHeroCard from "@/components/marketing/landing/LandingHeroCard.vue";
import LandingImageCards from "@/components/marketing/landing/LandingImageCards.vue";
import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue";
import LandingPainPoints from "@/components/marketing/landing/LandingPainPoints.vue";
import LandingProcessSteps from "@/components/marketing/landing/LandingProcessSteps.vue";
import LandingSplitFeature from "@/components/marketing/landing/LandingSplitFeature.vue";
import LandingStatsGrid from "@/components/marketing/landing/LandingStatsGrid.vue";
import SolarQuoteForm from "@/components/marketing/landing/SolarQuoteForm.vue";

definePageMeta({
  layout: "landing",
});

useSeoMeta({
  title: "Láminas solares para cristales en Barcelona · Repro Disseny",
  description:
    "Instalación de láminas de protección solar para ventanas en oficinas, comercios, hoteles y viviendas de Barcelona. Reduce calor, reflejos y radiación UV sin obras.",
  ogTitle: "Láminas de protección solar en Barcelona",
  ogDescription:
    "Protege tus espacios del calor y los reflejos con instalación profesional de láminas solares para cristales.",
  robots: "index, follow",
});

type IconItem = {
  title: string;
  description: string;
  icon: Component;
};

type LandingPainPoint = {
  title: string;
  description: string;
  icon: "heat" | "screen" | "furniture" | "energy";
};

type StatItem = {
  value: string;
  label: string;
  note?: string;
};

type ProjectItem = {
  title: string;
  context?: string;
  imageSrc: string;
  imageAlt: string;
};

type StepItem = {
  number: string;
  title: string;
  description: string;
};

type LogoItem = {
  label: string;
  src?: string;
  alt?: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const config = useRuntimeConfig();

const mediaBaseUrl = String(
  config.public.mediaBaseUrl || "https://webcms.blob.core.windows.net/media"
).replace(/\/+$/, "");

function media(path: string) {
  const cleanPath = path.replace(/^\/+/, "").replace(/^media\//, "");
  return `${mediaBaseUrl}/${cleanPath}`;
}

const heroImage = {
  src: media("landing/laminas-solares/hero.webp"),
  alt: "Oficina luminosa con cristales protegidos mediante láminas solares",
};

const installationImage = {
  src: media("landing/laminas-solares/muntador.webp"),
  alt: "Instalación profesional de lámina solar sobre cristal",
};

const problems: LandingPainPoint[] = [
  {
    title: "Calor excesivo",
    description:
      "Salas y despachos que no se pueden usar sin el aire acondicionado al máximo",
    icon: "heat",
  },
  {
    title: "Reflejos en pantallas",
    description:
      "Reuniones y trabajo diario interrumpidos por deslumbramientos constantes",
    icon: "screen",
  },
  {
    title: "Decoloración del mobiliario",
    description:
      "Los rayos UV deterioran pavimentos, tapicerías y mobiliario de forma silenciosa.",
    icon: "furniture",
  },
  {
    title: "Factura energética elevada",
    description:
      "El aire acondicionado consume lo que unas láminas podrían evitar colocadas en el cristal",
    icon: "energy",
  },
];

const stats: StatItem[] = [
  {
    value: "Hasta un 80% de",
    label: "energía solar rechazada",
  },
  {
    value: "99% de",
    label: "bloqueo UV",
  },
  {
    value: "Instalación",
    label: "en 1 día",
  },
  {
    value: "Sin obras",
    label: "ni residuos",
  },
];

const projects: ProjectItem[] = [
  {
    title: "Salón de banquetes",
    imageSrc: media("landing/laminas-solares/puertas_ventanas.webp"),
    imageAlt:
      "Salón de banquetes con cristales protegidos mediante láminas solares",
  },
  {
    title: "Edificio corporativo",
    imageSrc: media("landing/laminas-solares/edifici.webp"),
    imageAlt: "Edificio corporativo con protección solar en cristales",
  },
  {
    title: "Aulas de formación",
    imageSrc: media("landing/laminas-solares/sala_reunions.webp"),
    imageAlt: "Aulas de formación con menor calor y reflejos",
  },
];

const steps: StepItem[] = [
  {
    number: "01",
    title: "Consulta técnica",
    description:
      "Tomamos medidas y valoramos el tipo de cristal, orientación y uso del espacio.",
  },
  {
    number: "02",
    title: "Producción",
    description:
      "Preparamos el material adecuado para tu caso y cerramos fecha de instalación.",
  },
  {
    number: "03",
    title: "Instalación",
    description:
      "Nuestro equipo instala la lámina de forma limpia y profesional.",
  },
];

const reasons: IconItem[] = [
  {
    title: "Producción propia",
    description:
      "Preparamos las láminas en nuestro taller y gestionamos el proyecto desde el primer contacto.",
    icon: Factory,
  },
  {
    title: "Asesoramiento técnico",
    description:
      "Te orientamos según el tipo de cristal, la orientación del espacio y el resultado que necesitas.",
    icon: Wrench,
  },
  {
    title: "Garantía profesional",
    description:
      "Instalación realizada por equipo propio, con materiales adecuados para uso profesional.",
    icon: BadgeCheck,
  },
];

const clientLogos = [
  { src: "/img/customers/vallhebron.svg", alt: "Vall d'Hebron" },
  { src: "/img/customers/fcf.svg", alt: "Federació Catalana" },
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

const faqs: FaqItem[] = [
  {
    question: "¿Se nota el cambio de color en el cristal?",
    answer:
      "Depende del tipo de lámina. Las neutras son prácticamente invisibles. Las de mayor rechazo solar tienen un tono ligeramente más oscuro.",
  },
  {
    question: "¿Cuánto dura la instalación?",
    answer:
      "La mayoría de las instalaciones se completan en un día. Espacios grandes pueden requerir más tiempo en función de las dimensiones y grado de dificultad.",
  },
  {
    question: "¿Qué vida útil tiene la lámina?",
    answer:
      "Entre 10 y 15 años según el tipo de film y la exposición solar.",
  },
  {
    question: "¿Se puede quitar si cambio de opinión?",
    answer:
      "Sí. La lámina se retira sin dañar el cristal.",
  },
  {
    question: "¿Sirve para cualquier tipo de vidrio?",
    answer:
      "Todos los cristales admiten una instalación por la cara exterior, sin embargo, no todos los cristales son aptos para aplicar una lámina desde el interior. Nuestro equipo técnico realizará una inspección y valorará cada caso aconsejando la mejor solución.",
  },
  {
    question: "¿Venís a domicilios particulares o solo empresas?",
    answer:
      "Instalamos tanto en oficinas y comercios como en viviendas particulares.",
  },
];

function scrollToQuote() {
  if (!import.meta.client) return;

  document.querySelector("#quote-form")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
</script>

<template>
  <main class="landing-solar-page bg-background text-foreground">
    <LandingHeroCard
      :title="`Láminas de protección\nsolar en Barcelona`"
      :description="`Instalamos láminas de protección solar para ventanas,\nen oficinas, comercios, hoteles y viviendas.\nPreparación propia e instalación profesional.`"
      :image-src="heroImage.src"
      :image-alt="heroImage.alt"
      @primary="scrollToQuote"
    />

    <LandingPainPoints :items="problems" />

    <section class="landing-benefits" aria-labelledby="landing-benefits-title">
      <div class="landing-benefits__inner">
        <h2 id="landing-benefits-title" class="landing-benefits__title">
          Láminas de control solar:<br />
          confort inmediato, instalación en un día
        </h2>

        <p class="landing-benefits__description">
          Las láminas de protección solar se aplican directamente sobre el cristal,
          reduciendo el calor, los reflejos y la radiación UV sin alterar la estética
          del edificio y sin la necesidad de hacer obras.
        </p>

        <LandingStatsGrid :items="stats" class="landing-benefits__stats" />
      </div>
    </section>

    <section class="landing-cases" aria-labelledby="landing-cases-title">
      <div class="landing-cases__inner">
        <h2 id="landing-cases-title" class="landing-cases__title">
          Espacios que ya disfrutan de más confort
        </h2>

        <LandingImageCards :items="projects" class="landing-cases__cards" />
      </div>
    </section>

    <section class="landing-process" aria-labelledby="landing-process-title">
  <div class="container-content">
    <ContentSectionIntro
      title="De la primera consulta a la instalación, en tres pasos"
      centered
      :line="false"
      class="mx-auto"
      title-class="text-white"
    />

    <LandingProcessSteps :steps="steps" class="mt-9" />
  </div>
</section>

<section class="landing-why" aria-labelledby="landing-why-title">
  <div class="container-content">
    <LandingSplitFeature
      :image-src="installationImage.src"
      :image-alt="installationImage.alt"
      title="¿Por qué Repro Disseny?"
      intro="Más de 40 años aportando soluciones gráficas para empresas, comercios y comunicación visual."
      :features="reasons"
    />
  </div>
</section>

    <ClientLogosBand :logos="clientLogos" />

    <LandingFaqs :items="faqs" />

    <section
      id="quote-form"
      class="scroll-mt-24 bg-[hsl(var(--brand-base-light))] py-12 md:py-16"
    >
      <div class="container-content">
        <ContentSectionIntro
          title="¿Quieres saber cuánto costaría proteger tu espacio del calor excesivo y los reflejos molestos?"
          description="Explícanos tu proyecto y te enviaremos un presupuesto en menos de 24 h laborales."
          centered
          :line="false"
          class="mx-auto"
          title-class="max-w-3xl text-[clamp(1.35rem,2.1vw,2rem)]"
          description-class="text-foreground/70"
        />

        <div class="mt-7">
          <SolarQuoteForm />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing-benefits {
  min-height: 530px;
  padding: 92px 0 72px;
  background:
    linear-gradient(
      180deg,
      #cfeaf4 0%,
      hsl(var(--brand-base-light)) 58%,
      #ffffff 100%
    );
}

.landing-benefits__inner {
  width: min(100% - 40px, 1120px);
  margin-inline: auto;
  text-align: center;
}

.landing-benefits__title {
  margin: 0;
  color: hsl(var(--brand-ink-dark));
  font-family: var(--font-sans);
  font-size: clamp(30px, 3vw, 44px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: -0.02em;
}

.landing-benefits__description {
  max-width: 930px;
  margin: 46px auto 0;
  color: hsl(var(--brand-ink-dark));
  font-family: var(--font-sans);
  font-size: clamp(17px, 1.45vw, 23px);
  font-weight: 400;
  line-height: 1.35;
}

.landing-benefits__stats {
  margin-top: 82px;
}
.landing-cases {
  background: #ffffff;
  padding: 74px 0 104px;
}

.landing-cases__inner {
  width: min(100% - 40px, 1120px);
  margin-inline: auto;
  text-align: center;
}

.landing-cases__title {
  margin: 0;
  color: hsl(var(--brand-ink-dark));
  font-family: var(--font-sans);
  font-size: clamp(30px, 3vw, 42px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: -0.02em;
}

.landing-cases__cards {
  margin-top: 68px;
}

.landing-process {
  background: hsl(var(--brand-base-dark));
  color: #ffffff;
  padding: 72px 0 84px;
}

.landing-why {
  background: #e7eef2;
  color: hsl(var(--brand-ink-dark));
  padding: 0;
}

.landing-why :deep(.landing-split-feature) {
  background: transparent !important;
  color: hsl(var(--brand-ink-dark)) !important;
  box-shadow: none !important;
}

.landing-why :deep(.landing-split-feature__inner) {
  background: transparent !important;
  color: inherit !important;
  padding-top: 48px !important;
  padding-bottom: 48px !important;
}

.landing-why :deep(.landing-split-feature__content),
.landing-why :deep(.landing-split-feature__title),
.landing-why :deep(.landing-split-feature__intro),
.landing-why :deep(.landing-split-feature__feature),
.landing-why :deep(.landing-split-feature__feature-title),
.landing-why :deep(.landing-split-feature__feature-description) {
  color: hsl(var(--brand-ink-dark)) !important;
}

@media (max-width: 767px) {
  .landing-benefits {
    min-height: auto;
    padding: 64px 0 56px;
  }

  .landing-benefits__description {
    margin-top: 26px;
  }

  .landing-benefits__stats {
    margin-top: 42px;
  }

  .landing-cases {
    padding: 58px 0 76px;
  }

  .landing-cases__cards {
    margin-top: 38px;
  }

  .landing-process {
    padding: 56px 0 64px;
  }

  .landing-why :deep(.landing-split-feature__inner) {
    padding-top: 42px !important;
    padding-bottom: 42px !important;
  }
}
</style>