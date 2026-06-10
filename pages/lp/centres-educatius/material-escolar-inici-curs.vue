<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "#imports";
import { ChevronRight, Phone, X } from "lucide-vue-next";
import { usePriceRequests } from "@/composables/usePriceRequests";
import EducationFaqs from "@/components/marketing/landing/EducationFaqs.vue";
import EducationQuoteForm from "@/components/marketing/landing/EducationQuoteForm.vue";
/**
 * Si este archivo vive en pages/centros-educativos.vue, deja el alias.
 * Si lo pegas directamente en pages/ensenyament.vue, puedes cambiar el alias a ["/centros-educativos"] o eliminarlo.
 */
definePageMeta({
  layout: "pd"
});

const route = useRoute();
const { sendPriceRequest, isLoading, error } = usePriceRequests();

/**
 * Base pública de imágenes.
 *
 * Ahora queda operativa contra Blob Storage. Cuando confirmes el hostname del CDN,
 * cambia SOLO esta constante. Ejemplos habituales:
 * - Si el CDN conserva /media en la URL: "https://cdn.reprodisseny.com/media"
 * - Si el CDN ya apunta al contenedor media: "https://cdn.reprodisseny.com"
 */
const MEDIA_BASE_URL = "https://webcms.blob.core.windows.net/media";
const LANDING_MEDIA_PATH = "landing/centros-educativos";
const quoteSectionId = "pressupost-centres-educatius";

