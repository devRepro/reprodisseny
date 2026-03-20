<script setup lang="ts">
import { computed } from "vue";

type ProductContentBlock =
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

type ProductSection = {
  id: string;
  key?: string;
  title: string;
  text?: string;
  blocks: ProductContentBlock[];
};

const props = withDefaults(
  defineProps<{
    sections?: ProductSection[];
    showSectionNav?: boolean;
    stickyNav?: boolean;
    stickyTop?: number | null;
  }>(),
  {
    sections: () => [],
    showSectionNav: true,
    stickyNav: false,
    stickyTop: null,
  }
);

const safeSections = computed(() =>
  (props.sections || [])
    .filter(
      (section) =>
        section &&
        typeof section === "object" &&
        String(section.id || "").trim() &&
        String(section.title || "").trim()
    )
    .map((section) => ({
      ...section,
      id: String(section.id).trim(),
      title: String(section.title).trim(),
      key: String(section.key || "").trim(),
      text: String(section.text || "").trim(),
      blocks: Array.isArray(section.blocks) ? section.blocks.filter(Boolean) : [],
    }))
    .filter((section) => section.blocks.length > 0 || section.text)
);

function isTextBlock(
  block: ProductContentBlock
): block is Extract<ProductContentBlock, { type: "text" }> {
  return block.type === "text";
}

function isBulletsBlock(
  block: ProductContentBlock
): block is Extract<ProductContentBlock, { type: "bullets" }> {
  return block.type === "bullets";
}

function isImageBlock(
  block: ProductContentBlock
): block is Extract<ProductContentBlock, { type: "image" }> {
  return block.type === "image";
}

function hasBulletCardStyle(sectionKey?: string) {
  return [
    "beneficios",
    "aplicaciones",
    "tipos",
    "formatos-y-soportes",
    "acabados",
  ].includes(String(sectionKey || ""));
}
</script>

<template>
  <div v-if="safeSections.length" class="w-full">
    <nav
      v-if="showSectionNav && safeSections.length > 1"
      :class="[
        'mb-8 overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.12)] supports-[backdrop-filter]:bg-card/80',
        stickyNav ? 'sticky z-30 backdrop-blur' : '',
      ]"
      :style="stickyNav && stickyTop != null ? { top: `${stickyTop}px` } : undefined"
      aria-label="Navegación de secciones del producto"
    >
      <div class="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 py-3">
        <a
          v-for="section in safeSections"
          :key="section.id"
          :href="`#${section.id}`"
          class="inline-flex shrink-0 items-center rounded-xl border border-border/70 bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
        >
          {{ section.title }}
        </a>
      </div>
    </nav>

    <div class="space-y-10 md:space-y-12">
      <section
        v-for="section in safeSections"
        :id="section.id"
        :key="section.id"
        class="scroll-mt-28 rounded-[28px] border border-border/70 bg-card px-5 py-6 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.12)] md:px-8 md:py-8"
        :aria-labelledby="`${section.id}-title`"
      >
        <div class="space-y-6">
          <header class="space-y-2">
            <p
              v-if="section.key"
              class="text-label uppercase tracking-[0.08em] text-primary"
            >
              {{ section.key.replace(/-/g, " ") }}
            </p>

            <h2
              :id="`${section.id}-title`"
              class="text-[clamp(1.5rem,2.1vw,2rem)] font-semibold leading-[1.1] tracking-tight text-foreground"
            >
              {{ section.title }}
            </h2>
          </header>

          <div class="space-y-6">
            <template
              v-for="(block, blockIndex) in section.blocks"
              :key="`${section.id}-${block.type}-${blockIndex}`"
            >
              <template v-if="isTextBlock(block) && block.text">
                <div
                  v-if="block.html"
                  class="max-w-none text-body text-foreground/80 md:text-[17px] md:leading-[1.75]"
                  v-html="block.text"
                />

                <div
                  v-else
                  class="max-w-none whitespace-pre-line text-body text-foreground/80 md:text-[17px] md:leading-[1.75]"
                >
                  {{ block.text }}
                </div>
              </template>

              <div
                v-else-if="isBulletsBlock(block) && block.items?.length"
                :class="
                  hasBulletCardStyle(section.key)
                    ? 'grid gap-3 sm:grid-cols-2'
                    : 'space-y-3'
                "
              >
                <template v-if="hasBulletCardStyle(section.key)">
                  <article
                    v-for="item in block.items"
                    :key="item"
                    class="rounded-2xl border border-border/70 bg-background px-4 py-4 shadow-[0_8px_24px_-22px_hsl(var(--foreground)/0.14)]"
                  >
                    <p class="text-body text-foreground/82">
                      {{ item }}
                    </p>
                  </article>
                </template>

                <ul v-else class="space-y-3">
                  <li
                    v-for="item in block.items"
                    :key="item"
                    class="flex items-start gap-3"
                  >
                    <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary/80" />
                    <span class="text-body text-foreground/82">
                      {{ item }}
                    </span>
                  </li>
                </ul>
              </div>

              <figure
                v-else-if="isImageBlock(block) && block.src"
                class="overflow-hidden rounded-2xl border border-border/70 bg-background"
              >
                <NuxtImg
                  :src="block.src"
                  :alt="block.alt || section.title"
                  class="w-full object-cover"
                  :width="block.width || 1200"
                  :height="block.height || 720"
                  sizes="(max-width: 768px) 100vw, 880px"
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
