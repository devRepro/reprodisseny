<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import CategoryLead from "@/components/marketing/category/CategoryLead.vue";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue";
import CategoryGuideCTA from "@/components/marketing/category/CategoryGuideCTA.vue";
import type { Block } from "@/utils/categoryRail";

type IncomingFaq = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

type IncomingImage = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
} | null;

type IncomingSection = {
  id?: string;
  key?: string;
  title?: string;
  blocks?: Block[];
  content?: Block[];
  text?: string;
  html?: string;
};

type IncomingProduct = {
  title?: string;
  to?: string;
  path?: string;
  imageSrc?: string;
  imageAlt?: string;
  image?: IncomingImage;
  ctaText?: string;
  description?: string;
};

type GuideCta = {
  imageSrc?: string | null;
  imageAlt?: string;
  title?: string;
  description?: string;
  to?: string;
  ctaLabel?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    imageSrc?: string | null;
    imageAlt?: string;

    sections?: IncomingSection[] | null;
    tabs?: IncomingSection[] | null; // legacy temporal

    products?: IncomingProduct[] | null;
    faqs?: IncomingFaq[] | null;
    guideCta?: GuideCta | null;

    class?: string;
    leadClass?: string;
    sectionsClass?: string;
    asideContainerClass?: string;

    productsTitle?: string;
    productsSubtitle?: string;
    productsCtaText?: string;

    faqTitle?: string;
    faqSubtitle?: string;
  }>(),
  {
    title: "",
    description: "",
    imageSrc: null,
    imageAlt: "",
    sections: () => [],
    tabs: () => [],
    products: () => [],
    faqs: () => [],
    guideCta: null,

    class: "",
    leadClass: "",
    sectionsClass: "",
    asideContainerClass: "mx-auto w-full max-w-[1100px] px-6 lg:px-16",

    productsTitle: "Productos relacionados",
    productsSubtitle: "",
    productsCtaText: "Ver producto",

    faqTitle: "Preguntas frecuentes",
    faqSubtitle: "",
  }
);

function toTextBlock(text: string, html = false): Block {
  return {
    type: "text",
    text,
    html,
  } as Block;
}

function normalizeSectionBlocks(section: IncomingSection): Block[] {
  if (Array.isArray(section.blocks) && section.blocks.length) {
    return section.blocks.filter(Boolean);
  }

  if (Array.isArray(section.content) && section.content.length) {
    return section.content.filter(Boolean);
  }

  const html = String(section.html ?? "").trim();
  if (html) return [toTextBlock(html, true)];

  const text = String(section.text ?? "").trim();
  if (text) return [toTextBlock(text, false)];

  return [];
}

const rawSections = computed<IncomingSection[]>(() => {
  if (Array.isArray(props.sections) && props.sections.length) return props.sections;
  if (Array.isArray(props.tabs) && props.tabs.length) return props.tabs;
  return [];
});

const safeSections = computed(() =>
  rawSections.value
    .map((section, index) => {
      const title = String(section?.title ?? "").trim();
      const id =
        String(section?.id ?? section?.key ?? "").trim() || `seccion-${index + 1}`;
      const blocks = normalizeSectionBlocks(section);

      if (!title || !blocks.length) return null;

      return {
        id,
        title,
        blocks,
      };
    })
    .filter(Boolean)
);

const leadChips = computed(() =>
  safeSections.value
    .map((section) => String(section?.title ?? "").trim())
    .filter(Boolean)
    .slice(0, 3)
);

const safeProducts = computed(() =>
  (props.products || [])
    .map((item) => {
      const title = String(item?.title ?? "").trim();
      const to = String(item?.to ?? item?.path ?? "").trim();
      const imageSrc =
        String(item?.imageSrc ?? item?.image?.src ?? "").trim() || undefined;
      const imageAlt =
        String(item?.imageAlt ?? item?.image?.alt ?? title).trim() || title;

      if (!title || !to) return null;

      return {
        title,
        to,
        imageSrc,
        imageAlt,
        ctaText: String(item?.ctaText ?? "").trim() || undefined,
      };
    })
    .filter(Boolean)
);

const safeFaqs = computed(() =>
  (props.faqs || [])
    .map((item) => ({
      q: String(item?.q ?? item?.question ?? "").trim(),
      a: String(item?.a ?? item?.answer ?? "").trim(),
    }))
    .filter((item) => item.q && item.a)
);

const hasLead = computed(
  () =>
    Boolean(String(props.title || "").trim()) ||
    Boolean(String(props.description || "").trim())
);