function landingMedia(fileName: string) {
  const base = MEDIA_BASE_URL.replace(/\/$/, "");
  const file = fileName.replace(/^\//, "");
  return `${base}/${LANDING_MEDIA_PATH}/${file}`;
}

const hero = {
  title: "Material escolar personalitzat\nper a escoles",
  description:
    "Produïm i instal·lem la senyalística del vostre centre i tot el material didàctic que necessitareu per al nou curs.",
  image: landingMedia("hero.webp"),
  alt: "Material didàctic i senyalística preparats per a l’inici de curs",
};

const problems = [
  "Sense poder lliurar els apunts el primer dia de classe",
  "La senyalística del centre sense actualitzar",
  "Les presses d’última hora que ho encareixen tot",
];

const services = [
  {
    title: "MATERIAL DIDÀCTIC",
    subtitle: "Tot a punt per al primer dia de classe",
    image: landingMedia("materials-didactics.webp"),
    alt: "Quaderns, dossiers, llibres i material didàctic imprès",
    bullets: [
      "Llibres, revistes, dossiers i carpetes",
      "Exàmens i exercicis",
      "Agendes, guies i horaris",
      "Jocs educatius personalitzats",
    ],
  },
  {
    title: "SENYALÍSTICA D’ESPAIS",
    subtitle: "Menys preguntes, més fluïdesa",
    image: landingMedia("senyalistica.webp"),
    alt: "Senyalística interior per a aules, passadissos i espais escolars",
    bullets: [
      "Vinils",
      "Plaques de senyalització",
      "Cartells informatius",
      "Senyalització interior i exterior",
    ],
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Ens expliques què necessiteu",
    text: "Sense formularis llargs, sense compromís.",
  },
  {
    number: "02",
    title: "Preparem la teva comanda",
    text: "Producció pròpia, terminis clars i ajustats.",
  },
  {
    number: "03",
    title: "Ho tindràs tot a temps",
    text: "Entrega abans de l’inici de curs.",
  },
] as const;

const reasons = [
  "Assessorament tècnic personalitzat",
  "Producció i instal·lació amb equip propi",
  "Un únic interlocutor durant tot el procés",
] as const;

const logos = [
  {
    id: "cic",
    label: "CIC Escola Batxillerats",
    src: "/img/ui/ld/centres-educatius/logos/cic.svg",
  },
  {
    id: "eada",
    label: "EADA Business School",
    src: "/img/ui/ld/centres-educatius/logos/eada.svg",
  },
  {
    id: "salesians",
    label: "Salesians",
    src: "/img/ui/ld/centres-educatius/logos/salesians.svg",
  },
  {
    id: "uab",
    label: "UAB Universitat Autònoma de Barcelona",
    src: "/img/ui/ld/centres-educatius/logos/uab.svg",
  },
  {
    id: "cett",
    label: "CETT Barcelona School of Tourism, Hospitality and Gastronomy",
    src: "/img/ui/ld/centres-educatius/logos/cett.svg",
  },
] as const;


const faqs = [
  {
    question: "Podeu imprimir dossiers, quadernets, exàmens, fitxes i material didàctic?",
    answer:
      "Sí, el ventall de possibilitats és molt gran. També podem preparar material per a tutories, activitats o tallers.",
  },
  {
    question: "Feu impressions tant en blanc i negre com en color?",
    answer:
      "Sí. Imprimim tant en blanc i negre com en color, amb acabats adequats segons l’ús: grapat, enquadernat, plastificat o tallat.",
  },
  {
    question: "Feu enquadernacions, plastificats i acabats especials?",
    answer:
      "Sí, podem fer tot tipus de manipulats. Podem enquadernar, plastificar, tallar, plegar, grapar o preparar lots per aula.",
  },
  {
    question: "Ens podeu ajudar a preparar o adaptar els arxius abans d’imprimir?",
    answer:
      "Naturalment. Tenim un equip de preimpressió i disseny que pot revisar els documents, ajustar formats i preparar-los per imprimir correctament.",
  },
  {
    question: "En quin format hem d’enviar els arxius?",
    answer:
      "PDF, JPG, PNG, Word, PowerPoint o altres formats habituals. Si cal, us indicarem el format més adequat per a cada peça.",
  },
  {
    question: "Treballeu amb material per a festes escolars, graduacions o jornades de portes obertes?",
    answer:
      "Sí, podem ajudar a vestir aquests moments amb invitacions, cartelleria, roll-ups, acreditacions, diplomes i altres peces de comunicació.",
  },
  {
    question: "Feu tarifes especials o descomptes per volum per a centres educatius?",
    answer:
      "Sí, tenim uns preus molt competitius per aquest sector i podem millorar cada cas d’acord amb el volum i les condicions.",
  },
] as const;

type QuoteForm = {
  website: string;
  name: string;
  center: string;
  email: string;
  phone: string;
  message: string;
  privacy: boolean;
};

const success = ref(false);
const validationError = ref("");
const submittedReference = ref<string | null>(null);

const form = reactive<QuoteForm>({
  website: "",
  name: "",
  center: "",
  email: "",
  phone: "",
  message: "",
  privacy: false,
});

const sourceUrl = computed(() => {
  const value = import.meta.client ? window.location.href : route.fullPath || "/";
  return String(value).slice(0, 300);
});

const utm = computed(() => {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(route.query || {})) {
    if (!key.toLowerCase().startsWith("utm_")) continue;
    out[key] = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
  }

  return Object.keys(out).length ? out : null;
});

const errorMessage = computed(() => {
  if (validationError.value) return validationError.value;
  if (!error.value) return "";
  return typeof error.value === "string"
    ? error.value
    : "No hem pogut enviar la sol·licitud. Torna-ho a intentar o truca’ns al +34 932 749 890.";
});

