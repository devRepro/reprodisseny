<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import ContentTypesGrid from "@/components/marketing/content/ContentTypesGrid.vue";

type CategoryBlock =
  | { type: "text"; text?: string; html?: boolean }
  | { type: "bullets"; items?: string[]; ordered?: boolean }
  | {
      type: "image";
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
      caption?: string;
    };

type CategoryTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

type IncomingSection = {
  id?: string;
  key?: string;
  title?: string;
  intro?: string;
  items?: CategoryTypeItem[];
  blocks?: CategoryBlock[];
  content?: CategoryBlock[];
  text?: string;
  html?: string;
};

type SafeSection = {
  id: string;
  key?: string;
  title: string;
  intro?: string;
  items?: CategoryTypeItem[];
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

const safeSections = computed<SafeSection[]>(() =>
  (props.sections || [])
    .map((section, index) => {
      const title = String(section?.title ?? "").trim();
      const key = String(section?.key ?? "").trim() || undefined;
      const intro = String(section?.intro ?? "").trim() || undefined;
      const items = Array.isArray(section?.items) ? section.items.filter(Boolean) : [];
      const blocks = normalizeSectionBlocks(section);

      const hasContent = blocks.length > 0 || items.length > 0;
      if (!title || !hasContent) return null;

      const rawId = String(section?.id ?? section?.key ?? "").trim();

      return {
        id: makeAnchorId(rawId || title, `seccion-${index + 1}`),
        key,
        title,
        ...(intro ? { intro } : {}),
        ...(items.length ? { items } : {}),
        blocks,
      };
    })
    .filter((s): s is SafeSection => Boolean(s))
);

const activeId = ref<string>("");
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!props.showSectionNav || safeSections.value.length <= 1) return;

  activeId.value = safeSections.value[0]?.id ?? "";

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
    for (const section of safeSections.value) {
      const el = document.getElementById(section.id);
      if (el && observer) observer.observe(el);
    }
  }, 100);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const yOffset = -100;
  const y = el.getBoundingClientRect().top + window.scrollY + yOffset;

  window.scrollTo({ top: y, behavior: "smooth" });
  activeId.value = id;
}

function isText(b: CategoryBlock): b is Extract<CategoryBlock, { type: "text" }> {
  return b?.type === "text";
}

function isBullets(b: CategoryBlock): b is Extract<CategoryBlock, { type: "bullets" }> {
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
  <div v-if="safeSections.length" class="relative w-full">
    <div
      v-if="showSectionNav && safeSections.length > 1"
      class="pointer-events-none sticky top-6 z-40 mx-auto mb-10 flex max-w-fit justify-center px-4"
    >
      <nav
        aria-label="Navegación de secciones"
        class="no-scrollbar pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-border/40 bg-background/80 p-1.5 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      >
        <button
          v-for="section in safeSections"
          :key="section.id"
          type="button"
          :aria-current="activeId === section.id ? 'true' : undefined"
          class="relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          :class="[
            activeId === section.id
              ? 'bg-primary text-primary-foreground shadow-md scale-100'
              : 'text-foreground/60 hover:bg-muted/80 hover:text-foreground scale-95 hover:scale-100',
          ]"
          @click="scrollToSection(section.id)"
        >
          {{ section.title }}
        </button>
      </nav>
    </div>

    <div class="w-full space-y-8 md:space-y-12">
      <template v-for="(section, sectionIdx) in safeSections" :key="section.id">
        <ContentTypesGrid
          v-if="section.key === 'types' && section.items?.length"
          :section-id="section.id"
          :title="section.title"
          :intro="section.intro"
          :items="section.items"
        />

        <section
          v-else
          :id="section.id"
          class="scroll-mt-32 w-full overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <header
            class="flex items-center gap-4 border-b border-border/40 bg-muted/10 px-6 py-5 md:px-8"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <span aria-hidden="true" class="font-mono text-xs font-bold tabular-nums">
                {{ String(sectionIdx + 1).padStart(2, "0") }}
              </span>
            </div>
            <h2 class="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {{ section.title }}
            </h2>
          </header>

          <div class="space-y-8 px-6 py-8 md:px-8 md:py-10">
            <template
              v-for="(block, blockIndex) in section.blocks"
              :key="`${section.id}-${blockIndex}`"
            >
              <p
                v-if="isText(block) && !block.html && block.text"
                class="max-w-[75ch] text-base leading-relaxed text-foreground/80 md:text-lg"
              >
                {{ block.text }}
              </p>

              <div
                v-else-if="isText(block) && block.html && block.text"
                class="prose prose-neutral max-w-[75ch] prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg prose-h3:text-foreground/90 prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/80 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-ul:mt-4 prose-li:text-foreground/80 first:prose-headings:mt-0"
                v-html="block.text"
              />

              <component
                :is="isBullets(block) && (block as any).ordered ? 'ol' : 'ul'"
                v-else-if="isBullets(block)"
                class="grid gap-3 md:grid-cols-2 lg:gap-4"
              >
                <li
                  v-for="(item, itemIndex) in (block as any).items"
                  :key="`${section.id}-${blockIndex}-${itemIndex}`"
                  class="group relative flex items-start gap-4 rounded-2xl border border-border/40 bg-muted/5 p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
                >
                  <div class="mt-1 flex shrink-0 items-center justify-center">
                    <span
                      v-if="!(block as any).ordered"
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
                  :src="normalizeCmsMediaSrc((block as any).src) || (block as any).src"
                  :alt="(block as any).alt || section.title"
                  :width="(block as any).width || 1200"
                  :height="(block as any).height || 800"
                  class="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <figcaption
                  v-if="(block as any).caption"
                  class="absolute bottom-0 left-0 right-0 border-t border-border/20 bg-background/80 px-4 py-3 text-sm text-foreground/70 backdrop-blur-md"
                >
                  {{ (block as any).caption }}
                </figcaption>
              </figure>
            </template>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
