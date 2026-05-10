<script setup lang="ts">
import { ref } from "vue";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Factory,
  Monitor,
  Sofa,
  Sun,
  Wrench,
  Zap,
} from "lucide-vue-next";

definePageMeta({
  layout: "landing",
});

useSeoMeta({
  title: "Láminas solares para cristales en Barcelona · Repro Disseny",
  description:
    "Instalación de láminas solares para oficinas, comercios y viviendas en Barcelona. Reduce calor, reflejos y radiación UV sin obras.",
  ogTitle: "Láminas solares para cristales en Barcelona",
  ogDescription:
    "Protege tus espacios del calor y los reflejos con instalación profesional de láminas solares.",
  robots: "index, follow",
});

type ProblemItem = {
  title: string;
  description: string;
  icon: unknown;
};

type MetricItem = {
  value: string;
  label: string;
  note?: string;
};

type ProjectItem = {
  title: string;
  context: string;
  imageSrc: string;
  imageAlt: string;
};

type StepItem = {
  number: string;
  title: string;
  description: string;
};

type ReasonItem = {
  title: string;
  description: string;
  icon: unknown;
};

type FaqItem = {
  question: string;
  answer: string;
};

const heroImage = {
  src: "",
  alt: "Oficina luminosa con cristales protegidos mediante láminas solares",
};

const installationImage = {
  src: "",
  alt: "Instalación profesional de lámina solar sobre cristal",
};

const problems: ProblemItem[] = [
  {
    title: "Calor excesivo",
    description:
      "Salas y despachos que no se pueden usar por la tarde sin aire acondicionado al máximo.",
    icon: Sun,
  },
  {
    title: "Reflejos en pantallas",
    description:
      "Reuniones y trabajo diario interrumpidos por deslumbramientos constantes.",
    icon: Monitor,
  },
  {
    title: "Decoloración del mobiliario",
    description:
      "Los rayos UV deterioran pavimentos, tapicerías y mobiliario de forma silenciosa.",
    icon: Sofa,
  },
  {
    title: "Factura energética elevada",
    description:
      "El aire acondicionado compensa lo que unas láminas pueden ayudar a reducir desde el cristal.",
    icon: Zap,
  },
];

const metrics: MetricItem[] = [
  {
    value: "Hasta un 80%",
    label: "de rechazo solar",
    note: "Según tipo de lámina y vidrio.",
  },
  {
    value: "Hasta 99%",
    label: "de bloqueo UV",
    note: "Según ficha técnica del fabricante.",
  },
  {
    value: "Instalación",
    label: "habitual en 1 día",
    note: "Para superficies estándar.",
  },
  {
    value: "Sin obras",
    label: "ni residuos",
    note: "Aplicación directa sobre el cristal.",
  },
];

const projects: ProjectItem[] = [
  {
    title: "Oficina corporativa",
    context: "Control de reflejos en zona de trabajo",
    imageSrc: "",
    imageAlt: "Cristal de oficina con lámina solar instalada",
  },
  {
    title: "Edificio acristalado",
    context: "Reducción de calor en fachada expuesta",
    imageSrc: "",
    imageAlt: "Fachada acristalada con láminas de protección solar",
  },
  {
    title: "Sala comercial",
    context: "Confort para clientes y trabajadores",
    imageSrc: "",
    imageAlt: "Local comercial con cristales protegidos del sol",
  },
];

const steps: StepItem[] = [
  {
    number: "01",
    title: "Consulta técnica",
    description:
      "Evaluamos el espacio, el tipo de cristal, la orientación y tus necesidades específicas.",
  },
  {
    number: "02",
    title: "Producción",
    description:
      "Preparamos el material adecuado para tu caso y definimos el acabado más conveniente.",
  },
  {
    number: "03",
    title: "Instalación",
    description:
      "Nuestro equipo se encarga de realizar la instalación completa de forma limpia y profesional.",
  },
];

