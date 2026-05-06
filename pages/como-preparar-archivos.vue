<script setup lang="ts">
import { Check } from "lucide-vue-next";

definePageMeta({
  layout: "default",
});

const canonicalUrl = "https://reprodisseny.com/como-preparar-archivos";

const pageContainerClass = "container-content";
const heroImage = {
  src: "/img/ui/preparar-archivos/preparacion-archivo-impresion-hero.webp",
  alt: "Diseñadora preparando un archivo gráfico para impresión profesional",
  width: 620,
  height: 390,
};

const processImages = [
  {
    src: "/img/ui/preparar-archivos/illustrator-nuevo-documento-cmyk-sangrado.webp",
    alt: "Configuración de documento con 3 mm de sangrado en Illustrator",
    width: 560,
    height: 360,
  },
  {
    src: "/img/ui/preparar-archivos/guardar-pdf-marcas-sangrado.webp",
    alt: "Exportación de PDF de alta calidad con marcas y sangrado",
    width: 560,
    height: 360,
  },
];

const checklist = [
  "Color en CMYK, no RGB. Para tinta plana, define Pantone.",
  "Resolución a 300 ppp; 150 ppp para gran formato.",
  "3 mm de sangrado si las imágenes o fondos llegan hasta el borde.",
  "Tipografías trazadas e imágenes incrustadas en el documento.",
  "Guarda siempre como PDF de alta calidad.",
];

const steps = [
  {
    title: "Creación del documento",
    items: [
      "Créalo con las medidas finales exactas.",
      "Añade 3 mm de sangrado por cada lado si las imágenes o fondos llegan hasta el borde.",
      "Mantén un margen de seguridad de al menos 3 mm para textos y logotipos.",
    ],
  },
  {
    title: "Color",
    items: [
      "Trabaja en CMYK y no en RGB.",
      "Para tinta plana usa Pantone cuando sea necesario.",
      "Siempre que puedas, utiliza el perfil ISO Coated v3.",
    ],
  },
  {
    title: "Resolución",
    items: [
      "300 ppp para pequeño formato.",
      "150 ppp para gran formato.",
    ],
  },
  {
    title: "Tipografías",
    items: [
      "Convierte el texto a contornos o incrusta las fuentes.",
      "Evita tipografías de fuentes poco fiables.",
      "Comprueba que los textos se muestran correctamente al guardar el PDF.",
      "Revisa la ortografía antes de enviar el archivo.",
    ],
  },
  {
    title: "Imágenes",
    items: [
      "Usa formatos sin mucha compresión: TIFF, PNG o JPG de alta calidad.",
      "Revisa que no se vean pixeladas a tamaño real.",
      "Si llegan hasta el borde, asegúrate de añadir 3 mm de sangrado.",
      "Ten cuidado con las transparencias.",
    ],
  },
  {
    title: "Guardar PDF para impresión",
    items: [
      "Guarda como PDF de alta calidad o PDF para imprimir.",
      "Define correctamente el sangrado del documento.",
      "Activa la opción de marcas de corte cuando corresponda.",
      "Revisa el PDF final antes de enviarlo.",
    ],
  },
];

const appNotes = [
  {
    title: "Photoshop",
    text: "Crea el documento a 300 ppp y añade 3 mm de sangrado si el diseño llega hasta el borde. Guarda como Photoshop PDF en impresión de alta calidad.",
  },
  {
    title: "InDesign",
    text: "Trabaja a 300 ppp y añade 3 mm de sangrado. Para exportar, usa Archivo > Valores de Adobe PDF > Impresión de alta calidad y activa marcas de corte y sangrado.",
  },
  {
    title: "Canva",
    text: "Guarda el documento como PDF para impresión desde Compartir > Descargar. La versión Pro permite cambiar RGB a CMYK.",
  },
];

