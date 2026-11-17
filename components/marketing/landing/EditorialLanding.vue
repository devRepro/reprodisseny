<script setup lang="ts">
import { computed } from 'vue';
import '~/assets/styles/editorial.scss';
import { EDITORIAL_MEDIA, EDITORIAL_FINISH_MEDIA } from '~/shared/data/editorialMedia';
import CmsImage from '~/components/shared/blocks/CmsImage.vue';
import type { CategoryDetailPageDto } from '~/server/services/cms/catalog.service';
import type { EditorialLandingContent } from '~/shared/data/editorialLandings';
import { EDITORIAL_LANDING_PATHS, EDITORIAL_SEO, EDITORIAL_QUOTE_CONTEXTS, PUBLICATIONS_PATH, type EditorialPublication } from '~/shared/seo/editorialRoutes';
import { SITE_SCHEMA_IDS, SITE_URL } from '~/utils/seo/siteIdentity';
import SiteBreadcrumbs from '~/components/shared/SiteBreadcrumbs.vue';
import CategoryHero from '~/components/marketing/category/CategoryHero.vue';
import CommercialSolutions from '~/components/marketing/category/CommercialSolutions.vue';
import ContentSectionShell from '~/components/marketing/content/ContentSectionShell.vue';
import ContentProcessSteps from '~/components/marketing/content/ContentProcessSteps.vue';
import FaqAccordion from '~/components/shared/blocks/FaqAccordion.vue';
import QuoteFormSection from '~/components/marketing/quote/FormSection.vue';
import AppButton from '~/components/shared/button/AppButton.vue';

const props = defineProps<{ publication: EditorialPublication; content: EditorialLandingContent }>();
const { data: category, error } = await useAsyncData(
  'cms:editorial-publications',
  () => $fetch<CategoryDetailPageDto>('/api/cms/category/libros-revistas-catalogos', {
    query: { includeProducts: 0, includeChildren: 0 },
  }),
);
if (error.value || !category.value) throw createError({statusCode: 503, statusMessage: 'No se ha podido cargar la información editorial'});

const seo = computed(() => EDITORIAL_SEO[props.publication]);
const path = computed(() => EDITORIAL_LANDING_PATHS[props.publication]);
const canonical = computed(() => new URL(path.value, SITE_URL).href);
const quoteContext = computed(() => EDITORIAL_QUOTE_CONTEXTS[props.publication]);
const products = computed(() => category.value?.commercialProducts || []);
const heroImage = computed(() => {
  const selection = EDITORIAL_MEDIA[props.publication];
  const image = products.value.find(item => item.slug === selection.slug)?.image;
  return image && 'alt' in selection ? {...image, alt: selection.alt} : image;
});
const finishImage = computed(() => category.value?.detailGallery?.find(item => item.role === EDITORIAL_FINISH_MEDIA.role));
const hero = computed(() => ({
  title: props.content.title,
  description: props.content.description,
  heroKicker: 'Impresión editorial y corporativa',
  image: heroImage.value || category.value?.image,
}));
const commercial = computed(() => ({
  ...props.content.commercial,
  facts: category.value?.commercialJson?.facts,
}));
const breadcrumbs = computed(() => [
  {label: 'Inicio', to: '/'},
  {label: 'Publicaciones', to: PUBLICATIONS_PATH},
  {label: `Impresión de ${props.content.label.toLowerCase()}`},
]);
const schema = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${canonical.value}#webpage`, url: canonical.value,
      name: seo.value.title, description: seo.value.description, inLanguage: 'es-ES',
      isPartOf: {'@id': SITE_SCHEMA_IDS.website},
      mainEntity: {'@id': `${canonical.value}#service`},
      breadcrumb: {'@id': `${canonical.value}#breadcrumb`},
      ...(hero.value.image?.src ? {image: hero.value.image.src} : {}),
    },
    {
      '@type': 'Service', '@id': `${canonical.value}#service`,
      name: quoteContext.value.productName, url: canonical.value,
      description: seo.value.description, provider: {'@id': SITE_SCHEMA_IDS.organization},
    },
    {
      '@type': 'BreadcrumbList', '@id': `${canonical.value}#breadcrumb`,
      itemListElement: breadcrumbs.value.map((item, index) => ({
        '@type': 'ListItem', position: index + 1, name: item.label,
        item: new URL(item.to || path.value, SITE_URL).href,
      })),
    },
    {
      '@type': 'FAQPage', '@id': `${canonical.value}#faq`,
      mainEntity: props.content.faqs.map(item => ({
        '@type': 'Question', name: item.question,
        acceptedAnswer: {'@type': 'Answer', text: item.answer},
      })),
    },
  ],
}));
useSeoMeta({
  title: () => seo.value.title, description: () => seo.value.description,
  ogTitle: () => seo.value.title, ogDescription: () => seo.value.description,
  ogUrl: () => canonical.value, ogImage: () => hero.value.image?.src,
  ogType: 'website', twitterCard: 'summary_large_image',
});
useHead(() => ({
  link: [{rel: 'canonical', href: canonical.value}],
  script: [{id: 'editorial-landing-jsonld', type: 'application/ld+json', textContent: JSON.stringify(schema.value).replace(/</g, '\\u003c')}],
}));
</script>