function scrollToQuote() {
  if (!import.meta.client) return;
  document.getElementById(quoteSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  form.website = "";
  form.name = "";
  form.center = "";
  form.email = "";
  form.phone = "";
  form.message = "";
  form.privacy = false;
  validationError.value = "";
}

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

function pushLeadEvent(transactionId?: string | number | null) {
  if (!import.meta.client) return;

  const win = window as Window & { dataLayer?: Record<string, unknown>[] };
  win.dataLayer = win.dataLayer || [];

  win.dataLayer.push({
    event: "generate_lead",
    form_name: "landing_ensenyament",
    lead_type: "quote_request",
    page_path: window.location.pathname,
    category_slug: "publicaciones",
    product_slug: "centres-educatius",
    product_name: "Material gràfic i senyalística per a centres educatius",
    transaction_id: transactionId ? String(transactionId) : undefined,
  });
}

async function onSubmit() {
  validationError.value = "";
  error.value = null;

  if (form.website.trim()) {
    success.value = true;
    return;
  }

  if (!form.name.trim()) {
    validationError.value = "Indica el teu nom.";
    return;
  }

  if (!form.center.trim()) {
    validationError.value = "Indica el nom del centre.";
    return;
  }

  if (!isValidEmail(form.email)) {
    validationError.value = "Introdueix un correu electrònic vàlid.";
    return;
  }

  if (!form.phone.trim() || form.phone.trim().length < 9) {
    validationError.value = "Introdueix un telèfon vàlid.";
    return;
  }

  if (!form.message.trim()) {
    validationError.value = "Explica breument quin material necessiteu.";
    return;
  }

  if (!form.privacy) {
    validationError.value = "Has d’acceptar la política de privacitat.";
    return;
  }

  const response = await sendPriceRequest(
    {
      website: null,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.center.trim(),
      message: form.message.trim(),
      categorySlug: "publicaciones",
      product: {
        name: "Material gràfic i senyalística per a centres educatius",
        slug: "centres-educatius",
        sku: null,
        url: sourceUrl.value,
      },
      extras: {
        landing: "ensenyament",
        locale: "ca",
        center: form.center.trim(),
      },
      consent: true,
      sourceUrl: sourceUrl.value,
      utm: utm.value,
      initialStatus: "Nova",
    },
    { file: null, fileKind: "design" }
  );

  const result = response as {
    ok?: boolean;
    duplicated?: boolean;
    itemId?: string | number | null;
    requestKey?: string | null;
    reference?: string | null;
    requestId?: string | null;
    id?: string | number | null;
  } | null;

  if (error.value) return;

  const transactionId =
    result?.reference ||
    result?.requestId ||
    result?.id ||
    result?.itemId ||
    result?.requestKey ||
    null;

  submittedReference.value = transactionId ? String(transactionId) : null;

  if (!result?.duplicated) {
    pushLeadEvent(transactionId);
  }

  success.value = true;
  resetForm();
}

useSeoMeta({
  title: "Material gràfic i senyalística per a centres educatius | Repro Disseny",
  description:
    "Producció i instal·lació de material didàctic, dossiers, quaderns, vinils, cartells i senyalística per a centres educatius. Tot a punt per a l’inici de curs.",
  ogTitle: "Material gràfic i senyalística per a centres educatius | Repro Disseny",
  ogDescription:
    "Material didàctic, senyalística, cartelleria i impressió per a centres educatius. Planifica l’inici de curs amb Repro Disseny.",
  ogImage: hero.image,
});

useHead({
  htmlAttrs: { lang: "ca" },
  link: [
    { rel: "preload", as: "image", href: hero.image },
    { rel: "canonical", href: "https://reprodisseny.com/ensenyament" },
    { rel: "alternate", hreflang: "ca", href: "https://reprodisseny.com/ensenyament" },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Material gràfic i senyalística per a centres educatius",
        provider: {
          "@type": "LocalBusiness",
          name: "Repro Disseny",
          telephone: "+34 932 749 890",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Juan de Mena 19",
            postalCode: "08035",
            addressLocality: "Barcelona",
            addressCountry: "ES",
          },
        },
        areaServed: "Barcelona",
        serviceType: "Impressió i senyalística per a centres educatius",
      }),
    },
  ],
});
</script>

