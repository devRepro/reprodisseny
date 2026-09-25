<script setup lang="ts">
import { computed } from "vue";

import CmsImage from "@/components/shared/blocks/CmsImage.vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import type { CommercialCategoryConfig, CommercialSolutionGroup } from "~/server/services/cms/catalog.service";

type ProductLike = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  image?: { src?: string | null; alt?: string | null; width?: number | null; height?: number | null } | null;
  imageSrc?: string | null;
};

type ResolvedCommercialProduct = {
  slug: string;
  title: string;
  path: string;
  description: string;
  image: { src: string; alt: string; width?: number; height?: number };
};

type ResolvedCommercialSolution = CommercialSolutionGroup & { primaryProduct: ResolvedCommercialProduct | null; products: ResolvedCommercialProduct[] };

const props = withDefaults(defineProps<{
  commercialConfig?: CommercialCategoryConfig | null;
  commercialProducts?: ProductLike[] | null;
  products?: ProductLike[] | null;
  relatedProducts?: ProductLike[] | null;
}>(), {
  commercialConfig: null,
  commercialProducts: () => [],
  products: () => [],
  relatedProducts: () => [],
});

const config = computed(() => props.commercialConfig);

const commercialFacts = computed(() => config.value?.facts ?? []);
const featuredCommercialFact = computed(() => commercialFacts.value[0] ?? null);
const supportingCommercialFacts = computed(() =>
  commercialFacts.value.slice(1),
);

const runtimeProductsBySlug = computed(() => {
  const map = new Map<string, ProductLike>();
  const items = [...(props.commercialProducts ?? []), ...(props.products ?? []), ...(props.relatedProducts ?? [])];
  for (const item of items) {
    const slug = String(item?.slug || "").trim();
    if (slug && !map.has(slug)) map.set(slug, item);
  }
  return map;
});

const resolvedProductsBySlug = computed(() => {
  const map = new Map<string, ResolvedCommercialProduct>();
  for (const [slug, runtime] of runtimeProductsBySlug.value) {
    const title = String(runtime.title || runtime.name || "").trim();
    const path = String(runtime.path || "").trim();
    const image = runtime.image;
    const imageSrc = String(image?.src || runtime.imageSrc || "").trim();
    if (!title || !path || !imageSrc) continue;
    map.set(slug, {
      slug,
      title,
      path,
      description: String(runtime.shortDescription || runtime.description || "").trim(),
      image: { src: imageSrc, alt: String(image?.alt || title).trim(), width: image?.width ?? undefined, height: image?.height ?? undefined },
    });
  }
  return map;
});

const resolvedSolutions = computed<ResolvedCommercialSolution[]>(() => {
  return (config.value?.solutions?.groups ?? []).map((solution) => {
    const products = solution.productSlugs
      .map((slug) => resolvedProductsBySlug.value.get(slug) ?? null)
      .filter((product): product is ResolvedCommercialProduct => Boolean(product));
    const primaryProduct = resolvedProductsBySlug.value.get(solution.primaryProductSlug) ?? null;
    return { ...solution, products, primaryProduct };
  }).filter((solution) => solution.products.length > 0);
});

const prioritySolution = computed(() => resolvedSolutions.value[0] ?? null);
const secondarySolutions = computed(() => resolvedSolutions.value.slice(1));
const solutionsAnchorId = computed(() => {
  const explicit = String(config.value?.anchorId || "").trim();
  if (explicit) return explicit;
  const target = String(config.value?.hero?.secondaryCta?.to || "");
  return target.startsWith("#") ? target.slice(1) : "soluciones-comerciales";
});

function secondaryProducts(solution: ResolvedCommercialSolution) {
  return solution.products.filter((product) => product.slug !== solution.primaryProduct?.slug);
}
</script>