<template>
  <main class="min-h-screen bg-background category-page-bottom editorial-page">
    <div class="container-content pt-4 pb-2 md:pt-6 md:pb-3">
      <SiteBreadcrumbs :items="breadcrumbs" :auto="false" :json-ld="false" />
    </div>
    <div class="category-page-flow">
      <CategoryHero
        :category="hero"
        variant="commercial"
        :primary-cta="{label: 'Solicitar presupuesto', to: '#presupuesto-editorial'}"
        :secondary-cta="{label: publication === 'catalogos' ? 'Ver tipos de catálogos' : 'Ver tipos de revistas', to: `#${content.commercial.anchorId}`}"
      />
      <CommercialSolutions :commercial-config="commercial" :commercial-products="products" />
      <ContentSectionShell
        v-for="section in content.sections"
        :id="section.id"
        :key="section.id"
        :eyebrow="section.eyebrow"
        :title="section.title"
        :description="section.description"
        intro-class="max-w-3xl"
      >
        <div :class="publication === 'catalogos' && section.id === 'acabados' && finishImage ? 'grid gap-7 lg:grid-cols-2 lg:items-start' : ''">
          <ul class="commercial-cluster-use-cases__list" :class="publication === 'catalogos' && section.id === 'acabados' && finishImage ? 'lg:grid-cols-1' : ''">
            <li v-for="item in section.items" :key="item.title" class="commercial-cluster-use-cases__item">
              <h3 class="commercial-cluster-use-cases__item-title">{{ item.title }}</h3>
              <p class="commercial-cluster-use-cases__item-description">{{ item.description }}</p>
            </li>
          </ul>
          <figure v-if="publication === 'catalogos' && section.id === 'acabados' && finishImage" class="m-0 overflow-hidden rounded-lg border border-border/70 bg-muted/30">
            <CmsImage :src="finishImage.src" :alt="EDITORIAL_FINISH_MEDIA.alt" :width="1200" :height="1200" class="aspect-[4/3] w-full object-cover" />
          </figure>
        </div>
      </ContentSectionShell>
      <ContentSectionShell
        eyebrow="Proceso de producción"
        title="Del archivo a la publicación terminada"
        description="Te acompañamos en las decisiones técnicas y revisamos las características del trabajo antes de imprimir."
        section-class="category-process-editorial"
      >
        <ContentProcessSteps :steps="content.process" grid-class="category-process-steps" card-class="category-process-step" />
        <NuxtLink to="/como-preparar-archivos" class="commercial-cluster-product-link">Consultar la guía de preparación de archivos →</NuxtLink>
      </ContentSectionShell>
      <ContentSectionShell
        eyebrow="Dudas de producción"
        :title="`Preguntas frecuentes sobre impresión de ${content.label.toLowerCase()}`"
        density="compact"
        intro-spacing="tight"
      >
        <FaqAccordion :items="content.faqs" variant="editorial" />
      </ContentSectionShell>
      <ContentSectionShell
        id="presupuesto-editorial"
        eyebrow="Presupuesto editorial"
        :title="`Solicita presupuesto para imprimir ${content.label.toLowerCase()}`"
        :description="content.quoteDescription"
        section-class="commercial-cluster-final-cta scroll-mt-28"
        intro-class="max-w-3xl"
      >
        <div class="max-w-2xl">
          <QuoteFormSection v-bind="quoteContext" />
        </div>
      </ContentSectionShell>
      <div class="container-content flex flex-wrap gap-4 py-8">
        <AppButton :to="PUBLICATIONS_PATH" variant="outline">Ver todas las soluciones editoriales</AppButton>
        <AppButton
          :to="EDITORIAL_LANDING_PATHS[publication === 'catalogos' ? 'revistas' : 'catalogos']"
          variant="ghost"
        >{{ publication === 'catalogos' ? 'Impresión de revistas' : 'Impresión de catálogos' }}</AppButton>
      </div>
    </div>
  </main>
</template>
