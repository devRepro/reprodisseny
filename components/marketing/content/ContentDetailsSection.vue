<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

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
    section?: IncomingSection | null;
    eyebrow?: string;
    showSectionNav?: boolean;
  }>(),
  {
    section: null,
    eyebrow: "Información de la categoría",
    showSectionNav: false,
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
  const blocks = normalizeSectionBlocks(section);
  if (!title || !blocks.length) return null;

  const rawId = String(section.id ?? section.key ?? "").trim();

  return {
    id: makeAnchorId(rawId || title, "detalles"),
    title,
    blocks,
  };
});

const activeId = ref("");

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!props.showSectionNav || !safeSection.value) return;

  activeId.value = safeSection.value.id;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id;
          break;
        }
      }
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
  );

  setTimeout(() => {
    const el = document.getElementById(safeSection.value?.id || "");
    if (el && observer) observer.observe(el);
  }, 100);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

function isText(b: CategoryBlock): b is Extract<CategoryBlock, { type: "text" }> {
  return b?.type === "text";
}

function isBullets(
  b: CategoryBlock
): b is Extract<CategoryBlock, { type: "bullets" }> {
  return (
    b?.type === "bullets" &&
    Array.isArray((b as any).items) &&
    (b as any).items.length > 0
  );
}

function isImage(b: CategoryBlock): b is Extract<CategoryBlock, { type: "image" }> {
  return b?.type === "image" && Boolean((b as any).src);
}
</script>

<template>
  <section
    v-if="safeSection"
    :id="safeSection.id"
    class="container-content scroll-mt-32"
    aria-label="Detalles de la categoría"
  >
    <div class="overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-sm">
      <header class="border-b border-border/40 bg-muted/10 px-6 py-5 md:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
          {{ eyebrow }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {{ safeSection.title }}
        </h2>
      </header>

      <div class="space-y-8 px-6 py-8 md:px-8 md:py-10">
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
    </div>
  </section>
</template>