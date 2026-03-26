<!-- pages/sobre-nosotros.vue -->
<script setup lang="ts">
import ComparisonTable from "@/components/shared/blocks/ComparisonTable.vue";
import EnvironmentSection from "@/components/shared/blocks/EnvironmentSection.vue";
import CompanyTimeline from "@/components/shared/blocks/CompanyTimeline.vue";
import CompanyValuesSection from "@/components/shared/CompanyValuesSection.vue";
import {
  Building2,
  Printer,
  Factory,
  Palette,
  Maximize2,
  Sparkles,
  BadgeCheck,
  Handshake,
  Leaf,
  MessagesSquare,
  TimerReset,
} from "lucide-vue-next";

import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue";

type TimelineItem = {
  year: number | string;
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
  side: "left" | "right";
  icon?: any;
};

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
</script>

<template>
  <main class="bg-white text-[#1E1E1E]">
    <section class="w-full bg-[#DEF4FF]">
      <div class="mx-auto max-w-[1200px] px-6 xl:px-0 py-[50px]">
        <h1
          class="text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#004F78]"
        >
          Toda una vida imprimiendo
        </h1>
      </div>
    </section>

    <section class="container">
      <CompanyTimeline :items="timeline" />
    </section>

    <!-- IMAGEN / VIDEO CORPORATIVO -->
    <section class="w-full bg-[#004F78]">
      <div
        class="mx-auto max-w-[1200px] px-6 xl:px-0 py-16 flex flex-col items-center gap-8"
      >
        <h2
          class="w-full text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-white"
        >
          Algunos datos sobre nosotros
        </h2>

        <div
          class="w-full max-w-[746px] rounded-[12px] overflow-hidden bg-[#D9D9D9] shadow-sm"
        >
          <NuxtImg
            src="/img/ui/reprodisseny/sobre-nosotros-datos.webp"
            alt="Instalaciones y equipo de Repro Disseny"
            width="746"
            height="416"
            class="block h-auto w-full object-cover"
            sizes="sm:100vw md:746px"
            format="webp"
            loading="lazy"
          />
        </div>

        <!--
        Si luego quieres sustituir esta imagen por un vídeo, cambia este bloque por un iframe.
        -->
      </div>
    </section>

    <!-- LO QUE NOS DIFERENCIA -->
    <section class="mx-auto max-w-[1200px] px-6 xl:px-0 py-20">
      <div class="flex flex-col gap-10">
        <div class="flex flex-col gap-6">
          <h2
            class="font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#1E1E1E]"
          >
            Lo que nos diferencia
          </h2>
        </div>

        <ComparisonTable :head="compareHead" :rows="compareRows" />
      </div>
    </section>

    <CompanyValuesSection
      eyebrow="Nuestra forma de trabajar"
      title="Nuestros valores"
      intro="Más que un proveedor, queremos ser un partner fiable para proyectos de comunicación visual, impresión y exposición."
      :items="companyValues"
    />

    <ClientLogosBand
      :logos="[
        { src: '/img/customers/vallhebron.svg', alt: `Vall d'Hebron` },
        { src: '/img/customers/fcf.svg', alt: 'Federació Catalana' },
        { src: '/img/customers/adevinta.svg', alt: 'Adevinta' },
        { src: '/img/customers/hitachi.svg', alt: 'Hitachi' },
        { src: '/img/customers/tuv.svg', alt: 'TÜV Rheinland' },
        { src: '/img/customers/vueling.svg', alt: 'Vueling' },
        { src: '/img/customers/cromology.svg', alt: 'Cromology' },
        { src: '/img/customers/who.svg', alt: 'World Health Organization' },
        { src: '/img/customers/uab.svg', alt: 'UAB' },
        { src: '/img/customers/alcon.svg', alt: 'Alcon' },
        { src: '/img/customers/renault.svg', alt: 'Renault' },
        { src: '/img/customers/green-vita.svg', alt: 'Green Vita' },
      ]"
    />

    <EnvironmentSection
      title="Comprometidos con el medio ambiente"
      background-src="/img/ui/bggreen_1920.webp"
      :items="[
        'Reciclamos los productos químicos.',
        'Reutilizamos la energía reactiva.',
        'Utilizamos tintas de látex inocuas para el medio ambiente.',
        'Optimizamos el consumo de papel.',
        'Utilizamos papeles con certificados FSC y PEFC.',
        'Ofrecemos la posibilidad de imprimir sobre papeles reciclados.',
      ]"
    />
  </main>
</template>