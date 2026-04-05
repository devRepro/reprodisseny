<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted, onBeforeUnmount } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

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
      const blocks = normalizeSectionBlocks(section);

      if (!title || !blocks.length) return null;

      const rawId = String(section?.id ?? section?.key ?? "").trim();

      return {
        id: makeAnchorId(rawId || title, `seccion-${index + 1}`),
        title,
        blocks,
      };
    })
    .filter((section): section is SafeSection => Boolean(section))
);

const hasSectionNav = computed(
  () => props.showSectionNav && safeSections.value.length > 1
);

const sectionIdsSignature = computed(() =>
  safeSections.value.map((section) => section.id).join("|")
);

const activeId = ref<string>("");

let observer: IntersectionObserver | null = null;

function disconnectObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

async function initObserver() {
  disconnectObserver();

  if (!safeSections.value.length) {
    activeId.value = "";
    return;
  }

  if (!activeId.value) {
    activeId.value = safeSections.value[0]?.id ?? "";
  }

  if (!hasSectionNav.value) return;

  await nextTick();

  observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      const nextActiveId = visibleEntries[0]?.target?.id;
      if (nextActiveId) activeId.value = nextActiveId;
    },
    {
      rootMargin: "-18% 0px -70% 0px",
      threshold: [0, 0.1, 0.25],
    }
  );

  for (const section of safeSections.value) {
    const el = document.getElementById(section.id);
    if (el) observer.observe(el);
  }
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  activeId.value = id;
  el.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function isText(block: CategoryBlock): block is Extract<CategoryBlock, { type: "text" }> {
  return block?.type === "text";
}

function isBullets(
  block: CategoryBlock
): block is Extract<CategoryBlock, { type: "bullets" }> {
  return (
    block?.type === "bullets" &&
    Array.isArray((block as any).items) &&
    (block as any).items.length > 0
  );
}

function isImage(
  block: CategoryBlock
): block is Extract<CategoryBlock, { type: "image" }> {
  return block?.type === "image" && Boolean((block as any).src);
}

onMounted(() => {
  void initObserver();
});

watch([sectionIdsSignature, hasSectionNav], () => {
  void initObserver();
});

onBeforeUnmount(() => {
  disconnectObserver();
});
</script>

<template>
  <div v-if="safeSections.length" class="w-full">
    <div v-if="hasSectionNav" class="sticky top-4 z-30 mb-6 w-full md:top-6 md:mb-8">
      <nav
        aria-label="Navegación de secciones"
        class="w-full overflow-hidden rounded-[20px] border border-border/70 bg-card/95 shadow-[0_12px_32px_-24px_hsl(var(--foreground)/0.18)] backdrop-blur-md supports-[backdrop-filter]:bg-card/85"
      >
        <div class="no-scrollbar flex min-h-12 items-center gap-2 overflow-x-auto p-2">
          <button
            v-for="section in safeSections"
            :key="section.id"
            type="button"
            :aria-current="activeId === section.id ? 'true' : undefined"
            class="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :class="
              activeId === section.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-muted hover:text-foreground'
            "
            @click="scrollToSection(section.id)"
          >
            {{ section.title }}
          </button>
        </div>
      </nav>
    </div>

    <div class="space-y-6 md:space-y-8">
      <section
        v-for="(section, sectionIdx) in safeSections"
        :id="section.id"
        :key="section.id"
        class="scroll-mt-32 w-full overflow-hidden rounded-[24px] border border-border/70 bg-card"
      >
        <header
          class="flex items-center gap-4 border-b border-border/50 bg-muted/10 px-5 py-4 md:px-8 md:py-5"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <span aria-hidden="true" class="font-mono text-xs font-bold tabular-nums">
              {{ String(sectionIdx + 1).padStart(2, "0") }}
            </span>
          </div>

          <h2
            class="text-[20px] font-semibold leading-[1.25] text-foreground md:text-[24px]"
          >
            {{ section.title }}
          </h2>
        </header>

        <div class="space-y-6 px-5 py-6 md:space-y-8 md:px-8 md:py-8">
          <template
            v-for="(block, blockIndex) in section.blocks"
            :key="`${section.id}-${blockIndex}`"
          >
            <p
              v-if="isText(block) && !block.html && block.text"
              class="max-w-[72ch] text-base leading-[1.8] text-foreground/80"
            >
              {{ block.text }}
            </p>

            <div
              v-else-if="isText(block) && block.html && block.text"
              class="prose prose-neutral max-w-[72ch] prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg prose-h3:text-foreground/90 prose-p:text-base prose-p:leading-[1.8] prose-p:text-foreground/80 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-foreground prose-ul:mt-4 prose-li:text-foreground/80 first:prose-headings:mt-0"
              v-html="block.text"
            />

            <component
              :is="isBullets(block) && (block as any).ordered ? 'ol' : 'ul'"
              v-else-if="isBullets(block)"
              class="grid gap-3 md:grid-cols-2 md:gap-4"
            >
              <li
                v-for="(item, itemIndex) in (block as any).items"
                :key="`${section.id}-${blockIndex}-${itemIndex}`"
                class="flex items-start gap-4 rounded-2xl border border-border/50 bg-muted/5 p-4"
              >
                <div class="mt-1 flex shrink-0 items-center justify-center">
                  <span
                    v-if="!(block as any).ordered"
                    aria-hidden="true"
                    class="h-2 w-2 rounded-full bg-primary/45 ring-4 ring-primary/10"
                  />
                  <span v-else class="font-mono text-xs font-bold text-primary/75">
                    {{ String(itemIndex + 1).padStart(2, "0") }}.
                  </span>
                </div>

                <span class="text-sm leading-[1.75] text-foreground/80 md:text-base">
                  {{ item }}
                </span>
              </li>
            </component>

            <figure
              v-else-if="isImage(block)"
              class="overflow-hidden rounded-2xl border border-border/50 bg-muted/10"
            >
              <NuxtImg
                :src="normalizeCmsMediaSrc((block as any).src) || (block as any).src"
                :alt="(block as any).alt || section.title"
                :width="(block as any).width || 1200"
                :height="(block as any).height || 800"
                class="h-auto w-full object-cover"
                loading="lazy"
              />

              <figcaption
                v-if="(block as any).caption"
                class="border-t border-border/30 bg-background/80 px-4 py-3 text-sm text-foreground/70"
              >
                {{ (block as any).caption }}
              </figcaption>
            </figure>
          </template>
        </div>
      </section>
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
