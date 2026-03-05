<!-- pages/sobre-nosotros.vue -->
<script setup lang="ts">
import ComparisonTable from "@/components/shared/blocks/ComparisonTable.vue"
import EnvironmentSection from "@/components/shared/blocks/EnvironmentSection.vue"
import CompanyTimeline from "@/components/shared/blocks/CompanyTimeline.vue"
import { Building2, Printer, Factory, Palette, Maximize2, Sparkles } from "lucide-vue-next"

import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue"

type TimelineItem = {
  year: string;
  title: string;
  text: string;
  imageAlt: string;
  side: "left" | "right";
};

const timeline = [
  {
    year: 1983,
    title: "Fundación de Repro Disseny",
    text:
      "Inicia sus actividades en un pequeño local de 40 m2 en el barrio de San Gervasio realizando trabajos de copistería e imprenta rápida.\n\nEn 1986 nuestra actividad dio un vuelco con la llegada de los ordenadores Macintosh y los programas de autoedición: lo que antes tardábamos semanas, lo hacíamos en días.",
    icon: Building2,
  },
  {
    year: 1993,
    title: "Adquisición 1ª prensa digital en b/n",
    text:
      "Con la puesta en marcha de la Xerox Docutec iniciamos el cambio de analógico a digital. Empieza la revolución en nuestro sector.\n\nEn 1996 estrenamos nuestra primera web.",
    icon: Printer,
  },
  {
    year: 1999,
    title: "Inauguración del Centro de Producción Juan de Mena",
    text:
      "Este hito supone un cambio radical en nuestra forma de trabajar. Situado cerca del Hospital de la Vall d’Hebrón y a pocos metros de la Ronda de Dalt, sus más de 1.000 m2 nos han permitido disfrutar de unas instalaciones preparadas para asumir grandes proyectos con rapidez y eficacia.",
    icon: Factory,
  },
  {
    year: 2006,
    title: "Llega la 1ª prensa digital en color",
    text:
      "Somos pioneros incorporando iGen 3, la primera prensa digital en color preparada para altos volúmenes de trabajo.\n\nSu entrada supone la consolidación de nuestra apuesta digital, que se irá ampliando en los años siguientes. Somos los primeros del sector en implantar la plataforma Direct Smile, un software especializado en personalización y comunicación multicanal.",
    icon: Palette,
  },
  {
    year: 2017,
    title: "Nuestra apuesta por el gran formato",
    text:
      "Hemos ampliado nuestra capacidad de producción con la incorporación de dos nuevas prensas en color, iGen 150 e iGen 5.\n\nAdemás, adquirimos una mesa de corte digital Kongsberg que, combinada con los plotters látex HP y el apoyo de nuestro equipo de montadores, nos permite reforzar nuestra presencia en este mercado en crecimiento y afrontar proyectos de gran envergadura.",
    icon: Maximize2,
  },
  {
    year: 2024,
    title: "Consolidando 40 años de trayectoria",
    text:
      "Mejoramos nuestra oferta comercial con la incorporación de una impresora de gran formato HP R1000, que nos permite imprimir sobre una amplia variedad de materiales rígidos.\n\nActualmente, trabajamos con los principales proveedores de maquinaria del sector: Ricoh, Canon, HP, Kongsberg, ESKO, Horizon y Heidelberg, y estamos posicionados como una de las mejores imprentas digitales de Barcelona.\n\nEn el sector empieza una segunda revolución con el uso de la inteligencia artificial.",
    icon: Sparkles,
  },
]

const compareHead = [
  "Impremtes online",
  "Impremtes tradicionals",
  "Repro Disseny",
] as const;
const compareRows = [
  {
    label: "Preus baixos en productes estandarditzats",
    online: true,
    traditional: false,
    repro: true,
  },
  {
    label: "Flexibilitat i llibertat a l’hora de fer la comanda",
    online: true,
    traditional: false,
    repro: true,
  },
  { label: "Qualitat del producte", online: false, traditional: true, repro: true },
  { label: "Experiència i assessorament", online: false, traditional: true, repro: true },
  {
    label: "Gestió del color + control individual del treball",
    online: false,
    traditional: false,
    repro: true,
  },
  {
    label: "Forma de pagament personalitzada",
    online: false,
    traditional: false,
    repro: true,
  },
  {
    label: "Enviaments i distribució segons necessitats",
    online: true,
    traditional: false,
    repro: true,
  },
  {
    label: "Seguretat i comoditat a l’hora de fer la comanda",
    online: true,
    traditional: true,
    repro: true,
  },
];

const values = [
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
  "Lorem ipsum",
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

    <!-- VIDEO -->
    <section class="w-full bg-[#004F78]">
      <div
        class="mx-auto max-w-[1200px] px-6 xl:px-0 py-16 flex flex-col items-center gap-8"
      >
        <h2
          class="w-full text-center font-['Figtree'] font-semibold text-[30px] leading-[36px] text-white"
        >
          Algunos datos sobre nosotros
        </h2>

        <!-- ratio similar a 746x416 -->
        <div class="w-full max-w-[746px] rounded-[12px] overflow-hidden bg-[#D9D9D9]">
          <div class="aspect-[746/416] w-full" />
          <!-- Sustituye esto por:
               - <NuxtImg .../>
               - o <iframe .../>
          -->
        </div>
      </div>
    </section>

    <!-- LO QUE NOS DIFERENCIA -->
<section class="mx-auto max-w-[1200px] px-6 xl:px-0 py-20">
  <div class="flex flex-col gap-10">
    <div class="flex flex-col gap-6">
      <h2 class="font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#1E1E1E]">
        El que ens diferencia
      </h2>
      <p class="font-['Inter'] font-normal text-[18px] leading-[22px] text-[#1E1E1E]">
        Lorem ipsum dolor sit amet consectetur. Et adipiscing ac nunc consectetur
        integer eu lorem. In euismod urna tempor nunc augue sed. Dictum bibendum
        tincidunt et curabitur egestas. Commodo potenti viverra convallis lacus at
        nisi.
      </p>
    </div>

    <ComparisonTable :head="compareHead" :rows="compareRows" />
  </div>
</section>
    <!-- VALORES -->
    <section class="mx-auto max-w-[1200px] px-6 xl:px-0 pb-24">
      <h2
        class="font-['Figtree'] font-semibold text-[30px] leading-[36px] text-[#1E1E1E]"
      >
        Els nostres valors
      </h2>

      <div class="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
        <div v-for="(v, i) in values" :key="i" class="flex flex-col items-center gap-6">
          <div class="h-[97px] w-[97px] rounded-full border border-[#3F3F3F]" />
          <div
            class="text-center font-['Inter'] font-bold text-[18px] leading-[22px] text-[#1E1E1E]"
          >
            {{ v }}
          </div>
        </div>
      </div>
    </section>

    <!-- CLIENTES -->
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
  title="Comprometidos con el mediao ambiente"
  background-src="/img/ui/bggreen_1920.webp"
  :items="[
    'Reciclamos los productos químicos',
    'Reutilizamos la energía reactiva.',
    'Utilizamos tintas de látex que son inocuas para el medio ambiente.',
    'Optimizamos el consumo de papel.',
    'Utiliamos papeles con cerfificados FSC y PEFC.',
    'Ofrecemos la posibilidad de imprimir sobre papeles reciclados.',
  ]"
/>
  </main>
</template>