<template>
  <div v-if="config" class="commercial-cluster">
    <section v-if="commercialFacts.length" class="commercial-cluster-trust" aria-label="Datos de confianza">
      <div class="commercial-cluster-trust__container">
        <dl :class="[
          'commercial-cluster-trust__grid',
          !supportingCommercialFacts.length && 'commercial-cluster-trust__grid--single',
        ]">
          <div v-if="featuredCommercialFact" class="commercial-cluster-trust__featured">
            <dt class="commercial-cluster-trust__featured-label">{{ featuredCommercialFact.label }}</dt>
            <dd class="commercial-cluster-trust__featured-value">{{ featuredCommercialFact.value }}</dd>
          </div>

          <div v-if="supportingCommercialFacts.length" class="commercial-cluster-trust__supporting">
            <div
              v-for="fact in supportingCommercialFacts"
              :key="`${fact.label}-${fact.value}`"
              class="commercial-cluster-trust__item"
            >
              <dt class="commercial-cluster-trust__label">{{ fact.label }}</dt>
              <dd class="commercial-cluster-trust__value">{{ fact.value }}</dd>
            </div>
          </div>
        </dl>
      </div>
    </section>

    <section :id="solutionsAnchorId" class="commercial-cluster-solutions" :aria-label="config?.intro?.title || 'Soluciones comerciales'">
      <div class="commercial-cluster-solutions__container">
        <ContentSectionIntro
          :eyebrow="config?.intro?.eyebrow"
          :title="config?.intro?.title || ''"
          :description="config?.intro?.description || ''"
          :line="false"
          class="commercial-cluster-solutions__intro"
        />

        <article v-if="prioritySolution" class="commercial-cluster-priority" aria-labelledby="commercial-priority-title">
          <div class="commercial-cluster-priority__content">
            <p class="commercial-cluster__eyebrow">{{ prioritySolution.eyebrow }}</p>
            <h3 id="commercial-priority-title" class="commercial-cluster-priority__title">
              {{ prioritySolution.title }}
            </h3>
            <p class="commercial-cluster-priority__description">
              {{ prioritySolution.description }}
            </p>

            <ul v-if="prioritySolution && prioritySolution.products.length > 2" class="commercial-cluster-inline-links" aria-label="Productos complementarios">
              <li
                v-for="product in prioritySolution.products.slice(2)"
                :key="product.slug"
                class="commercial-cluster-inline-links__item"
              >
                <NuxtLink :to="product.path" class="commercial-cluster-inline-links__link">
                  <span>{{ product.title }}</span>
                  <span aria-hidden="true">&rarr;</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="commercial-cluster-priority__products">
            <NuxtLink
              v-for="product in prioritySolution?.products.slice(0, 2) || []"
              :key="product.slug"
              :to="product.path"
              class="commercial-cluster-priority-product"
            >
              <span class="commercial-cluster-priority-product__media media-frame media-frame--product">
                <CmsImage
                  :src="product.image.src"
                  :alt="product.image.alt"
                  :width="product.image.width"
                  :height="product.image.height"
                  class="commercial-cluster-priority-product__image"
                />
              </span>
              <span class="commercial-cluster-priority-product__body">
                <span class="commercial-cluster-priority-product__title">{{ product.title }}</span>
                <span class="commercial-cluster-priority-product__description">
                  {{ product.description }}
                </span>
                <span class="commercial-cluster-product-link">
                  Ver solución
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </span>
            </NuxtLink>
          </div>

        </article>

        <div class="commercial-cluster-solution-list">
          <article
            v-for="(solution, index) in secondarySolutions"
            :key="solution.id"
            :class="[
              'commercial-cluster-solution',
              index % 2 === 1 && 'commercial-cluster-solution--reverse',
            ]"
          >
            <div class="commercial-cluster-solution__content">
              <p class="commercial-cluster-solution__label">{{ solution.eyebrow }}</p>
              <h3 class="commercial-cluster-solution__title">{{ solution.title }}</h3>
              <p class="commercial-cluster-solution__description">{{ solution.description }}</p>

              <ul class="commercial-cluster-product-list" :aria-label="`Productos de ${solution.eyebrow}`">
                <li
                  v-for="product in secondaryProducts(solution)"
                  :key="product.slug"
                  class="commercial-cluster-product-list__item"
                >
                  <NuxtLink :to="product.path" class="commercial-cluster-product-list__link">
                    <span>{{ product.title }}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <NuxtLink
              v-if="solution.primaryProduct"
              :to="solution.primaryProduct.path"
              class="commercial-cluster-solution__featured"
            >
              <span class="commercial-cluster-solution__media media-frame media-frame--product">
                <CmsImage
                  :src="solution.primaryProduct.image.src"
                  :alt="solution.primaryProduct.image.alt"
                  :width="solution.primaryProduct.image.width"
                  :height="solution.primaryProduct.image.height"
                  class="commercial-cluster-solution__image"
                />
              </span>
              <span class="commercial-cluster-solution__featured-body">
                <span class="commercial-cluster-solution__featured-title">
                  {{ solution.primaryProduct.title }}
                </span>
                <span class="commercial-cluster-product-link">
                  Ver producto destacado
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </span>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section v-if="config?.project" class="commercial-cluster-project" aria-labelledby="commercial-project-title">
      <div class="commercial-cluster-project__container">
        <div class="commercial-cluster-project__content">
          <p class="commercial-cluster__eyebrow">{{ config?.project?.eyebrow }}</p>
          <h2 id="commercial-project-title" class="commercial-cluster-project__title">
            {{ config?.project?.title || "" }}
          </h2>
          <p class="commercial-cluster-project__description">{{ config?.project?.description || "" }}</p>
          <AppButton
            v-if="config?.finalCta?.primaryCta"
            :to="config.finalCta.primaryCta.to"
            size="lg"
            arrow
            class="commercial-cluster-project__cta"
          >
            {{ config?.finalCta?.primaryCta?.label || "" }}
          </AppButton>
        </div>

        <ul class="commercial-cluster-project__points" aria-label="Soportes coordinables">
          <li
            v-for="point in config?.project?.points || []"
            :key="point"
            class="commercial-cluster-project__point"
          >
            {{ point }}
          </li>
        </ul>
      </div>
    </section>

    <section v-if="config?.useCases" class="commercial-cluster-use-cases" aria-labelledby="commercial-use-cases-title">
      <div class="commercial-cluster-use-cases__container">
        <div class="commercial-cluster-use-cases__intro">
          <p class="commercial-cluster__eyebrow">{{ config?.useCases?.eyebrow }}</p>
          <h2 id="commercial-use-cases-title" class="commercial-cluster-use-cases__title">
            {{ config?.useCases?.title || "" }}
          </h2>
          <p class="commercial-cluster-use-cases__description">
            {{ config?.useCases?.description || "" }}
          </p>
        </div>

        <ul class="commercial-cluster-use-cases__list">
          <li
            v-for="item in config?.useCases?.items || []"
            :key="item.title"
            class="commercial-cluster-use-cases__item"
          >
            <h3 class="commercial-cluster-use-cases__item-title">{{ item.title }}</h3>
            <p class="commercial-cluster-use-cases__item-description">
              {{ item.description }}
            </p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
