<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "#imports";
import { Check, ChevronRight, Loader2, Phone, X } from "lucide-vue-next";
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
  title: "Tot llest per a l’inici de curs",
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
  { label: "CIC Escola Batxillerats", src: "/img/ui/ld/centres-educatius/logos/cic.svg" },
  { label: "EADA Business School", src: "/img/ui/ld/centres-educatius/logos/eada.svg" },
  { label: "Salesians", src: "/img/ui/ld/centres-educatius/logos/salesians.svg" },
  { label: "UAB", src: "/img/ui/ld/centres-educatius/logos/uab.svg" },
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
  <img
    :src="hero.image"
    :alt="hero.alt"
    class="education-hero__image"
    fetchpriority="high"
    loading="eager"
    decoding="async"
  />

  <div class="education-hero__inner">
    <div class="education-hero__claim">
      <h1 id="education-hero-title" class="education-hero__title">
        {{ hero.title }}
      </h1>

      <p class="education-hero__text">
        {{ hero.description }}
      </p>

      <div class="education-hero__row">
        <button type="button" class="education-button" @click="scrollToQuote">
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
            <img
              :src="service.image"
              :alt="service.alt"
              class="education-service-card__image"
              loading="lazy"
              decoding="async"
            />

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

            <ChevronRight
              v-if="index < steps.length - 1"
              class="education-step__arrow"
              aria-hidden="true"
            />
          </template>
        </div>
      </div>
    </section>

    <section class="education-trust" aria-labelledby="education-trust-title">
      <div class="education-container education-trust__grid">
        <img
          :src="landingMedia('taller-reprodisseny.webp')"
          alt="Equip de producció de Repro Disseny preparant material imprès"
          class="education-trust__image"
          loading="lazy"
          decoding="async"
        />

        <div class="education-trust__content">
          <h2 id="education-trust-title" class="education-title education-title--xs">
            Per què Repro Disseny?
          </h2>

          <p class="education-trust__lead">
            Fa més de 40 anys que ajudem a centres educatius per arribar preparats a l’inici de curs.
          </p>

          <ul class="education-trust__list" role="list">
            <li v-for="reason in reasons" :key="reason">
              <Check class="education-trust__icon" aria-hidden="true" />
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
          <div v-for="logo in logos" :key="logo.label" class="education-logo-item">
            <img
              :src="logo.src"
              :alt="logo.label"
              class="education-logo-item__image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="education-faq-section" aria-labelledby="education-faq-title">
  <h2 id="education-faq-title" class="education-faq-section__title">
    FAQS
  </h2>

  <EducationFaqs
    :items="faqs"
    :default-open="true"
    :show-title="false"
  />
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
        <EducationQuoteForm
  locale="ca"
  product-name="Material gràfic i senyalística per a centres educatius"
  product-slug="centres-educatius"
  category-slug="publicaciones"
/>
        
      </div>
    </section>

  
  </div>
</template>

<style scoped>
.education-page {
  --edu-frame: var(--lp-frame, 1441px);
  --edu-pad-left: var(--lp-pad-left, 220px);
  --edu-pad-right: var(--lp-pad-right, 210px);

  --edu-primary: hsl(var(--brand-base));
  --edu-primary-dark: hsl(var(--brand-base-dark));
  --edu-primary-card: hsl(var(--brand-base));
  --edu-light: hsl(var(--brand-base-light));
  --edu-sand: hsl(var(--brand-bg-2));
  --edu-ink: hsl(var(--brand-ink-dark));
  --edu-muted: hsl(var(--brand-ink-medium));
  --edu-white: hsl(var(--brand-white));
  --edu-error: hsl(var(--brand-error));
  --edu-radius: var(--radius, 0.5rem);

  width: 100%;
  max-width: var(--edu-frame);
  min-height: 100vh;
  margin-inline: auto;
  overflow: hidden;
  background: var(--edu-white);
  color: var(--edu-ink);
  font-family: Figtree, var(--font-sans);
  font-size: var(--font-body);
  line-height: var(--line-body);
}

