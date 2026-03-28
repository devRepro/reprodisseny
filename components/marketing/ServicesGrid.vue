<script setup lang="ts">
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";

type Service = {
  title: string;
  description: string;
  iconSrc: string;
};

const services: Service[] = [
  {
    title: "Diseño gráfico",
    description:
      "Si tienes una idea, pero no sabes por dónde empezar, ya sea una simple maquetación, una adaptación de un material existente o tan sólo revisar la preimpresión, nuestros diseñadores te ayudarán encantados.",
    iconSrc: "/img/icons/disseny.svg",
  },
  {
    title: "Impresión en pequeño y gran formato",
    description:
      "Utilizamos distintas técnicas, desde la impresión digital que permite la personalización de documentos a partir de BBDD hasta la impresión offset indicada para grandes tiradas y la impresión látex para soportes de grandes dimensiones.",
    iconSrc: "/img/icons/impressio.svg",
  },
  {
    title: "Acabados premium",
    description:
      "Producimos materiales de alta calidad gracias a acabados especiales como laminado soft touch, barniz selectivo, stamping, troquelados, relieves en seco, encuadernación con tapa dura, contracolados y muchos más.",
    iconSrc: "/img/icons/premium.svg",
  },
  {
    title: "Corte digital a la forma",
    description:
      "Disponemos de una mesa de corte digital Kongsberg con la que cortamos o fresamos a la forma con gran precisión, desde sólo una unidad, infinidad de materiales, vinilos, forex, nido de abeja, cartón pluma, etc.",
    iconSrc: "/img/icons/tall.svg",
  },
  {
    title: "Rotulación y montaje de vinilos",
    description:
      "Instalamos de forma profesional todo tipo de trabajos de rotulación y comunicación visual para oficinas, hoteles, ferias, fábricas, colegios, comercios, etc. Disponemos de montadores propios con gran experiencia.",
    iconSrc: "/img/icons/vinils.svg",
  },
  {
    title: "Logística - Distribución de tu pedido",
    description:
      "Nos encargamos de forma integral de las recogidas, manipulados, picking, embalajes, almacenaje y de la gestión de stocks. Realizamos entregas en menos de 24h. Distribución nacional e internacional.",
    iconSrc: "/img/icons/logistica.svg",
  },
];
</script>

<template>
  <section class="w-full bg-background">
    <div class="container-content py-10 md:py-14 lg:py-16">
      <SectionHeading
        as="h2"
        title="Inspiramos confianza en las empresas a través de nuestros servicios"
        title-tone="ink"
        line-tone="ink"
        class="mb-10 md:mb-12"
      />

      <div
        class="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-8 md:gap-y-10 xl:grid-cols-3"
      >
        <article
          v-for="(service, index) in services"
          :key="index"
          class="flex items-start gap-5"
        >
          <div
            class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-base-light md:h-24 md:w-24"
            aria-hidden="true"
          >
            <img
              :src="service.iconSrc"
              :alt="`Icono: ${service.title}`"
              class="h-12 w-12 md:h-14 md:w-14"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div class="min-w-0 space-y-2">
            <h3 class="m-0 text-lg font-semibold leading-6 text-foreground md:text-xl">
              {{ service.title }}
            </h3>

            <p class="m-0 text-sm leading-6 text-muted-foreground md:text-base">
              {{ service.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