const hasSections = computed(() => safeSections.value.length > 0);
const hasProducts = computed(() => safeProducts.value.length > 0);
const hasFaqs = computed(() => safeFaqs.value.length > 0);
const hasGuideCta = computed(() => Boolean(props.guideCta));
</script>

<template>
  <section :class="cn('bg-background text-foreground', props.class)">
    <div
      v-if="hasLead"
      class="mx-auto w-full max-w-[1100px] px-6 pt-10 md:px-10 md:pt-14 lg:px-16"
    >
      <CategoryLead
        :title="title"
        :description="description || ''"
        :image-src="imageSrc"
        :chips="leadChips"
        :class="cn('mb-0', props.leadClass)"
      />
    </div>

    <div :class="props.asideContainerClass">
      <div class="space-y-16 py-12 md:space-y-20 md:py-16">
        <section
          v-if="hasSections"
          aria-labelledby="category-content-heading"
          :class="props.sectionsClass"
        >
          <div class="max-w-[760px]">
            <p class="text-label uppercase tracking-[0.08em] text-primary">
              Características y detalles
            </p>
            <h2
              id="category-content-heading"
              class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
            >
              Información clave de esta categoría
            </h2>
            <p
              class="mt-3 max-w-[68ch] text-body text-foreground/78 md:text-[18px] md:leading-[1.68]"
            >
              Presentamos el contenido de forma clara y escaneable para facilitar la
              comparación de soluciones, materiales, acabados y usos.
            </p>
          </div>

          <div class="mt-8 space-y-6 md:space-y-8">
            <section
              v-for="section in safeSections"
              :id="section.id"
              :key="section.id"
              class="scroll-mt-[132px] rounded-[28px] border border-border/70 bg-card p-6 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] md:p-8"
            >
              <header class="max-w-[760px]">
                <h3
                  class="text-[24px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[30px]"
                >
                  {{ section.title }}
                </h3>
              </header>

              <div class="mt-6 space-y-5">
                <template
                  v-for="(block, index) in section.blocks"
                  :key="`${section.id}-${index}`"
                >
                  <div v-if="block.type === 'text' && block.text" class="max-w-none">
                    <div
                      v-if="block.html"
                      class="prose prose-slate max-w-none text-foreground/80"
                      v-html="block.text"
                    />
                    <p
                      v-else
                      class="max-w-[78ch] text-body leading-[1.75] text-foreground/80"
                    >
                      {{ block.text }}
                    </p>
                  </div>

                  <div
                    v-else-if="block.type === 'bullets' && block.items?.length"
                    class="grid grid-cols-1 gap-3 md:grid-cols-2"
                  >
                    <article
                      v-for="(item, bulletIndex) in block.items"
                      :key="`${section.id}-${index}-${bulletIndex}`"
                      class="flex gap-3 rounded-2xl border border-border/60 bg-background px-4 py-4"
                    >
                      <span class="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <p class="text-body-s leading-[1.65] text-foreground/80">
                        {{ item }}
                      </p>
                    </article>
                  </div>

                  <figure
                    v-else-if="block.type === 'image' && block.src"
                    class="overflow-hidden rounded-2xl border border-border/60 bg-background"
                  >
                    <NuxtImg
                      :src="block.src"
                      :alt="block.alt || section.title"
                      :width="block.width || 1200"
                      :height="block.height || 800"
                      class="h-auto w-full object-cover"
                      loading="lazy"
                    />
                    <figcaption
                      v-if="block.caption"
                      class="px-4 py-3 text-body-s text-foreground/70"
                    >
                      {{ block.caption }}
                    </figcaption>
                  </figure>
                </template>
              </div>
            </section>
          </div>
        </section>

        <section
          v-if="hasProducts"
          id="productos"
          aria-labelledby="category-products-heading"
        >
          <CategoryProductsGrid
            :title="productsTitle"
            :subtitle="productsSubtitle"
            :items="safeProducts"
            :cta-text="productsCtaText"
          />
        </section>

        <CategoryFaq
          v-if="hasFaqs"
          :items="safeFaqs"
          :title="faqTitle"
          :subtitle="faqSubtitle"
        />

        <CategoryGuideCTA
          v-if="hasGuideCta"
          :image-src="guideCta?.imageSrc || null"
          :image-alt="guideCta?.imageAlt || ''"
          :title="guideCta?.title"
          :description="guideCta?.description"
          :to="guideCta?.to"
          :cta-label="guideCta?.ctaLabel"
        />
      </div>
    </div>
  </section>
</template>