.education-container {
  width: min(100% - 48px, 1200px);
  margin-inline: auto;
}

.education-container--process {
  max-width: 1120px;
}

.education-container--logos {
  max-width: 960px;
}

.education-container--faq,
.education-container--form {
  max-width: 740px;
}

.education-title {
  margin: 0;
  color: var(--edu-ink);
  font-family: Figtree, var(--font-sans);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  text-align: center;
}

.education-title--sm {
  font-size: 36px;
}

.education-title--xs {
  font-size: 30px;
  text-align: left;
}

/* HERO — Figma: frame 1441px, capçalera alineada a 220px */
.education-hero {
  position: relative;
  isolation: isolate;
  height: 520px;
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
  object-position: center center;
}

.education-hero__inner {
  position: relative;
  width: 100%;
  max-width: var(--edu-frame);
  height: 100%;
  margin-inline: auto;
  padding-left: var(--edu-pad-left);
  padding-right: var(--edu-pad-right);
}

.education-hero__claim {
  position: absolute;
  top: 48px;
  left: var(--edu-pad-left);
  width: 700px;
  max-width: calc(100% - var(--edu-pad-left) - var(--edu-pad-right));
  border-radius: 16px;
  background: rgb(255 255 255 / 0.86);
  padding: 32px 38px 28px;
  box-shadow: 0 18px 48px rgb(0 0 0 / 0.12);
  backdrop-filter: blur(2px);
}

.education-hero__title {
  width: 620px;
  max-width: 100%;
  margin: 0;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 50px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
}

.education-hero__text {
  width: 620px;
  max-width: 100%;
  margin: 18px 0 0;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 24px;
  font-weight: 400;
  line-height: 1.18;
  letter-spacing: 0;
}

.education-hero__row {
  display: flex;
  align-items: center;
  gap: 72px;
  margin-top: 22px;
}