<template>
  <div class="education-page">

    <section class="education-hero" aria-labelledby="education-hero-title">
      <img :src="hero.image" :alt="hero.alt" class="education-hero__image" fetchpriority="high" loading="eager"
        decoding="async" />

      <div class="education-hero__inner">
        <div class="education-hero__claim">
          <h1 id="education-hero-title" class="education-hero__title">
            {{ hero.title }}
          </h1>

          <p class="education-hero__text">
            {{ hero.description }}
          </p>

          <div class="education-hero__row">
            <button type="button" class="education-hero__cta" @click="scrollToQuote">
              Planifiquem-ho junts
            </button>

            <a href="tel:+34932749890" class="education-hero__phone">
              <Phone class="education-hero__phone-icon" aria-hidden="true" />
              <span>+34 932 749 890</span>
            </a>
          </div>

          <p class="education-hero__note">
            Et responem en menys de 24 hores laborables
          </p>
        </div>
      </div>
    </section>

    <section class="education-problems" aria-labelledby="education-problems-title">
      <div class="education-problems__inner">
        <h2 id="education-problems-title" class="education-problems__title">
          Cada any el setembre arriba igual
        </h2>

        <ul class="education-problems__list" role="list">
          <li v-for="item in problems" :key="item" class="education-problems__item">
            <X class="education-problems__icon" aria-hidden="true" />
            <span class="education-problems__text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="education-services" aria-labelledby="education-services-title">
      <div class="education-container education-container--services">
        <h2 id="education-services-title" class="education-services__title">
          Tingues tot el material a punt quan el necessitis
        </h2>

        <div class="education-services__grid">
          <article v-for="service in services" :key="service.title" class="education-service-card">
            <img :src="service.image" :alt="service.alt" class="education-service-card__image" loading="lazy"
              decoding="async" />

            <h3 class="education-service-card__title">{{ service.title }}</h3>
            <p class="education-service-card__subtitle">{{ service.subtitle }}</p>

            <ul class="education-service-card__bullets" role="list">
              <li v-for="bullet in service.bullets" :key="bullet">{{ bullet }}</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section class="education-process" aria-labelledby="education-process-title">
      <div class="education-container education-container--process">
        <h2 id="education-process-title" class="education-process__title">Així de fàcil</h2>

        <div class="education-process__grid">
          <template v-for="(step, index) in steps" :key="step.number">
            <article class="education-step">
              <p class="education-step__number">{{ step.number }}</p>
              <h3 class="education-step__title">{{ step.title }}</h3>
              <p class="education-step__text">{{ step.text }}</p>
            </article>

            <ChevronRight v-if="index < steps.length - 1" class="education-step__arrow" aria-hidden="true" />
          </template>
        </div>
      </div>
    </section>

    <section class="education-trust" aria-labelledby="education-trust-title">
      <div class="education-container education-trust__grid">
        <img :src="landingMedia('repro.webp')" alt="Equip de producció de Repro Disseny preparant material imprès"
          class="education-trust__image" loading="lazy" decoding="async" />

        <div class="education-trust__content">
          <h2 id="education-trust-title" class="education-title education-title--xs">
            Per què Repro Disseny?
          </h2>

          <p class="education-trust__lead">
            Fa més de 40 anys que ajudem a centres educatius per arribar preparats a l’inici de curs.
          </p>

          <ul class="education-trust__list" role="list">
            <li v-for="reason in reasons" :key="reason">
              <span>{{ reason }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="education-logos" aria-labelledby="education-logos-title">
      <div class="education-container education-container--logos">
        <h2 id="education-logos-title" class="education-title education-title--sm">
          Centres que ja confien en nosaltres
        </h2>

        <div class="education-logos__row" aria-label="Logotips de centres clients">
          <div v-for="logo in logos" :key="logo.id" class="education-logo-item"
            :class="`education-logo-item--${logo.id}`">
            <img :src="logo.src" :alt="logo.label" class="education-logo-item__image" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </section>

    <section class="education-faq-section" aria-labelledby="education-faq-title">
      <h2 id="education-faq-title" class="education-faq-section__title">
        FAQS
      </h2>

      <EducationFaqs :items="faqs" :default-open="true" :show-title="false" />
    </section>

    <section :id="quoteSectionId" class="education-contact" aria-labelledby="education-contact-title">
      <div class="education-container education-container--form">
        <div class="education-contact__heading">
          <h2 id="education-contact-title" class="education-title education-title--sm">
            A punt per a l’inici de curs?
          </h2>
          <p>Explica’ns què necessites i et prepararem una proposta. Sense esperes.</p>
        </div>

        <div v-if="success" class="education-success" role="status">
          <h3>Sol·licitud enviada correctament</h3>
          <p>
            Hem rebut la teva petició. Ens posarem en contacte amb tu en menys de 24 hores laborables.
          </p>
          <p v-if="submittedReference" class="education-success__reference">
            Referència: {{ submittedReference }}
          </p>
          <button type="button" class="education-success__button" @click="success = false">
            Enviar una altra sol·licitud
          </button>
        </div>
        <EducationQuoteForm locale="ca" product-name="Material gràfic i senyalística per a centres educatius"
          product-slug="centres-educatius" category-slug="publicaciones" />

      </div>
    </section>


  </div>
</template>

<style scoped>
.education-page {
  --edu-container: 1200px;
  --edu-container-sm: 920px;
  --edu-container-xs: 740px;
  --edu-section-y: clamp(56px, 7vw, 104px);
  --edu-section-y-sm: clamp(48px, 6vw, 80px);
  --edu-gap: clamp(24px, 4vw, 48px);
  --edu-radius-lg: 16px;

  min-height: 100vh;
  overflow-x: clip;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.education-page :where(h1, h2, h3, p, ul) {
  margin: 0;
}

.education-page :where(ul) {
  padding: 0;
  list-style: none;
}

.education-container,
.education-problems__inner {
  width: min(100% - 32px, var(--edu-container));
  margin-inline: auto;
}

.education-container--services,
.education-container--logos,
.education-faq-section :deep(.education-faqs),
.education-faq-section :deep(.education-faq),
.education-faq-section :deep([data-faq-list]) {
  width: min(100% - 32px, var(--edu-container-sm));
  margin-inline: auto;
}

.education-container--form {
  max-width: var(--edu-container-xs);
}

.education-title,
.education-problems__title,
.education-services__title,
.education-process__title,
.education-faq-section__title {
  color: hsl(var(--foreground));
  text-align: center;
}

.education-title--xs {
  text-align: left;
}

.education-hero {
  position: relative;
  isolation: isolate;
  min-height: clamp(560px, 52vw, 620px);
  overflow: hidden;
  background: hsl(var(--brand-bg-2));
}

.education-hero__image {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.education-hero__inner {
  display: flex;
  min-height: inherit;
  align-items: flex-start;
  width: min(100% - 32px, var(--edu-container));
  margin-inline: auto;
  padding-block: clamp(40px, 6vw, 72px);
}

.education-hero__claim {
  width: min(100%, 700px);
  border-radius: var(--edu-radius-lg);
  background: hsl(var(--brand-white) / 0.88);
  padding: clamp(24px, 4vw, 38px);
  box-shadow: 0 18px 48px hsl(var(--foreground) / 0.12);
  backdrop-filter: blur(2px);
}

.education-hero__title {
  max-width: 100%;
    white-space: pre-line;
}

.education-hero__text {
  max-width: 620px;
  margin-top: 18px;
  font-size: clamp(var(--font-body), 1.8vw, var(--font-h3));
  line-height: var(--line-h3);
}

.education-hero__row {
  display: grid;
  grid-template-columns: max-content max-content;
  justify-content: space-evenly;
  align-items: center;
  column-gap: clamp(72px, 8vw, 120px);
  margin-top: 24px;
}



.education-hero__cta {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: hsl(var(--brand-base));
  padding: 10px 24px;
  color: hsl(var(--brand-white));
  font-size: var(--font-body);
  font-weight: 500;
  line-height: var(--line-body);
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.education-hero__cta:hover {
  background: hsl(var(--brand-base-dark));
  box-shadow: 0 12px 26px hsl(var(--brand-base-dark) / 0.22);
  transform: translateY(-1px);
}


.education-hero__phone {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: hsl(var(--brand-ink-medium));
  font-size: var(--font-body-s);
  font-weight: var(--weight-body-bold);
  line-height: var(--line-body-s);
  text-decoration: none;
  white-space: nowrap;
}

.education-hero__phone:hover {
  color: hsl(var(--primary));
}

.education-hero__phone-icon {
  width: 22px;
  height: 22px;
  color: hsl(var(--brand-ink-medium));
  stroke-width: 2;
}

.education-hero__note {
  margin-top: 20px;
  color: hsl(var(--primary));
  font-size: var(--font-label-s);
  font-weight: var(--weight-label);
  line-height: var(--line-label-s);
}

.education-problems,
.education-trust,
.education-faq-section {
  padding-block: var(--edu-section-y);
  background: hsl(var(--background));
}

.education-problems__list {
  display: grid;
  gap: clamp(20px, 3vw, 34px);
  width: fit-content;
  max-width: 100%;
  margin: clamp(40px, 5vw, 72px) auto 0;
}

.education-problems__item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  gap: clamp(14px, 2vw, 28px);
}

.education-problems__icon {
  width: 28px;
  height: 28px;
  color: hsl(var(--destructive));
  stroke-width: 3.5;
}

.education-problems__text {
  font-size: clamp(var(--font-h4), 2.1vw, var(--font-h2));
  font-weight: var(--weight-h2);
  line-height: var(--line-h2);
}

.education-services,
.education-contact {
  padding-block: var(--edu-section-y-sm);
  background: hsl(var(--accent));
}

.education-services__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 400px));
  justify-content: center;
  gap: var(--edu-gap);
  margin-top: clamp(36px, 5vw, 56px);
}

