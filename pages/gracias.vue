<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";

definePageMeta({
  layout: "default",
});

type ThankYouKind = "contacto" | "presupuesto";

const route = useRoute();

const pageContainerClass = "container-content";

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
    ? "Hemos recibido tu solicitud correctamente y nuestro equipo la revisará lo antes posible."
    : "Hemos recibido tu mensaje correctamente y nuestro equipo te responderá lo antes posible."
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
</script>

<template>
  <main class="min-h-screen bg-background">
    <section :class="[pageContainerClass, 'pt-12 md:pt-16']">
      <div
        class="mx-auto max-w-4xl rounded-[28px] border border-border/50 bg-brand-bg-2 px-6 py-10 text-center md:px-10 md:py-14"
      >
        <SectionHeading
          as="h1"
          size="hero"
          align="center"
          :line="false"
          :ornament="false"
          :title="pageTitle"
          :subtitle="pageLead"
          title-class="text-balance !text-[2.2rem] !leading-[1.08] md:!text-[3rem]"
          subtitle-class="mx-auto max-w-3xl !text-base !leading-7 md:!text-[1.125rem] md:!leading-8"
        />

        <div
          class="mx-auto mt-6 max-w-3xl space-y-3 text-base leading-7 text-foreground/85"
        >
          <p>
            Te responderemos lo antes posible, normalmente en menos de 24 horas
            laborables.
          </p>

          <p>
            Si tu consulta es urgente, puedes llamarnos directamente al
            <a
              href="tel:+34932749890"
              class="font-medium underline underline-offset-4 transition hover:text-primary"
            >
              93 274 98 90 </a
            >.
          </p>
        </div>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <AppButton to="/contacto"> Volver a contacto </AppButton>

          <AppButton variant="secondary" to="/productos"> Ver productos </AppButton>
        </div>
      </div>
    </section>

    <section class="mt-16 border-y border-border/50 bg-muted/30 md:mt-20">
      <div :class="[pageContainerClass, 'py-12 md:py-14']">
        <div class="mx-auto max-w-3xl text-center">
          <SectionHeading
            as="h2"
            size="compact"
            align="center"
            :line="false"
            :ornament="false"
            title="Más de 40 años ayudando a empresas a comunicar mejor"
            subtitle="Desde 1983 acompañamos a empresas y profesionales en la producción de materiales gráficos con un servicio cercano, ágil y bien resuelto."
            title-class="!text-[1.9rem] !leading-[1.08] md:!text-[2.4rem]"
            subtitle-class="mx-auto max-w-2xl !text-base !leading-7 text-foreground/80"
          />

          <div class="mt-5 space-y-3 text-base leading-7 text-foreground/85">
            <p>
              No solo imprimimos: revisamos cada proyecto, resolvemos dudas técnicas y
              cuidamos los detalles para que el resultado final esté a la altura de tu
              marca.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border/50 bg-brand-base-light/35">
      <div
        :class="[
          pageContainerClass,
          'flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:gap-10 md:py-14',
        ]"
      >
        <div class="max-w-2xl">
          <SectionHeading
            as="h2"
            size="compact"
            align="left"
            :line="false"
            :ornament="false"
            title="¿Sabes cómo preparar tus archivos correctamente?"
            subtitle="Consulta nuestra guía rápida para revisar medidas, sangrado, resolución y aspectos clave antes de imprimir."
            title-class="!text-[1.75rem] !leading-[1.08] md:!text-[2.2rem]"
            subtitle-class="!text-base !leading-7 text-foreground/80"
          />
        </div>

        <div class="shrink-0">
          <AppButton to="/como-preparar-archivos"> Ver la guía rápida </AppButton>
        </div>
      </div>
    </section>

    <ContactInfoBand
      section-class="bg-brand-base-dark text-brand-ink-light py-20"
      container-class="container-wide"
    />
  </main>
</template>