.education-button {
  display: inline-flex;
  min-width: 176px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 7px;
  background: var(--edu-primary);
  padding: 0 24px;
  color: var(--edu-white);
  font-family: Figtree, var(--font-sans);
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.education-button:hover {
  background: var(--edu-primary-dark);
  box-shadow: 0 12px 26px hsl(var(--brand-base-dark) / 0.22);
  transform: translateY(-1px);
}

.education-hero__phone {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #8da0b4;
  font-family: Figtree, var(--font-sans);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  opacity: 0.76;
}

.education-hero__phone-icon {
  width: 22px;
  height: 22px;
  color: #8da0b4;
  stroke-width: 2;
}

.education-hero__note {
  margin: 22px 0 0;
  color: var(--edu-primary);
  font-family: Figtree, var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
}

/* PUNTOS DE DOLOR — Figma: títol 36/700, ítems 28/500 */
.education-problems {
  background: var(--edu-white);
  padding: 86px 0 104px;
}

.education-problems__inner {
  width: min(100% - 48px, 1012px);
  margin-inline: auto;
}

.education-problems__title {
  width: 100%;
  margin: 0;
  color: #1e1e1e;
  font-family: Figtree, var(--font-sans);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  text-align: center;
}

.education-problems__list {
  display: grid;
  gap: 34px;
  width: fit-content;
  max-width: 100%;
  margin: 78px auto 0;
  padding: 0;
  list-style: none;
}

.education-problems__item {
  display: grid;
  grid-template-columns: 40px minmax(0, 654px);
  align-items: center;
  column-gap: 28px;
  color: #212121;
}

.education-problems__icon {
  width: 32px;
  height: 32px;
  justify-self: center;
  color: #e00000;
  stroke-width: 3.8;
}

.education-problems__text {
  display: block;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 28px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0;
}

/* SERVICIOS — Figma: cards 400px, bloc text 400x239, gap vertical 16px */
.education-services {
  background: var(--edu-light);
  padding: 82px 0 86px;
}

.education-container--services {
  width: min(100% - 48px, 920px);
  max-width: 920px;
  margin-inline: auto;
}

.education-services__title {
  margin: 0;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  text-align: center;
}

.education-services__grid {
  display: grid;
  grid-template-columns: repeat(2, 400px);
  justify-content: center;
  gap: 72px;
  margin-top: 52px;
}

.education-service-card {
  width: 400px;
}

.education-service-card__image {
  display: block;
  width: 400px;
  height: 280px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: none;
}

.education-service-card__title {
  margin: 16px 0 0;
  color: hsl(var(--brand-base-dark));
  font-family: Figtree, var(--font-sans);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0;
  text-transform: uppercase;
}

.education-service-card__subtitle {
  margin: 16px 0 0;
  color: hsl(var(--brand-base-dark));
  font-family: Figtree, var(--font-sans);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0;
}

.education-service-card__bullets {
  display: grid;
  gap: 12px;
  margin: 16px 0 0;
  padding-left: 18px;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0;
}

.education-service-card__bullets li::marker {
  font-size: 0.7em;
}

/* PROCESO */
.education-process {
  background: var(--edu-primary-dark);
  padding: 62px 0 76px;
  color: var(--edu-white);
}

.education-process__title {
  margin: 0;
  text-align: center;
  color: var(--edu-white);
  font-family: Figtree, var(--font-sans);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
}

.education-process__grid {
  display: grid;
  grid-template-columns: 1fr 32px 1fr 32px 1fr;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.education-step {
  min-height: 164px;
  border-radius: var(--edu-radius);
  background: var(--edu-primary-card);
  padding: 25px 28px;
  box-shadow: 0 20px 40px rgb(0 0 0 / 16%);
}

.education-step__number {
  margin: 0;
  color: var(--edu-white);
  font-size: 25px;
  font-weight: 900;
  line-height: 1;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

.education-step__title {
  margin: 23px 0 0;
  color: var(--edu-white);
  font-size: 16px;
  font-weight: 900;
  line-height: 1.18;
}

.education-step__text {
  margin: 14px 0 0;
  color: rgb(255 255 255 / 86%);
  font-size: var(--font-label-s);
  line-height: var(--line-label-s);
}

.education-step__arrow {
  justify-self: center;
  width: 20px;
  height: 20px;
  color: rgb(255 255 255 / 70%);
}

/* CONFIANZA */
.education-trust {
  background: var(--edu-white);
  padding: 82px 0;
}

.education-trust__grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  align-items: center;
  gap: 70px;
  max-width: 1120px;
}

.education-trust__image {
  display: block;
  width: 100%;
  aspect-ratio: 1.45 / 1;
  border-radius: var(--edu-radius);
  object-fit: cover;
  box-shadow: 0 16px 40px rgb(0 0 0 / 10%);
}

.education-trust__lead {
  max-width: 430px;
  margin: 18px 0 0;
  color: var(--edu-ink);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.45;
}

.education-trust__list {
  display: grid;
  gap: 9px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.education-trust__list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--edu-ink);
  font-size: var(--font-label);
  line-height: var(--line-label);
}

.education-trust__icon {
  margin-top: 2px;
  width: 13px;
  height: 13px;
  color: var(--edu-primary-dark);
  stroke-width: 3;
}

/* LOGOS */
.education-logos {
  background: var(--edu-sand);
  padding: 60px 0 58px;
}

.education-logos__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 34px 48px;
  margin-top: 40px;
}

.education-logo-item {
  display: grid;
  min-width: 105px;
  min-height: 44px;
  place-items: center;
}

.education-logo-item__image {
  display: block;
  max-width: 135px;
  max-height: 50px;
  object-fit: contain;
}

/* FAQ */
.education-faq {
  background: var(--edu-white);
  padding: 80px 0 104px;
}

.education-faq__list {
  display: grid;
  gap: 28px;
  margin-top: 56px;
}

.education-faq__item {
  overflow: hidden;
  border: 1px solid rgb(0 0 0 / 16%);
  border-radius: var(--edu-radius);
  background: var(--edu-white);
  box-shadow: 0 10px 30px rgb(0 0 0 / 8%);
}

