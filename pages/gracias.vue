<script setup lang="ts">
import { computed } from "vue";
import ThankYouPanel from "@/components/marketing/quote/ThankYouPanel.vue";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import AppButton from "@/components/shared/button/AppButton.vue";

definePageMeta({
  layout: "default",
});

type ThankYouKind = "contacto" | "presupuesto";

const route = useRoute();

const pageContainerClass = "container-content";

const kind = computed<ThankYouKind>(() =>
  route.query.kind === "presupuesto" ? "presupuesto" : "contacto"
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

const primaryLabel = computed(() =>
  kind.value === "presupuesto" ? "Solicitar otro presupuesto" : "Volver al inicio"
);

const primaryTo = computed(() =>
  kind.value === "presupuesto" ? "/pedir-presupuesto" : "/"
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
    <section :class="[pageContainerClass, 'pt-10 pb-14 md:pt-14 md:pb-20']">
      <ThankYouPanel
        :kind="kind"
        :primary-label="primaryLabel"
        :primary-to="primaryTo"
        secondary-label="Ver productos"
        secondary-to="/productos"
        heading-tag="h1"
      />
    </section>

    <section class="border-y border-border/50 bg-muted/30">
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