.education-service-card {
  min-width: 0;
}

.education-service-card__image,
.education-trust__image {
  display: block;
  width: 100%;
  border-radius: var(--radius);
  object-fit: cover;
  object-position: center;
}

.education-service-card__image {
  aspect-ratio: 10 / 7;
}

.education-service-card__title {
  margin-top: 20px;
  color: hsl(var(--brand-base-dark));
  font-size: var(--font-h2);
  font-weight: var(--weight-h2);
  line-height: var(--line-h2);
  text-transform: uppercase;
}

.education-service-card__subtitle {
  margin-top: 8px;
  color: hsl(var(--brand-base-dark));
  font-size: var(--font-h3);
  line-height: var(--line-h3);
}

.education-service-card__bullets {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding-left: 1.1rem;
  list-style: disc;
}

.education-service-card__bullets li::marker {
  font-size: 0.72em;
}

.education-process {
  padding-block: var(--edu-section-y-sm) var(--edu-section-y);
  background: hsl(var(--brand-base-dark));
  color: hsl(var(--primary-foreground));
}

.education-process__title {
  color: hsl(var(--primary-foreground));
}

.education-process__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(16px, 2.5vw, 32px);
  max-width: 1000px;
  margin: clamp(32px, 4vw, 48px) auto 0;
}

