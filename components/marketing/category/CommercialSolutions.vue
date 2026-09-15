<script setup lang="ts">
import { computed } from "vue";

import CmsImage from "@/components/shared/blocks/CmsImage.vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import {
  getCommercialClusterConfig,
  type CommercialClusterConfig,
  type CommercialClusterProduct,
  type CommercialClusterSolution,
} from "@/utils/config/commercialClusters";

type ProductLike = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  image?: {
    src?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  imageSrc?: string | null;
};

type ResolvedCommercialProduct = CommercialClusterProduct;

type ResolvedCommercialSolution = CommercialClusterSolution & {
  primaryProduct: ResolvedCommercialProduct | null;
  products: ResolvedCommercialProduct[];
};

const props = withDefaults(
  defineProps<{
    categorySlug?: string | null;
    products?: ProductLike[] | null;
    relatedProducts?: ProductLike[] | null;
  }>(),
  {
    categorySlug: "",
    products: () => [],
    relatedProducts: () => [],
  },
);

const cluster = computed<CommercialClusterConfig | null>(() =>
  getCommercialClusterConfig(props.categorySlug),
);

const runtimeProductsBySlug = computed(() => {
  const map = new Map<string, ProductLike>();
  const items = [...(props.products ?? []), ...(props.relatedProducts ?? [])];

  for (const item of items) {
    const slug = String(item?.slug || "").trim();
    if (slug && !map.has(slug)) {
      map.set(slug, item);
    }
  }

  return map;
});

const resolvedProductsBySlug = computed(() => {
  const map = new Map<string, ResolvedCommercialProduct>();

  for (const fallback of cluster.value?.products ?? []) {
    const runtime = runtimeProductsBySlug.value.get(fallback.slug);
    const title = String(runtime?.title || runtime?.name || fallback.title).trim();
    const path = String(runtime?.path || fallback.path).trim();
    const description = String(
      runtime?.shortDescription || runtime?.description || fallback.description,
    ).trim();
    const runtimeImage = runtime?.image;
    const imageSrc = String(runtimeImage?.src || runtime?.imageSrc || fallback.image.src).trim();
    const imageAlt = String(runtimeImage?.alt || fallback.image.alt || title).trim();

    map.set(fallback.slug, {
      ...fallback,
      title,
      path,
      description,
      image: {
        src: imageSrc,
        alt: imageAlt,
        width: runtimeImage?.width || fallback.image.width,
        height: runtimeImage?.height || fallback.image.height,
      },
    });
  }

  return map;
});

const resolvedSolutions = computed<ResolvedCommercialSolution[]>(() => {
  return (cluster.value?.solutions ?? [])
    .map((solution) => {
      const products = solution.productSlugs
        .map((slug) => resolvedProductsBySlug.value.get(slug) ?? null)
        .filter((product): product is ResolvedCommercialProduct => Boolean(product));
      const primaryProduct =
        resolvedProductsBySlug.value.get(solution.primaryProductSlug) ?? products[0] ?? null;

      return {
        ...solution,
        products,
        primaryProduct,
      };
    })
    .filter((solution) => solution.products.length > 0);
});

const prioritySolution = computed(() => resolvedSolutions.value[0] ?? null);
const secondarySolutions = computed(() => resolvedSolutions.value.slice(1));

function secondaryProducts(solution: ResolvedCommercialSolution) {
  return solution.products.filter(
    (product) => product.slug !== solution.primaryProduct?.slug,
  );
}
</script>

<template>
  <div v-if="cluster" class="commercial-cluster">
    <section v-if="cluster.facts.length" class="commercial-cluster-trust" aria-label="Datos de confianza">
      <div class="commercial-cluster-trust__container">
        <dl class="commercial-cluster-trust__grid">
          <div
            v-for="fact in cluster.facts"
            :key="`${fact.label}-${fact.value}`"
            class="commercial-cluster-trust__item"
          >
            <dt class="commercial-cluster-trust__label">{{ fact.label }}</dt>
            <dd class="commercial-cluster-trust__value">{{ fact.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section :id="cluster.anchorId" class="commercial-cluster-solutions" aria-labelledby="commercial-solutions-title">
      <div class="commercial-cluster-solutions__container">
        <ContentSectionIntro
          :eyebrow="cluster.intro.eyebrow"
          :title="cluster.intro.title"
          :description="cluster.intro.description"
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
          </div>

          <div class="commercial-cluster-priority__products">
            <NuxtLink
              v-for="product in prioritySolution.products.slice(0, 2)"
              :key="product.slug"
              :to="product.path"
              class="commercial-cluster-priority-product"
            >
              <span class="commercial-cluster-priority-product__media">
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

          <ul v-if="prioritySolution.products.length > 2" class="commercial-cluster-inline-links" aria-label="Productos complementarios de identificación">
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
              <CmsImage
                :src="solution.primaryProduct.image.src"
                :alt="solution.primaryProduct.image.alt"
                :width="solution.primaryProduct.image.width"
                :height="solution.primaryProduct.image.height"
                class="commercial-cluster-solution__image"
              />
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

    <section class="commercial-cluster-project" aria-labelledby="commercial-project-title">
      <div class="commercial-cluster-project__container">
        <div class="commercial-cluster-project__content">
          <p class="commercial-cluster__eyebrow">{{ cluster.project.eyebrow }}</p>
          <h2 id="commercial-project-title" class="commercial-cluster-project__title">
            {{ cluster.project.title }}
          </h2>
          <p class="commercial-cluster-project__description">{{ cluster.project.description }}</p>
          <AppButton
            :to="cluster.finalCta.primaryCta.to"
            size="lg"
            arrow
            class="commercial-cluster-project__cta"
          >
            {{ cluster.finalCta.primaryCta.label }}
          </AppButton>
        </div>

        <ul class="commercial-cluster-project__points" aria-label="Soportes coordinables">
          <li
            v-for="point in cluster.project.points"
            :key="point"
            class="commercial-cluster-project__point"
          >
            {{ point }}
          </li>
        </ul>
      </div>
    </section>

    <section class="commercial-cluster-use-cases" aria-labelledby="commercial-use-cases-title">
      <div class="commercial-cluster-use-cases__container">
        <div class="commercial-cluster-use-cases__intro">
          <p class="commercial-cluster__eyebrow">{{ cluster.useCases.eyebrow }}</p>
          <h2 id="commercial-use-cases-title" class="commercial-cluster-use-cases__title">
            {{ cluster.useCases.title }}
          </h2>
          <p class="commercial-cluster-use-cases__description">
            {{ cluster.useCases.description }}
          </p>
        </div>

        <ul class="commercial-cluster-use-cases__list">
          <li
            v-for="item in cluster.useCases.items"
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
