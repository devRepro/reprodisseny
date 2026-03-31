<script setup lang="ts">
import { computed } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

type CategoryBlock =
  | {
      type: "text";
      text?: string;
      html?: boolean;
    }
  | {
      type: "bullets";
      items?: string[];
    }
  | {
      type: "image";
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
      caption?: string;
    };

type IncomingSection = {
  id?: string;
  key?: string;
  title?: string;
  blocks?: CategoryBlock[];
  content?: CategoryBlock[];
  text?: string;
  html?: string;
};

type SafeSection = {
  id: string;
  title: string;
  blocks: CategoryBlock[];
};

const props = withDefaults(
  defineProps<{
    sections?: IncomingSection[];
    showSectionNav?: boolean;
  }>(),
  {
    sections: () => [],
    showSectionNav: false,
  }
);

function toTextBlock(text: string, html = false): CategoryBlock {
  return {
    type: "text",
    text,
    html,
  };
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

function normalizeSectionBlocks(section: IncomingSection): CategoryBlock[] {
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

const safeSections = computed<SafeSection[]>(() =>
  (props.sections || [])
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

function isTextBlock(
  block: CategoryBlock
): block is Extract<CategoryBlock, { type: "text" }> {
  return block?.type === "text";
}

function isBulletsBlock(
  block: CategoryBlock
): block is Extract<CategoryBlock, { type: "bullets" }> {
  return block?.type === "bullets";
}

function isImageBlock(
  block: CategoryBlock
): block is Extract<CategoryBlock, { type: "image" }> {
  return block?.type === "image";
}
</script>

<template>
  <div v-if="safeSections.length" class="w-full">
    <nav
      v-if="showSectionNav && safeSections.length > 1"
      aria-label="Navegación de secciones de la categoría"
      class="sticky top-20 z-20 mb-8 w-full overflow-x-auto rounded-full border border-border/70 bg-background/85 p-2 backdrop-blur"
    >
      <div class="flex min-w-max gap-2">
        <a
          v-for="section in safeSections"
          :key="section.id"
          :href="`#${section.id}`"
          class="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium text-foreground/75 transition hover:bg-primary/5 hover:text-primary"
        >
          {{ section.title }}
        </a>
      </div>
    </nav>

    <div class="w-full space-y-10 md:space-y-14">
      <section
        v-for="section in safeSections"
        :id="section.id"
        :key="section.id"
        class="scroll-mt-28 w-full rounded-[28px] border border-border/70 bg-card px-6 py-6 md:px-8 md:py-8 lg:px-10"
      >
        <header class="mb-5 md:mb-6">
          <h3
            class="text-[clamp(1.35rem,1.6vw,1.75rem)] font-semibold leading-tight tracking-tight text-foreground"
          >
            {{ section.title }}
          </h3>
        </header>

        <div class="space-y-5">
          <template
            v-for="(block, blockIndex) in section.blocks"
            :key="`${section.id}-${blockIndex}`"
          >
            <div
              v-if="isTextBlock(block) && block.text"
              class="max-w-[72ch] text-body leading-7 text-foreground/85 md:text-[17px]"
            >
              <div
                v-if="block.html"
                class="prose prose-neutral max-w-none prose-p:my-0 prose-h3:mt-5 prose-h3:mb-2 prose-h4:mt-4 prose-h4:mb-2 prose-ul:my-3 prose-li:my-1"
                v-html="block.text"
              />
              <p v-else class="whitespace-pre-line">
                {{ block.text }}
              </p>
            </div>

            <ul
              v-else-if="isBulletsBlock(block) && block.items?.length"
              class="grid max-w-[90ch] gap-3 md:grid-cols-2"
            >
              <li
                v-for="(item, itemIndex) in block.items"
                :key="`${section.id}-${blockIndex}-${itemIndex}`"
                class="flex gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3"
              >
                <span class="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span class="text-body leading-7 text-foreground/85">
                  {{ item }}
                </span>
              </li>
            </ul>

            <figure
              v-else-if="isImageBlock(block) && block.src"
              class="overflow-hidden rounded-3xl border border-border/70 bg-card"
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
                class="border-t border-border/70 px-4 py-3 text-sm text-muted-foreground"
              >
                {{ block.caption }}
              </figcaption>
            </figure>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>