const reasons: ReasonItem[] = [
  {
    title: "Producción propia",
    description:
      "Fabricamos e instalamos con equipo propio en Barcelona. Sin intermediarios ni retrasos de proveedores externos.",
    icon: Factory,
  },
  {
    title: "Asesoramiento técnico",
    description:
      "Te ayudamos a elegir el film adecuado según el tipo de cristal, la orientación y el resultado que buscas.",
    icon: Wrench,
  },
  {
    title: "Garantía profesional",
    description:
      "Trabajamos con materiales de fabricante y una instalación realizada por nuestro equipo técnico.",
    icon: BadgeCheck,
  },
];

const clientLogos = [
  "Ajuntament",
  "Comercios",
  "Arquitectura",
  "Retail",
  "Oficinas",
  "Viviendas",
];

const faqs: FaqItem[] = [
  {
    question: "¿Se nota el cambio de color en el cristal?",
    answer:
      "Depende del tipo de lámina. Las neutras son muy discretas. Las de mayor rechazo solar pueden tener un tono ligeramente más oscuro.",
  },
  {
    question: "¿Cuánto dura la instalación?",
    answer:
      "La mayoría de instalaciones se completan en un día. Espacios grandes pueden requerir dos jornadas.",
  },
  {
    question: "¿Qué vida útil tiene la lámina?",
    answer:
      "La duración depende del tipo de film, la orientación del cristal y la exposición solar. Te asesoramos según cada caso.",
  },
  {
    question: "¿Se puede quitar si cambio de opinión?",
    answer:
      "Sí. La lámina se puede retirar sin sustituir el cristal, siempre que la retirada se realice correctamente.",
  },
  {
    question: "¿Sirve para cualquier tipo de vidrio?",
    answer:
      "Trabajamos con diferentes tipos de vidrio. Antes de recomendar una lámina revisamos el tipo de cristal y el uso del espacio.",
  },
  {
    question: "¿Venís a domicilios particulares o solo empresas?",
    answer:
      "Instalamos tanto en oficinas y comercios como en viviendas particulares en Barcelona y alrededores.",
  },
];

const openFaqIndex = ref<number | null>(0);
const formSent = ref(false);