.education-step {
  min-height: 260px;
  border: 1px solid hsl(var(--brand-white) / 0.14);
  border-radius: 12px;
  background: hsl(var(--brand-base) / 0.35);
  padding: clamp(28px, 4vw, 40px);
  box-shadow: 2px 2px 8px hsl(var(--brand-ink-dark) / 0.18);
}

.education-step__number {
  color: hsl(var(--primary-foreground));
  font-size: var(--font-h2);
  font-weight: var(--weight-h2);
  line-height: var(--line-h2);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 7px;
}

.education-step__title {
  margin-top: 24px;
  color: hsl(var(--primary-foreground));
}

.education-step__text {
  margin-top: 24px;
  color: hsl(var(--primary-foreground));
}

.education-step__arrow {
  width: 24px;
  height: 24px;
  color: hsl(var(--primary-foreground));
}

.education-trust__grid {
  display: grid;
  grid-template-columns: minmax(280px, 400px) minmax(0, 540px);
  align-items: center;
  justify-content: center;
  gap: var(--edu-gap);
}

.education-trust__image {
  aspect-ratio: 400 / 313;
}

.education-trust__lead {
  margin-top: 14px;
  font-size: var(--font-h3);
  font-weight: var(--weight-body-bold);
  line-height: var(--line-h3);
}