useSeoMeta({
  title: "Cómo preparar buenos archivos para impresión | Reprodisseny",
  description:
    "Checklist para preparar archivos de impresión: CMYK, sangrado, resolución, tipografías, imágenes y exportación a PDF de alta calidad.",
  ogTitle: "Cómo preparar buenos archivos para impresión | Reprodisseny",
  ogDescription:
    "Guía práctica para evitar errores antes de enviar tus archivos a imprenta.",
  ogType: "article",
  ogUrl: canonicalUrl,
  ogImage: heroImage.src,
  twitterCard: "summary_large_image",
  robots: "index,follow",
});

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Cómo preparar buenos archivos para impresión",
        description:
          "Checklist para preparar archivos de impresión con sangrado, CMYK, resolución adecuada, tipografías trazadas y PDF de alta calidad.",
        image: `https://reprodisseny.com${heroImage.src}`,
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.items.join(" "),
        })),
      }),
    },
  ],
});
</script>

<template>
  <main class="bg-background text-foreground">
    <section :class="[pageContainerClass, 'pt-14 pb-10 md:pt-20 md:pb-14']">
      <div class="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)] lg:gap-16">
        <div class="max-w-2xl">
          <p class="section-eyebrow mb-5">Guía de impresión</p>

          <h1 class="section-title section-title--hero text-brand-ink-dark">
            Cómo preparar buenos archivos para impresión
          </h1>

          <div class="mt-9">
            <h2 class="section-title section-title--subsection text-brand-ink-dark">
              Check list
            </h2>

            <ul class="mt-6 space-y-4 text-body-s md:text-body">
              <li
                v-for="item in checklist"
                :key="item"
                class="flex gap-3 text-foreground/90"
              >
                <Check
                  class="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand-success))]"
                  stroke-width="3"
                  aria-hidden="true"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <figure class="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/70">
          <img
            :src="heroImage.src"
            :alt="heroImage.alt"
            :width="heroImage.width"
            :height="heroImage.height"
            class="aspect-[16/10] h-full w-full object-cover"
            loading="eager"
            fetchpriority="high"
          />
        </figure>
      </div>
    </section>

    <section :class="[pageContainerClass, 'pb-14 md:pb-20']" aria-labelledby="pasos-impresion">
      <header class="mb-8 md:mb-10">
        <h2
          id="pasos-impresion"
          class="section-title section-title--subsection text-brand-ink-dark"
        >
          Sigue estos pasos para asegurar unos buenos resultados
        </h2>
        <div class="mt-3 h-px w-full bg-brand-ink-dark/45" />
      </header>

      <div class="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:gap-14">
        <div class="space-y-8 md:space-y-10">
          <figure
            v-for="image in processImages"
            :key="image.src"
            class="overflow-hidden rounded-lg bg-muted shadow-sm ring-1 ring-border/70"
          >
            <img
              :src="image.src"
              :alt="image.alt"
              :width="image.width"
              :height="image.height"
              class="w-full object-cover"
              loading="lazy"
            />
          </figure>
        </div>

        <ol class="space-y-7 md:space-y-8">
          <li
            v-for="(step, index) in steps"
            :key="step.title"
            class="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4"
          >
            <span
              class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-label font-semibold text-primary-foreground"
            >
              {{ index + 1 }}
            </span>

            <div>
              <h3 class="section-title section-title--compact text-brand-ink-dark">
                {{ step.title }}
              </h3>

              <ul class="mt-3 list-disc space-y-1.5 pl-5 text-body-s text-foreground/85">
                <li v-for="item in step.items" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section :class="[pageContainerClass, 'pb-16 md:pb-24']" aria-label="Notas por programa">
      <div class="mx-auto max-w-5xl rounded-2xl bg-accent/75 p-6 ring-1 ring-primary/10 md:p-8">
        <p class="mb-5 text-body-s font-semibold text-brand-ink-dark">
          (*) Las capturas muestran procesos de trabajo utilizando Illustrator.
        </p>

        <ul class="space-y-5 text-body-s leading-6 text-brand-ink-dark/90">
          <li v-for="note in appNotes" :key="note.title">
            <strong class="font-semibold text-brand-ink-dark">En {{ note.title }}</strong>
            <span> {{ note.text }}</span>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
