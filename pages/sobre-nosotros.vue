<!-- pages/sobre-nosotros.vue -->
<script setup lang="ts">
import ComparisonTable from "@/components/shared/blocks/ComparisonTable.vue";
import EnvironmentSection from "@/components/shared/blocks/EnvironmentSection.vue";
import CompanyValuesSection from "@/components/shared/CompanyValuesSection.vue";
import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue";
import HeaderPage from "@/components/shared/hero/HeaderPage.vue";
import {
  Sparkles,
  BadgeCheck,
  Handshake,
  Leaf,
  MessagesSquare,
  TimerReset,
} from "lucide-vue-next";

type TimelineItem = {
  year: number | string;
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
  side: "left" | "right";
};

const pageContainerClass = "container-content";
const pageSectionClass = "py-12 md:py-16 lg:py-20";

const timelineNumberClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-accent text-sm font-semibold text-primary shadow-[0_10px_28px_-24px_hsl(var(--primary)/0.75)]";

const timelineYearClass =
  "inline-flex shrink-0 items-center rounded-full border border-primary bg-primary px-3.5 py-1.5 text-body-s-bold text-primary-foreground shadow-[0_10px_24px_-18px_hsl(var(--primary)/0.65)]";
const timeline: TimelineItem[] = [
  {
    year: 1983,
    title: "Fundación de Repro Disseny",
    text:
      "Inicia sus actividades en un pequeño local de 40 m2 en el barrio de San Gervasio realizando trabajos de copistería e imprenta rápida.\n\nEn 1986 nuestra actividad dio un vuelco con la llegada de los ordenadores Macintosh y los programas de autoedición: lo que antes tardábamos semanas, lo hacíamos en días.",
    imageSrc: "/img/ui/reprodisseny/primer_local.webp",
    imageAlt: "Fundación de Repro Disseny en sus inicios",
    side: "left",
  },
  {
    year: 1993,
    title: "Adquisición de la primera prensa digital en blanco y negro",
    text:
      "Con la puesta en marcha de la Xerox Docutec iniciamos el cambio de analógico a digital. Empieza la revolución en nuestro sector.\n\nEn 1996 estrenamos nuestra primera web.",
    imageSrc: "/img/ui/reprodisseny/xerox_docutech.webp",
    imageAlt: "Primera prensa digital en blanco y negro",
    side: "right",
  },
  {
    year: 1999,
    title: "Inauguración del Centro de Producción Juan de Mena",
    text:
      "Este hito supone un cambio radical en nuestra forma de trabajar. Situado cerca del Hospital de la Vall d’Hebron y a pocos metros de la Ronda de Dalt, sus más de 1.000 m2 nos han permitido disfrutar de unas instalaciones preparadas para asumir grandes proyectos con rapidez y eficacia.",
    imageSrc: "/img/ui/reprodisseny/juan_de_mena.webp",
    imageAlt: "Centro de Producción Juan de Mena",
    side: "left",
  },
  {
    year: 2006,
    title: "Llega la primera prensa digital en color",
    text:
      "Somos pioneros incorporando iGen 3, la primera prensa digital en color preparada para altos volúmenes de trabajo.\n\nSu entrada supone la consolidación de nuestra apuesta digital, que se irá ampliando en los años siguientes. Somos los primeros del sector en implantar la plataforma Direct Smile, un software especializado en personalización y comunicación multicanal.",
    imageSrc: "/img/ui/reprodisseny/igen.webp",
    imageAlt: "Primera prensa digital en color",
    side: "right",
  },
  {
    year: 2017,
    title: "Nuestra apuesta por el gran formato",
    text:
      "Hemos ampliado nuestra capacidad de producción con la incorporación de dos nuevas prensas en color, iGen 150 e iGen 5.\n\nAdemás, adquirimos una mesa de corte digital Kongsberg que, combinada con los plotters látex HP y el apoyo de nuestro equipo de montadores, nos permite reforzar nuestra presencia en este mercado en crecimiento y afrontar proyectos de gran envergadura.",
    imageSrc: "/img/ui/reprodisseny/esko.webp",
    imageAlt: "Apuesta de Repro Disseny por el gran formato",
    side: "left",
  },
  {
    year: 2024,
    title: "Consolidando 40 años de trayectoria",
    text:
      "Mejoramos nuestra oferta comercial con la incorporación de una impresora de gran formato HP R1000, que nos permite imprimir sobre una amplia variedad de materiales rígidos.\n\nActualmente, trabajamos con los principales proveedores de maquinaria del sector: Ricoh, Canon, HP, Kongsberg, ESKO, Horizon y Heidelberg, y estamos posicionados como una de las mejores imprentas digitales de Barcelona.\n\nEn el sector empieza una segunda revolución con el uso de la inteligencia artificial.",
    imageSrc: "/img/ui/reprodisseny/plantilla.webp",
    imageAlt: "Repro Disseny consolidando 40 años de trayectoria",
    side: "right",
  },
];

