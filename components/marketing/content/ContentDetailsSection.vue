<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

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
    class?: string;
    headerClass?: string;
    contentClass?: string;
    showHeader?: boolean;
  }>(),
  {
    section: null,
    eyebrow: "Información",
    class: "",
    headerClass: "",
    contentClass: "",
    showHeader: true,
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

function splitParagraphs(text?: string): string[] {
  return String(text || "")
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
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
  <section
    v-if="safeSection"
    :id="safeSection.id"
    :class="cn('space-y-6 md:space-y-8', props.class)"
  >
    <ContentSectionHeader
      v-if="showHeader"
      :title="safeSection.title"
      :subtitle="safeSection.intro || ''"
      :eyebrow="eyebrow"
      as="h3"
      tone="foreground"
      :divider="true"
      :class="cn('max-w-3xl', props.headerClass)"
    />

    <div :class="cn('space-y-4 md:space-y-5', props.contentClass)">
      <template
        v-for="(block, blockIndex) in safeSection.blocks"
        :key="`${safeSection.id}-${blockIndex}`"
      >
        <div v-if="isPlainText(block)" class="max-w-[72ch] space-y-3">
          <p
            v-for="(paragraph, idx) in splitParagraphs(block.text)"
            :key="`${safeSection.id}-${blockIndex}-p-${idx}`"
            class="font-body text-[15px] leading-7 text-muted-foreground md:text-base"
          >
            {{ paragraph }}
          </p>
        </div>

        <div
          v-else-if="isHtmlText(block)"
          class="prose prose-neutral max-w-[72ch] prose-headings:font-semibold prose-headings:tracking-[-0.03em] prose-headings:text-foreground prose-h2:mt-0 prose-h2:mb-3 prose-h2:border-t prose-h2:border-border/50 prose-h2:pt-5 prose-h2:text-[1.7rem] prose-h2:leading-[1.12] prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-[1.2rem] prose-h3:leading-[1.2] prose-h4:mt-5 prose-h4:mb-2 prose-h4:text-[1rem] prose-h4:font-semibold prose-p:my-3 prose-p:text-[15px] prose-p:leading-7 prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-foreground prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-muted-foreground"
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
            class="rounded-2xl border border-border/60 bg-card p-4 md:p-5"
          >
            <div class="flex items-start gap-3">
              <div class="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-primary/70" />
              <p class="font-body text-sm leading-7 text-muted-foreground md:text-[15px]">
                {{ item }}
              </p>
            </div>
          </li>
        </component>

        <figure
          v-else-if="isImage(block)"
          class="overflow-hidden rounded-3xl border border-border/60 bg-card"
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
    </div>
  </section>
</template>