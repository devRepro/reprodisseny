<script setup lang="ts">
import { computed } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";

type ContentBlock =
  | { type: "text"; text?: string; html?: boolean; format?: "plain" | "html" }
  | { type: "bullets"; items?: string[]; ordered?: boolean }
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
  intro?: string;
  blocks?: ContentBlock[];
  content?: ContentBlock[];
  text?: string;
  html?: string;
};

type SafeSection = {
  id: string;
  title: string;
  intro?: string;
  blocks: ContentBlock[];
};

const props = withDefaults(
  defineProps<{
    section?: IncomingSection | null;
    eyebrow?: string;
    containerClass?: string;
  }>(),
  {
    section: null,
    eyebrow: "Información",
    containerClass: "container-content",
  }
);

function makeAnchorId(value: string, fallback: string): string {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function normalizeSectionBlocks(section: IncomingSection): ContentBlock[] {
  if (Array.isArray(section.blocks) && section.blocks.length) {
    return section.blocks.filter(Boolean) as ContentBlock[];
  }

  if (Array.isArray(section.content) && section.content.length) {
    return section.content.filter(Boolean) as ContentBlock[];
  }

  const html = String(section.html ?? "").trim();
  if (html) return [{ type: "text", text: html, html: true }];

  const text = String(section.text ?? "").trim();
  if (text) return [{ type: "text", text, html: false }];

  return [];
}

const safeSection = computed<SafeSection | null>(() => {
  const section = props.section;
  if (!section) return null;

  const title = String(section.title ?? "").trim();
  const intro = String(section.intro ?? "").trim() || undefined;
  const blocks = normalizeSectionBlocks(section);

  if (!title || !blocks.length) return null;

  const rawId = String(section.id ?? section.key ?? "").trim();

  return {
    id: makeAnchorId(rawId || title, "seccion"),
    title,
    ...(intro ? { intro } : {}),
    blocks,
  };
});

function isPlainText(b: ContentBlock): b is Extract<ContentBlock, { type: "text" }> {
  return b?.type === "text" && !b.html && Boolean(b.text);
}

function isHtmlText(b: ContentBlock): b is Extract<ContentBlock, { type: "text" }> {
  return b?.type === "text" && !!b.html && Boolean(b.text);
}

function isBullets(b: ContentBlock): b is Extract<ContentBlock, { type: "bullets" }> {
  return b?.type === "bullets" && Array.isArray(b.items) && b.items.length > 0;
}

function isImage(b: ContentBlock): b is Extract<ContentBlock, { type: "image" }> {
  return b?.type === "image" && Boolean(b.src);
}
</script>

<template>
  <ContentSectionShell
    v-if="safeSection"
    :id="safeSection.id"
    :eyebrow="eyebrow"
    :title="safeSection.title"
    :description="safeSection.intro || ''"
    theme="default"
    section-class="scroll-mt-32"
    :container-class="containerClass"
    intro-class="max-w-4xl"
    body-class="space-y-8 md:space-y-10"
  >
    <template
      v-for="(block, blockIndex) in safeSection.blocks"
      :key="`${safeSection.id}-${blockIndex}`"
    >
      <div v-if="isPlainText(block)" class="max-w-[78ch]">
        <p
          class="whitespace-pre-line text-[15px] leading-8 text-foreground/80 md:text-[16px] md:leading-8"
        >
          {{ block.text }}
        </p>
      </div>

      <div
        v-else-if="isHtmlText(block)"
        class="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-[-0.03em] prose-headings:text-foreground prose-h2:mt-0 prose-h2:mb-5 prose-h2:border-t prose-h2:border-border/50 prose-h2:pt-8 prose-h2:text-[1.9rem] prose-h2:leading-[1.1] prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-[1.35rem] prose-h3:leading-[1.16] prose-h4:mt-8 prose-h4:mb-2 prose-h4:text-[1.05rem] prose-h4:font-semibold prose-p:text-[15px] prose-p:leading-8 prose-p:text-foreground/80 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-foreground prose-ul:mt-5 prose-ul:mb-6 prose-ol:mt-5 prose-ol:mb-6 prose-li:text-foreground/80"
        v-html="block.text"
      />

      <component
        :is="block.ordered ? 'ol' : 'ul'"
        v-else-if="isBullets(block)"
        class="grid gap-3 md:grid-cols-2"
      >
        <li
          v-for="(item, itemIndex) in block.items"
          :key="`${safeSection.id}-${blockIndex}-${itemIndex}`"
          class="rounded-2xl border border-border/60 bg-background p-4 md:p-5"
        >
          <div class="flex items-start gap-3">
            <div class="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-primary/70" />
            <p class="text-sm leading-7 text-foreground/80 md:text-[15px]">
              {{ item }}
            </p>
          </div>
        </li>
      </component>

      <figure
        v-else-if="isImage(block)"
        class="overflow-hidden rounded-3xl border border-border/60 bg-background"
      >
        <NuxtImg
          :src="normalizeCmsMediaSrc(block.src) || block.src"
          :alt="block.alt || safeSection.title"
          :width="block.width || 1200"
          :height="block.height || 800"
          class="h-auto w-full object-cover"
          loading="lazy"
        />

        <figcaption
          v-if="block.caption"
          class="border-t border-border/50 px-5 py-4 text-sm leading-7 text-muted-foreground"
        >
          {{ block.caption }}
        </figcaption>
      </figure>
    </template>
  </ContentSectionShell>
</template>
