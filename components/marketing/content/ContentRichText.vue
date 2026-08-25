<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    html?: string;
    intro?: string;
    compact?: boolean;
    class?: string;
  }>(),
  {
    html: "",
    intro: "",
    compact: false,
    class: "",
  }
);

const hasContent = computed(() => Boolean(props.intro.trim() || props.html.trim()));
</script>

<template>
  <div
    v-if="hasContent"
    :class="cn('content-rich-text min-w-0', compact && 'content-rich-text--compact', props.class)"
  >
    <p v-if="intro" class="content-rich-text__intro">
      {{ intro }}
    </p>

    <!-- `html` se genera con markdown-it (HTML CMS desactivado) en SectionViewModel. -->
    <div v-if="html" class="content-rich-text__body" v-html="html" />
  </div>
</template>

<style scoped>
.content-rich-text {
  @apply max-w-[76ch] space-y-5 text-[15px] leading-7 text-muted-foreground md:text-base;
}

.content-rich-text__intro {
  @apply mb-0 text-base leading-7 text-foreground/80 md:text-lg;
}

.content-rich-text__body {
  @apply min-w-0 space-y-4;
}

:deep(.content-rich-text__body > :first-child) {
  margin-top: 0;
}

:deep(.content-rich-text__body > :last-child) {
  margin-bottom: 0;
}

:deep(.content-rich-text__body p) {
  @apply my-4 leading-7 text-muted-foreground;
}

:deep(.content-rich-text__body h3) {
  @apply mb-3 mt-8 text-xl font-semibold leading-tight tracking-tight text-foreground md:text-2xl;
}

:deep(.content-rich-text__body h4) {
  @apply mb-2 mt-6 text-base font-semibold leading-tight tracking-tight text-foreground md:text-lg;
}

:deep(.content-rich-text__body strong) {
  @apply font-semibold text-foreground;
}

:deep(.content-rich-text__body a) {
  @apply break-words font-medium text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary;
}

:deep(.content-rich-text__body ul),
:deep(.content-rich-text__body ol) {
  @apply my-5 space-y-2 pl-6;
}

:deep(.content-rich-text__body ul) {
  @apply list-disc;
}

:deep(.content-rich-text__body ol) {
  @apply list-decimal;
}

:deep(.content-rich-text__body li) {
  @apply pl-1 leading-7 text-muted-foreground marker:text-primary;
}

:deep(.content-rich-text__body blockquote) {
  @apply my-6 border-l-4 border-primary/35 bg-primary/5 px-5 py-3 text-foreground;
}

:deep(.content-rich-text__body blockquote p) {
  @apply my-0 text-foreground/85;
}

:deep(.content-rich-text__body code) {
  @apply rounded bg-muted px-1.5 py-0.5 text-[0.9em] text-foreground;
}

:deep(.content-rich-text__body table) {
  @apply my-6 block w-full max-w-full overflow-x-auto rounded-xl border border-border/70 text-sm;
  border-collapse: separate;
  border-spacing: 0;
}

:deep(.content-rich-text__body th),
:deep(.content-rich-text__body td) {
  @apply min-w-32 border-b border-r border-border/60 px-4 py-3 text-left align-top;
}

:deep(.content-rich-text__body th) {
  @apply bg-muted/60 font-semibold text-foreground;
}

:deep(.content-rich-text__body tr:last-child td) {
  @apply border-b-0;
}

.content-rich-text--compact {
  @apply max-w-none text-sm md:text-[15px];
}

.content-rich-text--compact :deep(h3) {
  @apply mt-6 text-base md:text-lg;
}
</style>
