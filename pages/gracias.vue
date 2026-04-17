<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
import { Phone, Mail, MapPin } from "lucide-vue-next";

definePageMeta({
  layout: "default",
});

type ThankYouKind = "contacto" | "presupuesto";

const route = useRoute();

const pageContainerClass = "container-content";
const mutedBandClass =
  "mt-16 border-y border-border/50 bg-muted/30 py-12 md:mt-20 md:py-16";
const sectionSpacingClass = "py-16 md:py-20";

const kind = computed<ThankYouKind>(() =>
  route.query.kind === "presupuesto" ? "presupuesto" : "contacto"
);

const pageTitle = computed(() =>
  kind.value === "presupuesto"
    ? "¡Gracias por solicitar tu presupuesto!"
    : "¡Gracias por contactar con nosotros!"
);

const pageLead = computed(() =>
  kind.value === "presupuesto"
    ? "Hemos recibido tu solicitud correctamente y ya está en manos de nuestro equipo."
    : "Hemos recibido tu mensaje correctamente y ya está en manos de nuestro equipo."
);

const seoTitle = computed(() =>
  kind.value === "presupuesto"
    ? "Solicitud recibida | Repro Disseny"
    : "Mensaje recibido | Repro Disseny"
);

const seoDescription = computed(() =>
  kind.value === "presupuesto"
    ? "Hemos recibido tu solicitud de presupuesto y te responderemos lo antes posible."
    : "Hemos recibido tu mensaje y te responderemos lo antes posible."
);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
});

useHead({
  meta: [
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});

const projectImages = [
  {
    src: "/images/gracias/proyecto-1.jpg",
    alt: "Proyecto de gráfica para evento corporativo",
  },
  {
    src: "/images/gracias/proyecto-2.jpg",
    alt: "Pieza gráfica impresa con acabado premium",
  },
  {
    src: "/images/gracias/proyecto-3.jpg",
    alt: "Packaging personalizado",
  },
  {
    src: "/images/gracias/proyecto-4.jpg",
    alt: "Proyecto de rotulación interior",
  },
];

const contactItems = [
  {
    icon: Phone,
    title: "Atención al cliente",
    lines: [
      "Puedes hablar con nosotros",
      "lunes a jueves de 8:30 h a 18:00 h",
      "viernes de 8:00 a 14:00 h",
    ],
  },
  {
    icon: Mail,
    title: "Correo electrónico",
    lines: [
      "Si tienes cualquier duda,",
      "escríbenos un email y te",
      "responderemos en breve",
    ],
  },
  {
    icon: MapPin,
    title: "Dirección postal",
    lines: [
      "Repro Disseny, SL",
      "C/ Juan de Mena, 19",
      "08035, Barcelona",
    ],
  },
];
</script>

<template>
  <main class="min-h-screen bg-background">
    <section :class="[pageContainerClass, 'pt-14 md:pt-20']">
      <div
        class="mx-auto max-w-5xl rounded-[28px] bg-brand-bg-2 px-6 py-12 text-center md:px-12 md:py-16"
      >
        <SectionHeading
          as="h1"
          size="hero"
          align="center"
          :line="false"
          :ornament="false"
          :title="pageTitle"
          :subtitle="pageLead"
          title-class="text-balance !text-[2.2rem] !leading-[1.08] md:!text-[4rem]"
          subtitle-class="mx-auto max-w-4xl !text-base !leading-8 md:!text-[1.125rem] md:!leading-8"
        />

        <div class="mx-auto mt-6 max-w-4xl space-y-4 text-base leading-8 text-foreground">
          <p>
            Te responderemos lo antes posible, normalmente en menos de 24 horas
            laborables.
          </p>

          <p>
            Si tu consulta es urgente, puedes llamarnos directamente al
            <a
              class="underline underline-offset-4 transition hover:text-primary"
              href="tel:+34932749890"
            >
              93 274 98 90
            </a>
          </p>
        </div>
      </div>
    </section>

    <section :class="mutedBandClass">
      <div
        :class="[
          pageContainerClass,
          'grid items-center gap-8 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10',
        ]"
      >
        <div class="flex justify-center md:justify-start">
          <div
            class="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-background text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:h-[128px] md:w-[128px]"
          >
            <span class="text-[2rem] font-semibold leading-none text-primary">
              repro
            </span>
            <span class="mt-1 text-sm leading-none text-foreground">
              disseny
            </span>
            <span
              class="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              Desde 1983
            </span>
          </div>
        </div>

        <div class="space-y-4 text-center md:text-left">
          <ContentSectionIntro
            title="Más de 40 años ayudando a empresas a comunicar mejor"
            description="Desde 1983, en Reprodisseny te acompañamos en la producción de materiales gráficos con calidad, rigor y rapidez."
            :line="false"
            max-width-class="max-w-4xl"
            title-class="!text-[2.2rem] !leading-[1.05] md:!text-[3.5rem]"
            description-class="!text-base !leading-8"
          />

          <div class="max-w-4xl space-y-4 text-base leading-8 text-foreground/90">
            <p>No solo imprimimos.</p>

            <p>
              Analizamos cada proyecto, te asesoramos en los aspectos técnicos y
              cuidamos cada detalle para que el resultado final esté a la altura
              de tu marca.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section :class="[pageContainerClass, sectionSpacingClass]">
      <ContentSectionIntro
        title="Algunos de nuestros últimos proyectos realizados para empresas de distintos sectores"
        :line="false"
        :centered="true"
        max-width-class="max-w-5xl"
        title-class="!text-[2.1rem] !leading-[1.08] md:!text-[3.25rem]"
      />

      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="item in projectImages"
          :key="item.src"
          class="overflow-hidden rounded-[18px] bg-muted"
        >
          <NuxtImg
            :src="item.src"
            :alt="item.alt"
            class="aspect-[1/1] h-full w-full object-cover"
            loading="lazy"
          />
        </article>
      </div>
    </section>

    <section class="relative overflow-hidden bg-slate-100">
      <div class="absolute inset-0 opacity-100">
        <div
          class="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.72)_45%,rgba(255,255,255,0.10)_100%)]"
        />
      </div>

      <div :class="[pageContainerClass, 'relative py-12 md:py-16']">
        <div class="max-w-3xl">
          <ContentSectionIntro
            title="¿Sabes cómo preparar tus archivos correctamente?"
            :line="false"
            max-width-class="max-w-3xl"
            title-class="!text-[2rem] !leading-[1.08] md:!text-[3rem]"
          />

          <div class="mt-6">
            <AppButton to="/como-preparar-archivos-para-imprimir">
              Ver la guía rápida
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-primary py-12 text-primary-foreground md:py-16">
      <div :class="pageContainerClass">
        <SectionHeading
          as="h2"
          size="compact"
          align="center"
          theme="inverse"
          :line="false"
          :ornament="false"
          title="Si lo prefieres, puedes hablar directamente con nosotros"
          title-class="!text-[1.375rem] md:!text-[1.75rem]"
        />

        <div class="mt-10 grid gap-10 md:mt-14 md:grid-cols-3">
          <article
            v-for="item in contactItems"
            :key="item.title"
            class="text-center"
          >
            <div class="flex justify-center">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full border border-white/20"
              >
                <component :is="item.icon" class="h-5 w-5" />
              </div>
            </div>

            <h3 class="mt-5 text-2xl font-semibold">
              {{ item.title }}
            </h3>

            <div class="mt-5 space-y-1 text-base leading-7 text-primary-foreground/90">
              <p v-for="line in item.lines" :key="line">
                {{ line }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>