const compareHead = [
  "Imprentas online",
  "Imprentas tradicionales",
  "Repro Disseny",
] as const;

const compareRows = [
  {
    label: "Precios bajos en productos estandarizados",
    online: true,
    traditional: false,
    repro: true,
  },
  {
    label: "Flexibilidad y libertad a la hora de hacer el pedido",
    online: true,
    traditional: false,
    repro: true,
  },
  {
    label: "Calidad del producto",
    online: false,
    traditional: true,
    repro: true,
  },
  {
    label: "Experiencia y asesoramiento",
    online: false,
    traditional: true,
    repro: true,
  },
  {
    label: "Gestión del color y control individual del trabajo",
    online: false,
    traditional: false,
    repro: true,
  },
  {
    label: "Forma de pago personalizada",
    online: false,
    traditional: false,
    repro: true,
  },
  {
    label: "Envíos y distribución según necesidades",
    online: true,
    traditional: false,
    repro: true,
  },
  {
    label: "Seguridad y comodidad al hacer el pedido",
    online: true,
    traditional: true,
    repro: true,
  },
];

const companyValues = [
  {
    title: "Cercanía",
    description:
      "Trabajamos con una atención cercana y clara, entendiendo cada proyecto y cada necesidad desde el primer contacto.",
    proof: "Acompañamiento comercial y técnico durante todo el proceso.",
    icon: Handshake,
  },
  {
    title: "Calidad",
    description:
      "Cuidamos el detalle en materiales, impresión y acabados para que cada solución transmita una imagen sólida y profesional.",
    proof: "Control de acabados y validación antes de producción.",
    icon: BadgeCheck,
  },
  {
    title: "Agilidad",
    description:
      "Nos movemos con rapidez y capacidad de respuesta, adaptándonos a los plazos y a las necesidades reales de cada cliente.",
    proof: "Respuestas ágiles y producción orientada a plazos reales.",
    icon: TimerReset,
  },
  {
    title: "Soluciones a medida",
    description:
      "No trabajamos con fórmulas cerradas. Proponemos opciones personalizadas según espacio, objetivo y presupuesto.",
    proof: "Cada proyecto se plantea según uso, contexto y visibilidad.",
    icon: Sparkles,
  },
  {
    title: "Comunicación clara",
    description:
      "Explicamos cada paso de forma sencilla, con propuestas concretas y una relación transparente en todo momento.",
    proof: "Información clara antes, durante y después de cada encargo.",
    icon: MessagesSquare,
  },
  {
    title: "Compromiso sostenible",
    description:
      "Buscamos soluciones responsables, optimizando materiales y procesos siempre que sea viable dentro de cada proyecto.",
    proof: "Elección de materiales y procesos con criterio de eficiencia.",
    icon: Leaf,
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

const environmentItems = [
  "Reciclamos los productos químicos.",
  "Reutilizamos la energía reactiva.",
  "Utilizamos tintas de látex inocuas para el medio ambiente.",
  "Optimizamos el consumo de papel.",
  "Utilizamos papeles con certificados FSC y PEFC.",
  "Ofrecemos la posibilidad de imprimir sobre papeles reciclados.",
];

function paragraphs(value: string) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

useSeoMeta({
  title: "Sobre nosotros | Reprodisseny",
  description:
    "Más de 40 años evolucionando en la comunicación gráfica, la impresión digital, el gran formato y los proyectos personalizados en Barcelona.",
});
</script>

<template>
  <main class="bg-background text-foreground">
    <HeaderPage
      eyebrow="Nuestra historia"
      title="Más de 40 años evolucionando en la comunicación gráfica"
      description="Desde nuestros inicios en Barcelona hasta la consolidación de un centro de producción preparado para impresión digital, gran formato y proyectos personalizados."
      image-src="/img/ui/reprodisseny/juan_de_mena.webp"
      image-alt="Instalaciones de Repro Disseny en Barcelona"
    />

    <section
      class="pt-8 pb-10 md:pt-10 md:pb-12 lg:pt-12 lg:pb-16"
      aria-label="Cronología de Repro Disseny"
    >
      <div :class="pageContainerClass">
        <div class="space-y-8 md:space-y-10 lg:space-y-12">
          <article
            v-for="(item, index) in timeline"
            :key="`${item.year}-${item.title}`"
            class="grid gap-6 md:grid-cols-2 md:items-center md:gap-10"
          >
            <div
              class="hidden md:block"
              :class="item.side === 'left' ? 'md:order-1' : 'md:order-2'"
            >
              <div
                class="overflow-hidden rounded-[28px] border border-border/70 bg-card p-2 shadow-[0_18px_50px_-40px_hsl(var(--foreground)/0.22)]"
              >
                <img
                  :src="item.imageSrc"
                  :alt="item.imageAlt"
                  width="640"
                  height="420"
                  class="aspect-[16/11] w-full rounded-[22px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div :class="item.side === 'left' ? 'md:order-2' : 'md:order-1'">
              <div
                class="rounded-[28px] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-44px_hsl(var(--foreground)/0.24)] transition-colors duration-300 hover:border-primary/25 md:p-7 lg:p-8"
              >
                <div
                  class="mb-5 overflow-hidden rounded-2xl border border-border/70 bg-muted/30 md:hidden"
                >
                  <img
                    :src="item.imageSrc"
                    :alt="item.imageAlt"
                    width="640"
                    height="420"
                    class="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <header
                  class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div class="flex min-w-0 items-start gap-4">
                    <span :class="timelineNumberClass" aria-label="Número de hito">
                      {{ String(index + 1).padStart(2, "0") }}
                    </span>

                    <h2
                      class="pt-0.5 text-2xl font-semibold leading-tight tracking-[-0.015em] text-foreground"
                    >
                      {{ item.title }}
                    </h2>
                  </div>

                  <time :datetime="String(item.year)" :class="timelineYearClass">
                    {{ item.year }}
                  </time>
                </header>

                <div class="mt-5 space-y-4 text-base leading-7 text-foreground/72">
                  <p
                    v-for="paragraph in paragraphs(item.text)"
                    :key="paragraph"
                    class="mb-0"
                  >
                    {{ paragraph }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="py-10 md:py-12 lg:py-16">
      <div :class="pageContainerClass">
        <div class="flex flex-col gap-8 md:gap-10">
          <div class="max-w-3xl">
            <p class="mb-0 text-body-s-bold uppercase tracking-[0.18em] text-brand-base">
              Diferencial
            </p>

            <h2
              class="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground md:text-4xl"
            >
              Lo que nos diferencia
            </h2>

            <p
              class="mb-0 mt-4 text-base leading-7 text-foreground/75 md:text-lg md:leading-8"
            >
              Combinamos la agilidad del entorno digital con el acompañamiento, el control
              de calidad y la capacidad técnica de un equipo con experiencia.
            </p>
          </div>

          <ComparisonTable :head="compareHead" :rows="compareRows" />
        </div>
      </div>
    </section>

    <CompanyValuesSection
      eyebrow="Nuestra forma de trabajar"
      title="Nuestros valores"
      intro="Más que un proveedor, queremos ser un partner fiable para proyectos de comunicación visual, impresión y exposición."
      :items="companyValues"
    />

    <ClientLogosBand
      title="Clientes que confían en nosotros"
      intro="Trabajamos con empresas, instituciones y organizaciones que necesitan un partner fiable para proyectos de impresión, comunicación visual y producción gráfica."
      :logos="clientLogos"
    />

    <EnvironmentSection
      title="Comprometidos con el medio ambiente"
      background-src="/img/ui/bggreen_1920.webp"
      :items="environmentItems"
    />
  </main>
</template>
