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
