<script setup lang="ts">
import { computed } from "vue";

type ProductBlock =
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
  blocks: ProductBlock[];
  text?: string;
};

const props = withDefaults(
  defineProps<{
    sections?: ProductSection[];
    showSectionNav?: boolean;
  }>(),
  {
    sections: () => [],
    showSectionNav: false,
  }
);

const safeSections = computed(() =>
  (props.sections || []).filter((section): section is ProductSection =>
    Boolean(
      section &&
        typeof section === "object" &&
        section.id &&
        section.title &&
        Array.isArray(section.blocks) &&
        section.blocks.length
    )
  )
);

function isTextBlock(
  block: ProductBlock
): block is Extract<ProductBlock, { type: "text" }> {
  return block?.type === "text";
}

function isBulletsBlock(
  block: ProductBlock
): block is Extract<ProductBlock, { type: "bullets" }> {
  return block?.type === "bullets";
}

function isImageBlock(
  block: ProductBlock
): block is Extract<ProductBlock, { type: "image" }> {
  return block?.type === "image";
}
</script>

<template>
  <div class="w-full">
    <nav
      v-if="showSectionNav && safeSections.length > 1"
      aria-label="Navegación de secciones del producto"
      class="mb-8 overflow-x-auto pb-2"
    >
      <div class="flex min-w-max gap-2">
        <a
          v-for="section in safeSections"
          :key="section.id"
          :href="`#${section.id}`"
          class="inline-flex min-h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground/80 transition hover:border-primary hover:text-primary"
        >
          {{ section.title }}
        </a>
      </div>
    </nav>

    <div class="space-y-10 md:space-y-14">
      <section
        v-for="section in safeSections"
        :id="section.id"
        :key="section.id"
        class="scroll-mt-28"
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
              class="text-body leading-7 text-foreground/85 md:text-[17px]"
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
              class="grid gap-3"
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
              <img
                :src="block.src"
                :alt="block.alt || section.title"
                :width="block.width"
                :height="block.height"
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