.education-trust__list {
  display: grid;
  gap: 16px;
  margin-top: 28px;
}

.education-trust__list li {
  position: relative;
  padding-left: 22px;
  font-size: var(--font-h4);
  line-height: var(--line-h4);
}

.education-trust__list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: hsl(var(--foreground));
}

/* LOGOS — clientes */
.education-logos {
  padding: 84px 0 92px;
  background: hsl(var(--brand-bg-2));
}

.education-container--logos {
  width: min(100% - 48px, 1200px);
  max-width: 1200px;
  margin-inline: auto;
}

.education-logos .education-title--sm {
  margin: 0;
  color: hsl(var(--foreground));
  font-size: var(--font-h1);
  font-weight: var(--weight-h1);
  line-height: var(--line-h1);
  text-align: center;
}

.education-logos__row {
  display: grid;
  grid-template-columns: 220px 165px 170px 230px 280px;
  align-items: center;
  justify-content: center;
  column-gap: 28px;
  margin-top: 64px;
}

.education-logo-item {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
}

.education-logo-item__image {
  display: block;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Ajuste individual por marca */
.education-logo-item--cic .education-logo-item__image {
  max-width: 220px;
  max-height: 88px;
}

.education-logo-item--eada .education-logo-item__image {
  max-width: 165px;
  max-height: 108px;
}

.education-logo-item--salesians .education-logo-item__image {
  max-width: 170px;
  max-height: 118px;
}

.education-logo-item--uab .education-logo-item__image {
  max-width: 230px;
  max-height: 96px;
}

.education-logo-item--cett .education-logo-item__image {
  max-width: 280px;
  max-height: 112px;
}

.education-faq-section :deep(.education-faqs),
.education-faq-section :deep(.education-faq),
.education-faq-section :deep([data-faq-list]) {
  margin-top: clamp(36px, 5vw, 56px);
}

.education-faq-section :deep(.education-faqs__list),
.education-faq-section :deep(.education-faq__list) {
  display: grid;
  gap: 18px;
}

.education-faq-section :deep(details) {
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--card));
  box-shadow: 0 10px 30px hsl(var(--foreground) / 0.08);
}

.education-faq-section :deep(details + details) {
  margin-top: 18px;
}

.education-faq-section :deep(summary) {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 28px 18px;
  color: hsl(var(--card-foreground));
  font-size: var(--font-h4);
  font-weight: var(--weight-h4);
  line-height: var(--line-h4);
  cursor: pointer;
  list-style: none;
}

.education-faq-section :deep(summary::-webkit-details-marker) {
  display: none;
}

.education-faq-section :deep(details[open] summary) {
  border-bottom: 1px solid hsl(var(--border));
}

.education-faq-section :deep(details > p),
.education-faq-section :deep(.education-faq__answer),
.education-faq-section :deep(.education-faqs__answer) {
  padding: 18px 28px 24px;
  color: hsl(var(--card-foreground));
}

.education-contact__heading {
  text-align: center;
}

.education-contact__heading p {
  margin-top: 18px;
  color: hsl(var(--foreground));
  font-size: var(--font-label);
  line-height: var(--line-label);
}

.education-success {
  width: min(100%, 520px);
  margin: 38px auto 0;
  border-radius: 12px;
  background: hsl(var(--brand-white) / 0.72);
  padding: 28px 24px;
  text-align: center;
}

.education-success h3 {
  color: hsl(var(--brand-base-dark));
  font-size: var(--font-h4);
}

.education-success p {
  margin-top: 10px;
  font-size: var(--font-label);
  line-height: var(--line-label);
}

.education-success__reference {
  font-weight: var(--weight-body-bold);
}

.education-success__button {
  margin-top: 18px;
}