.education-faq__question {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 17px 21px 13px;
  border-bottom: 1px solid rgb(0 0 0 / 24%);
  color: var(--edu-ink);
  font-size: 14px;
  line-height: 1.3;
  cursor: pointer;
  list-style: none;
}

.education-faq__question::-webkit-details-marker {
  display: none;
}

.education-faq__question::after {
  content: "⌃";
  flex: 0 0 auto;
  color: var(--edu-ink);
  font-size: 15px;
  line-height: 1;
}

.education-faq__item:not([open]) .education-faq__question {
  border-bottom: 0;
}

.education-faq__item:not([open]) .education-faq__question::after {
  transform: rotate(180deg);
}

.education-faq__answer {
  margin: 0;
  padding: 13px 21px 18px;
  color: var(--edu-ink);
  font-size: var(--font-label-s);
  line-height: var(--line-label-s);
}

/* FORM */
.education-contact {
  background: var(--edu-light);
  padding: 70px 0 72px;
}

.education-contact__heading {
  text-align: center;
}

.education-contact__heading p {
  margin: 18px 0 38px;
  color: #2b2b2b;
  font-size: var(--font-label);
  line-height: var(--line-label);
}

.education-form,
.education-success {
  width: min(100%, 480px);
  margin-inline: auto;
}

.education-form {
  display: grid;
  gap: 11px;
}

.education-form__field {
  display: grid;
  gap: 4px;
  color: var(--edu-ink);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}

.education-form__field input,
.education-form__field textarea {
  width: 100%;
  min-height: 30px;
  border: 1px solid rgb(0 0 0 / 36%);
  border-radius: 4px;
  background: var(--edu-white);
  padding: 5px 8px;
  color: var(--edu-ink);
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.education-form__field textarea {
  resize: vertical;
}

.education-form__field input:focus,
.education-form__field textarea:focus {
  border-color: var(--edu-primary);
  box-shadow: 0 0 0 3px rgb(0 118 179 / 16%);
}

.education-form__privacy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 2px;
  color: var(--edu-ink);
  font-size: 11px;
  line-height: 1.35;
}

.education-form__privacy input {
  margin-top: 1px;
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
}

