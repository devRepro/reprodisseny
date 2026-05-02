<!-- components/marketing/content/ContentDetailsSection.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type IncomingSection = {
  id?: string;
  key?: string;
  title?: string;
  intro?: string;
  body?: string;
  text?: string;
  html?: string;
};

type InlineToken =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "strong";
      value: string;
    };

type MarkdownBlock =
  | {
      type: "heading";
      level: 3 | 4;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      ordered: boolean;
      items: string[];
    };

type SafeSection = {
  id: string;
  title: string;
  intro?: string;
  markdown: string;
  html: string;
  blocks: MarkdownBlock[];
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

function parseInlineMarkdown(value: string): InlineToken[] {
  const text = String(value || "");
  const tokens: InlineToken[] = [];
  const regex = /\*\*(.*?)\*\*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    if (match[1]) {
      tokens.push({
        type: "strong",
        value: match[1],
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return tokens;
}

function parseMarkdownBlocks(value: string): MarkdownBlock[] {
  const raw = String(value || "").trim();
  if (!raw) return [];

  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let currentListOrdered = false;

  function flushParagraph() {
    const text = paragraphLines.join(" ").trim();

    if (text) {
      blocks.push({
        type: "paragraph",
        text,
      });
    }

    paragraphLines = [];
  }

  function flushList() {
    if (listItems.length) {
      blocks.push({
        type: "list",
        ordered: currentListOrdered,
        items: listItems,
      });
    }

    listItems = [];
    currentListOrdered = false;
  }

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    const h4Match = line.match(/^####\s+(.+)$/);
    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);

    if (h3Match || h4Match) {
      flushParagraph();
      flushList();

      blocks.push({
        type: "heading",
        level: h3Match ? 3 : 4,
        text: h3Match?.[1] || h4Match?.[1] || "",
      });

      continue;
    }

    if (unorderedMatch || orderedMatch) {
      flushParagraph();

      const ordered = Boolean(orderedMatch);
      const itemText = unorderedMatch?.[1] || orderedMatch?.[1] || "";

      if (listItems.length && currentListOrdered !== ordered) {
        flushList();
      }

      currentListOrdered = ordered;
      listItems.push(itemText);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

const safeSection = computed<SafeSection | null>(() => {
  const section = props.section;
  if (!section) return null;

  const title = String(section.title ?? "").trim();
  const intro = String(section.intro ?? "").trim() || undefined;
  const html = String(section.html ?? "").trim();
  const markdown = String(section.body ?? section.text ?? "").trim();

  if (!title || (!html && !markdown)) return null;

  const rawId = String(section.id ?? section.key ?? title).trim();

  return {
    id: makeAnchorId(rawId, "seccion"),
    title,
    ...(intro ? { intro } : {}),
    html,
    markdown,
    blocks: parseMarkdownBlocks(markdown),
  };
});

const proseClass =
  "prose prose-neutral max-w-[72ch] prose-headings:font-semibold prose-headings:tracking-[-0.03em] prose-headings:text-foreground prose-h2:mt-0 prose-h2:mb-3 prose-h2:text-[1.7rem] prose-h2:leading-[1.12] prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-[1.2rem] prose-h3:leading-[1.2] prose-h4:mt-5 prose-h4:mb-2 prose-h4:text-[1rem] prose-h4:font-semibold prose-p:my-3 prose-p:text-[15px] prose-p:leading-7 prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-foreground prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-muted-foreground";

const paragraphClass =
  "mb-0 max-w-[72ch] font-body text-[15px] leading-7 text-muted-foreground md:text-base";

const heading3Class =
  "mb-0 mt-2 max-w-[72ch] text-xl font-semibold leading-tight tracking-tight text-foreground md:text-2xl";

const heading4Class =
  "mb-0 mt-1 max-w-[72ch] text-base font-semibold leading-tight tracking-tight text-foreground md:text-lg";

const listClass = "mb-0 grid max-w-[72ch] gap-3";

const listItemClass =
  "flex gap-3 font-body text-[15px] leading-7 text-muted-foreground md:text-base";
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

    <div :class="cn('space-y-5 md:space-y-6', props.contentClass)">
      <div v-if="safeSection.html" :class="proseClass" v-html="safeSection.html" />

      <template v-else>
        <template
          v-for="(block, blockIndex) in safeSection.blocks"
          :key="`${safeSection.id}-${blockIndex}`"
        >
          <h3 v-if="block.type === 'heading' && block.level === 3" :class="heading3Class">
            <template
              v-for="(token, tokenIndex) in parseInlineMarkdown(block.text)"
              :key="`${blockIndex}-h3-${tokenIndex}`"
            >
              <strong
                v-if="token.type === 'strong'"
                class="font-semibold text-foreground"
              >
                {{ token.value }}
              </strong>

              <template v-else>
                {{ token.value }}
              </template>
            </template>
          </h3>

          <h4
            v-else-if="block.type === 'heading' && block.level === 4"
            :class="heading4Class"
          >
            <template
              v-for="(token, tokenIndex) in parseInlineMarkdown(block.text)"
              :key="`${blockIndex}-h4-${tokenIndex}`"
            >
              <strong
                v-if="token.type === 'strong'"
                class="font-semibold text-foreground"
              >
                {{ token.value }}
              </strong>

              <template v-else>
                {{ token.value }}
              </template>
            </template>
          </h4>

          <p v-else-if="block.type === 'paragraph'" :class="paragraphClass">
            <template
              v-for="(token, tokenIndex) in parseInlineMarkdown(block.text)"
              :key="`${blockIndex}-p-${tokenIndex}`"
            >
              <strong
                v-if="token.type === 'strong'"
                class="font-semibold text-foreground"
              >
                {{ token.value }}
              </strong>

              <template v-else>
                {{ token.value }}
              </template>
            </template>
          </p>

          <component
            :is="block.ordered ? 'ol' : 'ul'"
            v-else-if="block.type === 'list'"
            :class="listClass"
          >
            <li
              v-for="(item, itemIndex) in block.items"
              :key="`${blockIndex}-${itemIndex}`"
              :class="listItemClass"
            >
              <span
                v-if="!block.ordered"
                class="mt-[0.72em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                aria-hidden="true"
              />

              <span
                v-else
                class="mt-[0.12em] inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/5 px-2 text-xs font-semibold text-primary"
                aria-hidden="true"
              >
                {{ itemIndex + 1 }}
              </span>

              <span>
                <template
                  v-for="(token, tokenIndex) in parseInlineMarkdown(item)"
                  :key="`${blockIndex}-${itemIndex}-${tokenIndex}`"
                >
                  <strong
                    v-if="token.type === 'strong'"
                    class="font-semibold text-foreground"
                  >
                    {{ token.value }}
                  </strong>

                  <template v-else>
                    {{ token.value }}
                  </template>
                </template>
              </span>
            </li>
          </component>
        </template>
      </template>
    </div>
  </section>
</template>