.education-hero__text,
.education-service-card__bullets,
.education-step__text,
.education-faq-section :deep(details > p),
.education-faq-section :deep(.education-faq__answer),
.education-faq-section :deep(.education-faqs__answer) {
  font-size: var(--font-body);
  line-height: var(--line-body);
}

.education-hero__phone,
.education-contact__heading p {
  font-size: var(--font-body-s);
  line-height: var(--line-body-s);
}

.education-service-card__title,
.education-step__number,
.education-step__title {
  font-size: var(--font-h3);
  line-height: var(--line-h3);
}

.education-service-card__subtitle,
.education-trust__lead,
.education-problems__text,
.education-faq-section :deep(summary) {
  font-size: var(--font-h4);
  line-height: var(--line-h4);
}

.education-faq-section :deep(summary) {
  min-height: 56px;
  padding: 17px 20px 15px;
}

.education-faq-section :deep(details > p),
.education-faq-section :deep(.education-faq__answer),
.education-faq-section :deep(.education-faqs__answer) {
  padding: 14px 20px 18px;
}

.education-hero__row {
  display: flex;
  align-items: center;
  gap: clamp(28px, 7vw, 88px);
  margin-top: 24px;
}

.education-hero__cta {
  min-height: 46px;
  width: fit-content;
}

.education-hero__phone {
  font-size: var(--font-body-s);
}

.education-hero__phone-icon {
  width: 18px;
  height: 18px;
}


/* LOGOS — responsive */
@media (max-width: 1180px) {
  .education-logos__row {
    grid-template-columns: repeat(3, minmax(150px, 220px));
    row-gap: 42px;
    column-gap: 48px;
  }

  .education-logo-item--cett {
    grid-column: 2 / span 2;
  }

  .education-logo-item--cett .education-logo-item__image {
    max-width: 300px;
  }
}

@media (max-width: 767px) {
  .education-logos {
    padding: 56px 0 64px;
  }

  .education-container--logos {
    width: min(100% - 32px, 560px);
  }

  .education-logos .education-title--sm {
    font-size: var(--font-h2);
    line-height: var(--line-h2);
  }

  .education-logos__row {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    row-gap: 32px;
    column-gap: 28px;
    margin-top: 40px;
  }

  .education-logo-item--cic .education-logo-item__image {
    max-width: 170px;
  }

  .education-logo-item--eada .education-logo-item__image {
    max-width: 132px;
  }

  .education-logo-item--salesians .education-logo-item__image {
    max-width: 138px;
  }

  .education-logo-item--uab .education-logo-item__image {
    max-width: 170px;
  }

  .education-logo-item--cett {
    grid-column: 1 / -1;
  }

  .education-logo-item--cett .education-logo-item__image {
    max-width: 300px;
  }
}


@media (max-width: 900px) {
  .education-hero__inner {
    align-items: flex-end;
  }

  .education-hero__claim {
    width: 100%;
  }

  .education-services__grid,
  .education-process__grid,
  .education-trust__grid {
    grid-template-columns: 1fr;
  }

  .education-service-card {
    max-width: 440px;
    margin-inline: auto;
  }

  .education-step {
    width: min(100%, 360px);
    min-height: auto;
    margin-inline: auto;
  }

  .education-step__arrow {
    display: none;
  }

  .education-trust__image {
    max-width: 440px;
    margin-inline: auto;
  }
}

@media (max-width: 767px) {
  .education-page {
    --edu-section-y: 64px;
    --edu-section-y-sm: 56px;
  }

  .education-hero {
    min-height: 650px;
  }

  .education-hero__image {
    object-position: 58% center;
  }

  .education-hero__claim {
    padding: 28px 22px 24px;
  }

  .education-hero__title,
  .education-problems__title,
  .education-services__title,
  .education-process__title,
  .education-faq-section__title,
  .education-title--sm,
  .education-title--xs {
    font-size: var(--font-h2);
    line-height: var(--line-h2);
  }

  .education-hero__title {
    white-space: normal;
  }
}

@media (max-width: 480px) {
  .education-hero__row {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
</style>
