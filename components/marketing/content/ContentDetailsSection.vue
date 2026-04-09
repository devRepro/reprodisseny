<script setup lang="ts">
import { computed } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type CategoryBlock =
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
  blocks?: CategoryBlock[];
  content?: CategoryBlock[];
  text?: string;
  html?: string;
};

type SafeSection = {
  id: string;
  title: string;
  intro?: string;
  blocks: CategoryBlock[];
};

const props = withDefaults(
  defineProps<{
    section?: IncomingSection | null;
  }>(),
  {
    section: null,
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

function normalizeSectionBlocks(section: IncomingSection): CategoryBlock[] {
  if (Array.isArray(section.blocks) && section.blocks.length) {
    return section.blocks.filter(Boolean) as CategoryBlock[];
  }

  if (Array.isArray(section.content) && section.content.length) {
    return section.content.filter(Boolean) as CategoryBlock[];
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
    id: makeAnchorId(rawId || title, "detalles"),
    title,
    ...(intro ? { intro } : {}),
    blocks,
  };
});

function isText(b: CategoryBlock): b is Extract<CategoryBlock, { type: "text" }> {
  return b?.type === "text";
}

function isBullets(
  b: CategoryBlock
): b is Extract<CategoryBlock, { type: "bullets" }> {
  return b?.type === "bullets" && Array.isArray(b.items) && b.items.length > 0;
}

function isImage(b: CategoryBlock): b is Extract<CategoryBlock, { type: "image" }> {
  return b?.type === "image" && Boolean(b.src);
}
</script>

<template>
  <section
    v-if="safeSection"
    :id="safeSection.id"
    class="scroll-mt-32 space-y-8 md:space-y-10"
    aria-label="Detalles de la categoría"
  >
    <div class="max-w-3xl">
      <ContentSectionHeader
        :title="safeSection.title"
        :subtitle="safeSection.intro"
        as="h2"
      />
    </div>

    <div class="space-y-8 md:space-y-10">
      <template
        v-for="(block, blockIndex) in safeSection.blocks"
        :key="`${safeSection.id}-${blockIndex}`"
      >
        <p
          v-if="isText(block) && !block.html && block.text"
          class="max-w-[75ch] text-base leading-relaxed text-foreground/80 md:text-lg"
        >
          {{ block.text }}
        </p>

        <div
          v-else-if="isText(block) && block.html && block.text"
          class="prose prose-neutral max-w-[75ch] prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg prose-h3:text-foreground/90 prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/80 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-ul:mt-4 prose-li:text-foreground/80"
          v-html="block.text"
        />

        <component
          :is="isBullets(block) && block.ordered ? 'ol' : 'ul'"
          v-else-if="isBullets(block)"
          class="grid gap-3 md:grid-cols-2 lg:gap-4"
        >
          <li
            v-for="(item, itemIndex) in block.items"
            :key="`${safeSection.id}-${blockIndex}-${itemIndex}`"
            class="group relative flex items-start gap-4 rounded-2xl border border-border/40 bg-muted/5 p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <div class="mt-1 flex shrink-0 items-center justify-center">
              <span
                v-if="!block.ordered"
                aria-hidden="true"
                class="h-2 w-2 rounded-full bg-primary/40 ring-4 ring-primary/10 transition-colors group-hover:bg-primary"
              />
              <span v-else class="font-mono text-xs font-bold text-primary/70">
                {{ String(itemIndex + 1).padStart(2, "0") }}.
              </span>
            </div>

            <span class="text-sm leading-relaxed text-foreground/80 md:text-base">
              {{ item }}
            </span>
          </li>
        </component>

        <figure
          v-else-if="isImage(block)"
          class="group relative overflow-hidden rounded-2xl border border-border/40 bg-muted/10"
        >
          <NuxtImg
            :src="normalizeCmsMediaSrc(block.src) || block.src"
            :alt="block.alt || safeSection.title"
            :width="block.width || 1200"
            :height="block.height || 800"
            class="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            loading="lazy"
          />

          <figcaption
            v-if="block.caption"
            class="absolute bottom-0 left-0 right-0 border-t border-border/20 bg-background/80 px-4 py-3 text-sm text-foreground/70 backdrop-blur-md"
          >
            {{ block.caption }}
          </figcaption>
        </figure>
      </template>
    </div>
  </section>
</template>