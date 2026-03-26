<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue";
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

const props = withDefaults(
  defineProps<{
    sections?: IncomingSection[] | null;
    tabs?: IncomingSection[] | null;

    products?: IncomingProduct[] | null;
    faqs?: IncomingFaq[] | null;

    class?: string;
    sectionsClass?: string;
    asideContainerClass?: string;

    productsTitle?: string;
    productsSubtitle?: string;
    productsCtaText?: string;

    faqTitle?: string;
    faqSubtitle?: string;
  }>(),
  {
    sections: () => [],
    tabs: () => [],
    products: () => [],
    faqs: () => [],

    class: "",
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

const hasSections = computed(() => safeSections.value.length > 0);
const hasProducts = computed(() => safeProducts.value.length > 0);
const hasFaqs = computed(() => safeFaqs.value.length > 0);
</script>

<template>
  <section :class="cn('bg-background text-foreground', props.class)">
    <div :class="props.asideContainerClass">
      <div class="space-y-16 py-12 md:space-y-20 md:py-16">
        <section
          v-if="hasSections"
          aria-labelledby="category-content-heading"
          :class="props.sectionsClass"
        >
          <div class="max-w-3xl">
            <p class="text-label text-primary">
              Información de la categoría
            </p>

            <h2
              id="category-content-heading"
              class="mt-2 text-[clamp(1.6rem,2vw,2rem)] font-semibold leading-tight tracking-tight text-foreground"
            >
              Características, formatos y aplicaciones
            </h2>

            <p class="mt-2 max-w-[62ch] text-body text-muted-foreground">
              Consulta los aspectos clave para comparar soluciones, materiales, acabados y usos habituales.
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
                  class="text-[22px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[26px]"
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
                      class="flex gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3.5"
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
      </div>
    </div>
  </section>
</template>