function scrollToQuote() {
  if (!process.client) return;

  document.querySelector("#quote-form")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function toggleFaq(index: number) {
  openFaqIndex.value = openFaqIndex.value === index ? null : index;
}

function onMockSubmit() {
  formSent.value = true;
}
</script>

<template>
  <div class="bg-background text-foreground">
    <!-- Hero -->
    <section
      class="relative overflow-hidden bg-[hsl(var(--brand-bg-2))]"
      aria-labelledby="landing-hero-title"
    >
      <div class="absolute inset-0">
        <div
          v-if="heroImage.src"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${heroImage.src})` }"
          role="img"
          :aria-label="heroImage.alt"
        />

        <div
          v-else
          class="absolute inset-0 bg-[radial-gradient(circle_at_74%_36%,rgba(255,255,255,0.75),transparent_24%),linear-gradient(115deg,#b78f63_0%,#d8bc91_26%,#f6e2b6_54%,#c8dcec_100%)]"
          aria-hidden="true"
        />

        <div class="absolute inset-0 bg-black/12" />
      </div>

      <div class="container-wide relative py-10 md:py-16 lg:py-20">
        <div
          class="max-w-[760px] rounded-[28px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.38)] backdrop-blur md:p-9 lg:p-10"
        >
          <p
            class="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary"
          >
            Láminas solares para cristales
          </p>

          <h1
            id="landing-hero-title"
            class="max-w-2xl text-balance text-[2.15rem] font-bold leading-[0.98] tracking-[-0.045em] text-[hsl(var(--brand-ink-dark))] sm:text-5xl lg:text-[4rem]"
          >
            Protege tus espacios del calor y los reflejos
            <span class="text-primary">(sin obras)</span>
          </h1>

          <p
            class="mt-5 max-w-xl text-base leading-7 text-foreground/72 md:text-lg md:leading-8"
          >
            Instalamos láminas de protección solar en oficinas, comercios y viviendas en
            Barcelona. Producción propia e instalación profesional.
          </p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              @click="scrollToQuote"
            >
              Solicitar presupuesto
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </button>

            <p class="text-sm font-semibold text-foreground/68">
              Respondemos en menos de 24h laborales
            </p>
          </div>
        </div>

        <div
          class="pointer-events-none absolute bottom-8 right-[7%] hidden h-40 w-64 rounded-[28px] border border-white/50 bg-white/35 shadow-2xl backdrop-blur-md lg:block"
          aria-hidden="true"
        >
          <div
            class="h-full rounded-[26px] bg-[linear-gradient(135deg,rgba(255,255,255,.75),rgba(255,255,255,.2)),radial-gradient(circle_at_78%_30%,rgba(255,202,99,.9),transparent_18%),linear-gradient(135deg,rgba(0,118,179,.22),rgba(255,255,255,.18))]"
          />
        </div>
      </div>
    </section>

    <!-- Problemas -->
    <section class="bg-[hsl(var(--brand-bg-2))] py-12 md:py-16">
      <div class="container-content">
        <div class="mx-auto max-w-3xl text-center">
          <p class="section-eyebrow justify-center">Problema</p>
          <h2 class="section-title section-title--section mt-3">
            El sol puede ser un problema en tu espacio de trabajo
          </h2>
        </div>

        <div class="mx-auto mt-9 grid max-w-4xl gap-5 md:grid-cols-2">
          <article
            v-for="problem in problems"
            :key="problem.title"
            class="grid grid-cols-[2.75rem_1fr] gap-4 rounded-2xl border border-black/5 bg-white/45 p-4 shadow-sm backdrop-blur-sm md:p-5"
          >
            <div
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm"
            >
              <component :is="problem.icon" class="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <h3 class="text-base font-bold text-foreground">
                {{ problem.title }}
              </h3>
              <p class="mt-1 text-sm leading-6 text-foreground/70">
                {{ problem.description }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Solución + métricas -->
    <section class="bg-[hsl(var(--brand-base-light))] py-12 md:py-16">
      <div class="container-content">
        <div class="mx-auto max-w-4xl text-center">
          <p class="section-eyebrow justify-center">Solución</p>
          <h2 class="section-title section-title--section mt-3">
            Láminas de control solar:
            <span class="text-primary">confort inmediato, instalación en un día</span>
          </h2>
          <p
            class="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg"
          >
            Las láminas de protección solar se aplican directamente sobre el cristal,
            ayudando a reducir el calor, los reflejos y la radiación UV sin alterar la
            estética del edificio y sin necesidad de hacer obras.
          </p>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="metric in metrics"
            :key="metric.value"
            class="rounded-2xl border border-white/80 bg-white/88 p-5 text-center shadow-[0_14px_34px_-28px_rgba(0,0,0,.28)]"
          >
            <p class="text-2xl font-bold tracking-tight text-primary md:text-3xl">
              {{ metric.value }}
            </p>
            <p class="mt-1 text-sm font-semibold text-foreground/78">
              {{ metric.label }}
            </p>
            <p v-if="metric.note" class="mt-2 text-xs leading-5 text-muted-foreground">
              {{ metric.note }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Proyectos / espacios -->
    <section class="bg-white py-12 md:py-16">
      <div class="container-content">
        <div class="mx-auto max-w-3xl text-center">
          <p class="section-eyebrow justify-center">Aplicaciones</p>
          <h2 class="section-title section-title--section mt-3">
            Espacios que ya disfrutan de más confort
          </h2>
        </div>

        <div class="mt-9 grid gap-5 md:grid-cols-3">
          <article
            v-for="(project, index) in projects"
            :key="project.title"
            class="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
          >
            <div class="aspect-[16/9] overflow-hidden bg-muted">
              <img
                v-if="project.imageSrc"
                :src="project.imageSrc"
                :alt="project.imageAlt"
                class="h-full w-full object-cover"
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
              />

              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(0,118,179,.18),rgba(255,255,255,.74)),radial-gradient(circle_at_70%_34%,rgba(255,196,92,.58),transparent_20%)]"
                aria-hidden="true"
              >
                <div
                  class="h-16 w-32 rounded-xl border border-white/70 bg-white/55 shadow-sm backdrop-blur"
                />
              </div>
            </div>

            <div class="p-4 text-center">
              <p class="text-sm font-bold text-foreground">
                {{ project.title }}
              </p>
              <p class="mt-1 text-xs leading-5 text-muted-foreground">
                {{ project.context }}
              </p>
              <p
                class="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70"
              >
                Mockup {{ index + 1 }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Proceso -->
    <section class="bg-[hsl(var(--brand-base-dark))] py-12 text-white md:py-16">
      <div class="container-content">
        <div class="mx-auto max-w-3xl text-center">
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-white/68">
            Proceso
          </p>
          <h2 class="mt-3 text-balance text-2xl font-bold tracking-[-0.03em] md:text-4xl">
            De la primera consulta a la instalación, en tres pasos
          </h2>
        </div>

        <div
          class="mt-9 grid gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch"
        >
          <template v-for="(step, index) in steps" :key="step.number">
            <article
              class="rounded-2xl border border-white/10 bg-white/8 p-5 shadow-[0_16px_40px_-30px_rgba(0,0,0,.7)]"
            >
              <p class="text-3xl font-bold text-white/90">
                {{ step.number }}
              </p>
              <h3 class="mt-4 text-lg font-bold">
                {{ step.title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-white/72">
                {{ step.description }}
              </p>
            </article>

            <div
              v-if="index < steps.length - 1"
              class="hidden items-center justify-center text-white/30 md:flex"
              aria-hidden="true"
            >
              <ArrowRight class="h-6 w-6" />
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Por qué Repro -->
    <section class="bg-[hsl(var(--brand-base-light))]/45 py-12 md:py-16">
      <div class="container-content">
        <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div
            class="overflow-hidden rounded-[26px] border border-border/70 bg-white shadow-sm"
          >
            <img
              v-if="installationImage.src"
              :src="installationImage.src"
              :alt="installationImage.alt"
              class="aspect-[16/10] h-full w-full object-cover"
              width="720"
              height="450"
              loading="lazy"
              decoding="async"
            />

            <div
              v-else
              class="aspect-[16/10] bg-[linear-gradient(135deg,rgba(0,118,179,.16),rgba(255,255,255,.8)),radial-gradient(circle_at_28%_35%,rgba(0,79,120,.22),transparent_18%),radial-gradient(circle_at_72%_52%,rgba(255,190,88,.5),transparent_20%)]"
              aria-hidden="true"
            >
              <div class="flex h-full items-center justify-center p-8">
                <div
                  class="w-full max-w-sm rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm backdrop-blur"
                >
                  <div class="h-3 w-28 rounded-full bg-primary/25" />
                  <div class="mt-4 h-24 rounded-xl bg-primary/10" />
                  <div class="mt-4 grid grid-cols-3 gap-2">
                    <div class="h-10 rounded-lg bg-white/70" />
                    <div class="h-10 rounded-lg bg-white/70" />
                    <div class="h-10 rounded-lg bg-white/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p class="section-eyebrow">Repro Disseny</p>
            <h2 class="section-title section-title--section mt-3">
              ¿Por qué Repro Disseny?
            </h2>
            <p class="mt-3 max-w-2xl text-base font-semibold text-foreground/74">
              Más de 40 años aportando soluciones gráficas para empresas, comercios y
              comunicación visual.
            </p>

            <div class="mt-6 space-y-4">
              <article
                v-for="reason in reasons"
                :key="reason.title"
                class="grid grid-cols-[2.75rem_1fr] gap-4 rounded-2xl border border-border/70 bg-white p-4 shadow-sm"
              >
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
                >
                  <component :is="reason.icon" class="h-5 w-5" aria-hidden="true" />
                </div>

                <div>
                  <h3 class="text-base font-bold text-foreground">
                    {{ reason.title }}
                  </h3>
                  <p class="mt-1 text-sm leading-6 text-muted-foreground">
                    {{ reason.description }}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Clientes -->
    <section class="bg-[hsl(var(--brand-bg-2))] py-10">
      <div class="container-content">
        <p class="mb-5 text-center text-sm font-bold text-foreground/70">
          Clientes que confían en nosotros
        </p>

        <div
          class="mx-auto grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm sm:grid-cols-3 lg:grid-cols-6"
        >
          <div
            v-for="logo in clientLogos"
            :key="logo"
            class="flex min-h-16 items-center justify-center border-b border-r border-border/50 px-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground last:border-r-0 sm:last:border-r"
          >
            {{ logo }}
          </div>
        </div>
      </div>
    </section>

    <!-- FAQs -->
    <section class="bg-white py-12 md:py-16">
      <div class="container-content">
        <div class="mx-auto max-w-3xl text-center">
          <p class="section-eyebrow justify-center">FAQs</p>
          <h2 class="section-title section-title--section mt-3">Preguntas frecuentes</h2>
        </div>

        <div class="mx-auto mt-8 max-w-4xl space-y-3">
          <article
            v-for="(faq, index) in faqs"
            :key="faq.question"
            class="rounded-xl border border-border/70 bg-white shadow-sm"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-bold text-foreground transition hover:bg-muted/40 md:px-5"
              :aria-expanded="openFaqIndex === index"
              @click="toggleFaq(index)"
            >
              <span>{{ faq.question }}</span>
              <ChevronDown
                class="h-4 w-4 shrink-0 text-muted-foreground transition"
                :class="openFaqIndex === index && 'rotate-180'"
                aria-hidden="true"
              />
            </button>

            <div
              v-if="openFaqIndex === index"
              class="border-t border-border/60 px-4 pb-4 pt-3 text-sm leading-6 text-muted-foreground md:px-5"
            >
              {{ faq.answer }}
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Formulario mock -->
    <section
      id="quote-form"
      class="scroll-mt-24 bg-[hsl(var(--brand-base-light))] py-12 md:py-16"
    >
      <div class="container-content">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="section-title section-title--section">
            ¿Quieres saber cuánto costaría proteger tus cristales?
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Explícanos tu proyecto y te enviaremos un presupuesto en menos de 24 h
            laborales.
          </p>
        </div>

        <form
          class="mx-auto mt-8 max-w-2xl rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_48px_-34px_rgba(0,0,0,.35)] backdrop-blur md:p-7"
          @submit.prevent="onMockSubmit"
        >
          <div
            v-if="formSent"
            class="mb-5 rounded-2xl border border-primary/20 bg-primary/8 p-4 text-sm font-semibold text-primary"
          >
            Estructura preparada. El envío real se conectará al formulario definitivo.
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                Nombre *
              </span>
              <input
                type="text"
                class="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Tu nombre"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                Empresa
              </span>
              <input
                type="text"
                class="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Opcional"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                Email *
              </span>
              <input
                type="email"
                class="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="tu@email.com"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                Teléfono *
              </span>
              <input
                type="tel"
                class="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="+34 600 000 000"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                Tipo de espacio
              </span>
              <select
                class="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Selecciona una opción</option>
                <option>Oficina</option>
                <option>Comercio / escaparate</option>
                <option>Vivienda</option>
                <option>Otro</option>
              </select>
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                Superficie aproximada de cristal
              </span>
              <input
                type="text"
                class="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Ej. 12 m²"
              />
            </label>

            <label class="block md:col-span-2">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                ¿Qué problema quieres resolver?
              </span>
              <select
                class="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Selecciona una opción</option>
                <option>Calor excesivo</option>
                <option>Reflejos en pantallas</option>
                <option>Privacidad</option>
                <option>Protección UV</option>
                <option>Varios problemas</option>
              </select>
            </label>

            <label class="block md:col-span-2">
              <span class="mb-1.5 block text-sm font-semibold text-foreground">
                Mensaje
              </span>
              <textarea
                rows="4"
                class="w-full rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Cuéntanos medidas, orientación, ubicación o cualquier detalle útil."
              />
            </label>
          </div>

          <label class="mt-4 flex items-start gap-3 text-xs leading-5 text-foreground/75">
            <input
              type="checkbox"
              class="mt-1 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/20"
            />
            <span>
              He leído y acepto la
              <NuxtLink
                to="/politica-privacidad"
                target="_blank"
                class="font-semibold text-primary hover:underline"
              >
                política de privacidad </NuxtLink
              >.
            </span>
          </label>

          <button
            type="submit"
            class="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Solicitar presupuesto
          </button>
        </form>
      </div>
    </section>
  </div>
</template>
