<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";

type ContentFormat = "plain" | "markdown" | "html";

export type ProcessStep = {
  title?: string;
  description: string;
  label?: string;
  format?: ContentFormat;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    steps?: ProcessStep[];
    introClass?: string;
    gridClass?: string;
    cardClass?: string;
    contentFormat?: ContentFormat;
  }>(),
  {
    title: "",
    description: "",
    steps: () => [],
    introClass: "",
    gridClass: "",
    cardClass: "",
    contentFormat: "markdown",
  }
);

function isGenericStepTitle(value: string) {
  return /^paso\s*\d{1,2}$/i.test(String(value || "").trim());
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInlineMarkdown(value: string) {
  let html = escapeHtml(value);

  html = html.replace(
    /\[([^[\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>'
  );

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^\*])\*([^*]+)\*/g, "$1<em>$2</em>");
  html = html.replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>");

  return html;
}

function markdownToHtml(value: string) {
  const source = String(value || "").replace(/\r\n/g, "\n").trim();
  if (!source) return "";

  const lines = source.split("\n");
  const blocks: string[] = [];

  let paragraph: string[] = [];
  let unordered: string[] = [];
  let ordered: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      `<p>${formatInlineMarkdown(paragraph.join("<br />"))}</p>`
    );
    paragraph = [];
  };

  const flushUnordered = () => {
    if (!unordered.length) return;
    blocks.push(
      `<ul>${unordered
        .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
        .join("")}</ul>`
    );
    unordered = [];
  };

  const flushOrdered = () => {
    if (!ordered.length) return;
    blocks.push(
      `<ol>${ordered
        .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
        .join("")}</ol>`
    );
    ordered = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushUnordered();
      flushOrdered();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushUnordered();
      flushOrdered();

      const level = Math.min(headingMatch[1].length + 2, 6);
      blocks.push(
        `<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`
      );
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushOrdered();
      unordered.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      flushUnordered();
      ordered.push(orderedMatch[1]);
      continue;
    }

    flushUnordered();
    flushOrdered();
    paragraph.push(line);
  }

  flushParagraph();
  flushUnordered();
  flushOrdered();

  return blocks.join("");
}

function renderRichText(value: string, format: ContentFormat) {
  const source = String(value || "").trim();
  if (!source) return "";

  if (format === "html") {
    return source;
  }

  if (format === "plain") {
    return `<p>${escapeHtml(source).replace(/\n/g, "<br />")}</p>`;
  }

  return markdownToHtml(source);
}

const introHtml = computed(() =>
  renderRichText(props.description, props.contentFormat)
);

const normalizedSteps = computed(() =>
  (props.steps || [])
    .filter((step) => String(step?.description || "").trim())
    .map((step, index) => {
      const rawTitle = String(step?.title || "").trim();

      return {
        ...step,
        cleanTitle: rawTitle && isGenericStepTitle(rawTitle) ? "" : rawTitle,
        cleanLabel: String(step?.label || "").trim(),
        number: String(index + 1).padStart(2, "0"),
        descriptionHtml: renderRichText(
          step.description,
          step.format || props.contentFormat
        ),
      };
    })
);
</script>

<template>
  <section v-if="normalizedSteps.length" class="w-full">
    <div
      v-if="title || description"
      :class="['mb-8 space-y-3 md:mb-10', introClass]"
    >
      <h3
        v-if="title"
        class="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
      >
        {{ title }}
      </h3>

      <div
        v-if="description"
        class="process-steps-richtext max-w-3xl"
        v-html="introHtml"
      />
    </div>

    <ol
      :class="[
        'grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5',
        gridClass,
      ]"
    >
      <li
        v-for="(step, index) in normalizedSteps"
        :key="`${step.number}-${step.cleanTitle || 'step'}-${index}`"
        class="h-full"
      >
        <Card
          :class="[
            'group relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md',
            cardClass,
          ]"
        >
          <CardContent class="relative h-full p-5 sm:p-6">
            <div
              class="pointer-events-none absolute right-4 top-3 select-none text-5xl font-semibold tracking-tight text-muted/40 sm:right-5 sm:top-4 sm:text-6xl"
              aria-hidden="true"
            >
              {{ step.number }}
            </div>

            <div class="relative flex h-full flex-col gap-5">
              <div class="flex items-start gap-4">
                <slot name="step-visual" :step="step" :index="index">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-sm font-semibold text-primary shadow-sm sm:h-14 sm:w-14"
                  >
                    <span class="sr-only">Paso</span>
                    {{ step.number }}
                  </div>
                </slot>

                <div class="min-w-0 flex-1 pt-1">
                  <div v-if="step.cleanLabel" class="mb-2">
                    <span
                      class="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {{ step.cleanLabel }}
                    </span>
                  </div>

                  <h4
                    v-if="step.cleanTitle"
                    class="text-base font-semibold leading-tight text-foreground md:text-lg"
                  >
                    {{ step.cleanTitle }}
                  </h4>

                  <h4 v-else class="sr-only">Paso {{ index + 1 }}</h4>
                </div>
              </div>

              <div
                class="process-steps-richtext flex-1"
                v-html="step.descriptionHtml"
              />
            </div>
          </CardContent>
        </Card>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.process-steps-richtext :deep(h3),
.process-steps-richtext :deep(h4),
.process-steps-richtext :deep(h5) {
  @apply mb-2 text-base font-semibold leading-tight text-foreground md:text-lg;
}

.process-steps-richtext :deep(p) {
  @apply text-sm leading-7 text-muted-foreground md:text-base;
}

.process-steps-richtext :deep(p + p) {
  @apply mt-3;
}

.process-steps-richtext :deep(ul),
.process-steps-richtext :deep(ol) {
  @apply mt-3 space-y-2 pl-5 text-sm leading-7 text-muted-foreground md:text-base;
}

.process-steps-richtext :deep(ul) {
  @apply list-disc;
}

.process-steps-richtext :deep(ol) {
  @apply list-decimal;
}

.process-steps-richtext :deep(li) {
  @apply pl-1;
}

.process-steps-richtext :deep(strong) {
  @apply font-semibold text-foreground;
}

.process-steps-richtext :deep(em) {
  @apply italic;
}

.process-steps-richtext :deep(code) {
  @apply rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground;
}

.process-steps-richtext :deep(a) {
  @apply font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80;
}
</style>