.education-form__privacy a {
  color: var(--edu-primary-dark);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.education-form__submit,
.education-success__button {
  display: inline-flex;
  width: min(100%, 390px);
  min-height: 39px;
  align-items: center;
  justify-content: center;
  justify-self: center;
  border: 0;
  border-radius: var(--edu-radius);
  background: var(--edu-primary);
  color: var(--edu-white);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 160ms ease, transform 160ms ease, opacity 160ms ease;
}

.education-form__submit:hover,
.education-success__button:hover {
  background: var(--edu-primary-dark);
  transform: translateY(-1px);
}

.education-form__submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.education-form__loader {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  animation: education-spin 900ms linear infinite;
}

.education-form__error {
  border: 1px solid rgb(185 28 28 / 24%);
  border-radius: var(--edu-radius);
  background: rgb(254 226 226 / 70%);
  padding: 9px 11px;
  color: #991b1b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.education-form__honeypot {
  display: none;
}

.education-success {
  border-radius: 12px;
  background: rgb(255 255 255 / 70%);
  padding: 28px 24px;
  text-align: center;
}

.education-success h3 {
  margin: 0;
  color: var(--edu-primary-dark);
  font-size: 18px;
  font-weight: 900;
}

.education-success p {
  margin: 10px 0 0;
  color: var(--edu-ink);
  font-size: var(--font-label);
  line-height: var(--line-label);
}

.education-success__reference {
  font-weight: 800;
}

.education-success__button {
  margin-top: 18px;
}

@keyframes education-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tablets: conserva proporcions sense trencar el disseny */
@media (max-width: 1200px) {
  .education-page {
    --edu-pad-left: 80px;
    --edu-pad-right: 80px;
  }

  .education-hero__claim {
    width: 700px;
  }
}

@media (max-width: 900px) {
  .education-page {
    --edu-pad-left: 32px;
    --edu-pad-right: 32px;
  }

  .education-hero__claim {
    max-width: calc(100% - var(--edu-pad-left) - var(--edu-pad-right));
  }

  .education-services__grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .education-service-card,
  .education-service-card__image {
    width: 100%;
    max-width: 400px;
  }

  .education-service-card {
    margin-inline: auto;
  }

  .education-service-card__image {
    height: auto;
    aspect-ratio: 400 / 280;
  }
}

@media (max-width: 767px) {
  .education-container {
    width: min(100% - 32px, 560px);
  }

  .education-page {
    --edu-pad-left: 16px;
    --edu-pad-right: 16px;
  }

  .education-hero {
    height: 650px;
  }

  .education-hero__image {
    object-position: 58% center;
  }

  .education-hero__inner {
    width: 100%;
    max-width: none;
    padding-left: var(--edu-pad-left);
    padding-right: var(--edu-pad-right);
  }

  .education-hero__claim {
    top: auto;
    bottom: 32px;
    left: var(--edu-pad-left);
    width: auto;
    max-width: calc(100% - var(--edu-pad-left) - var(--edu-pad-right));
    border-radius: 16px;
    padding: 28px 22px 24px;
  }

  .education-hero__title {
    width: 100%;
    font-size: 34px;
    line-height: 1.05;
    white-space: normal;
  }

  .education-hero__text {
    width: 100%;
    margin-top: 18px;
    font-size: 17px;
    line-height: 1.25;
  }

  .education-hero__row {
    gap: 16px;
    margin-top: 24px;
  }

  .education-button {
    min-width: 0;
    min-height: 46px;
    padding-inline: 22px;
    font-size: 14px;
  }

  .education-hero__phone {
    font-size: 14px;
  }

  .education-hero__phone-icon {
    width: 18px;
    height: 18px;
  }

  .education-hero__note {
    margin-top: 20px;
    font-size: 13px;
  }

  .education-problems {
    padding: 56px 0 64px;
  }

  .education-problems__inner {
    width: min(100% - 32px, 560px);
  }

  .education-problems__title,
  .education-services__title,
  .education-process__title {
    font-size: 28px;
    line-height: 1.2;
  }

  .education-problems__list {
    gap: 24px;
    margin-top: 42px;
  }

  .education-problems__item {
    grid-template-columns: 30px 1fr;
    column-gap: 16px;
  }

  .education-problems__icon {
    width: 24px;
    height: 24px;
  }

  .education-problems__text {
    font-size: 20px;
    line-height: 1.3;
  }

  .education-services {
    padding: 56px 0 64px;
  }

  .education-container--services {
    width: min(100% - 32px, 560px);
    max-width: 560px;
  }

  .education-services__grid {
    grid-template-columns: 1fr;
    gap: 42px;
    margin-top: 40px;
  }

  .education-service-card {
    width: 100%;
    max-width: none;
  }

  .education-service-card__image {
    width: 100%;
    max-width: none;
    height: auto;
    aspect-ratio: 400 / 280;
  }

  .education-service-card__title {
    margin-top: 20px;
    font-size: 22px;
  }

  .education-service-card__subtitle {
    margin-top: 12px;
    font-size: 18px;
  }

  .education-service-card__bullets {
    gap: 10px;
    margin-top: 18px;
    font-size: 15px;
  }

  .education-trust,
  .education-logos,
  .education-faq,
  .education-contact {
    padding-block: 56px;
  }

  .education-trust__grid,
  .education-process__grid {
    grid-template-columns: 1fr;
  }

  .education-process__grid {
    gap: 18px;
  }

  .education-step__arrow {
    display: none;
  }

  .education-title--xs {
    text-align: center;
  }

  .education-trust__content {
    text-align: center;
  }

  .education-trust__lead {
    margin-inline: auto;
  }

  .education-trust__list li {
    justify-content: center;
  }

  .education-faq__list {
    gap: 18px;
    margin-top: 36px;
  }
  
  .education-faq-section {
    padding: 64px 0 76px;
  }

  .education-faq-section__title {
    margin-bottom: 40px;
    font-size: 28px;
  }
}
</style>
