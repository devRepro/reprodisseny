<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import ContentSectionNav from "@/components/marketing/content/ContentSectionNav.vue";
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";
import type { Block } from "~/utils/_categoryRail";

type IncomingFaq = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

type IncomingImage = {
  src?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
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

type SafeSection = {
  id: string;
  title: string;
  blocks: Block[];
};

type SafeProduct = {
  title: string;
  to: string;
  imageSrc?: string;
  imageAlt: string;
  ctaText?: string;
};

type SafeFaq = {
  q: string;
  a: string;
};

type NavItem = {
  id: string;
  label: string;
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
    asideContainerClass: "container-content",

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

function makeAnchorId(value: string, fallback: string) {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
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

const safeSections = computed<SafeSection[]>(() =>
  rawSections.value
    .map((section, index) => {
      const title = String(section?.title ?? "").trim();
      const blocks = normalizeSectionBlocks(section);

      if (!title || !blocks.length) return null;

      const rawId = String(section?.id ?? section?.key ?? "").trim();
      const id = makeAnchorId(rawId || title, `seccion-${index + 1}`);

      return {
        id,
        title,
        blocks,
      };
    })
    .filter((section): section is SafeSection => Boolean(section))
);

const safeProducts = computed<SafeProduct[]>(() =>
  (props.products || [])
    .map((item) => {
      const title = String(item?.title ?? "").trim();
      const to = String(item?.to ?? item?.path ?? "").trim();
      const rawImageSrc =
        String(item?.imageSrc ?? item?.image?.src ?? "").trim() || undefined;
      const imageSrc = rawImageSrc
        ? normalizeCmsMediaSrc(rawImageSrc) || rawImageSrc
        : undefined;
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
    .filter((item): item is SafeProduct => Boolean(item))
);

const safeFaqs = computed<SafeFaq[]>(() =>
  (props.faqs || [])
    .map((item) => ({
      q: String(item?.q ?? item?.question ?? "").trim(),
      a: String(item?.a ?? item?.answer ?? "").trim(),
    }))
    .filter((item): item is SafeFaq => Boolean(item.q && item.a))
);

const hasSections = computed(() => safeSections.value.length > 0);
const hasProducts = computed(() => safeProducts.value.length > 0);
const hasFaqs = computed(() => safeFaqs.value.length > 0);

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = safeSections.value.map((section) => ({
    id: section.id,
    label: section.title,
  }));

  if (hasProducts.value) {
    items.push({ id: "productos", label: "Productos" });
  }

  if (hasFaqs.value) {
    items.push({ id: "faqs", label: "FAQ" });
  }

  return items;
});
</script>

<template>
  <section :class="cn('bg-background text-foreground', props.class)">
    <div :class="props.asideContainerClass">
      <div class="py-12 md:py-16">
        <section
          v-if="hasSections"
          aria-labelledby="category-content-heading"
          :class="props.sectionsClass"
        >
          <ContentSectionIntro
            eyebrow="Información de la categoría"
            title="Características, formatos y aplicaciones"
            description="Consulta los aspectos clave para comparar soluciones, materiales, acabados y usos habituales."
          />

          <ContentSectionNav
            v-if="navItems.length > 1"
            :items="navItems"
            class="mt-8"
            sticky-top-class="top-20 md:top-24"
            :offset="136"
          />

          <div class="mt-8 space-y-6 md:space-y-8">
            <ContentSectionShell
              v-for="section in safeSections"
              :id="section.id"
              :key="section.id"
              :title="section.title"
            >
              <div class="space-y-5">
                <template
                  v-for="(block, index) in section.blocks"
                  :key="`${section.id}-${index}`"
                >
                  <div
                    v-if="block.type === 'text' && block.text"
                    class="max-w-none"
                  >
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
                      :src="normalizeCmsMediaSrc(block.src) || block.src"
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
            </ContentSectionShell>
          </div>
        </section>

        <section
          v-if="hasProducts"
          id="productos"
          aria-labelledby="category-products-heading"
          class="mt-16 scroll-mt-[148px] md:mt-20"
        >
          <h2 id="category-products-heading" class="sr-only">
            {{ props.productsTitle }}
          </h2>

          <CategoryProductsGrid
            :title="productsTitle"
            :subtitle="productsSubtitle"
            :items="safeProducts"
            :cta-text="productsCtaText"
          />
        </section>

        <section
          v-if="hasFaqs"
          id="faqs"
          aria-labelledby="category-faq-heading"
          class="mt-16 scroll-mt-[148px] md:mt-20"
        >
          <h2 id="category-faq-heading" class="sr-only">
            {{ props.faqTitle }}
          </h2>

          <CategoryFaq
            :items="safeFaqs"
            :title="faqTitle"
            :subtitle="faqSubtitle"
          />
        </section>
      </div>
    </div>
  </section>
</template>
