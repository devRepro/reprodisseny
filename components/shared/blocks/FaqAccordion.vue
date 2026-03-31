<script setup lang="ts">
import { computed } from "vue";

type IncomingFaq = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

type SafeFaq = {
  q: string;
  a: string;
};

const props = withDefaults(
  defineProps<{
    items?: IncomingFaq[];
    class?: string;
  }>(),
  {
    items: () => [],
    class: "",
  }
);

const normalized = computed<SafeFaq[]>(() =>
  (props.items || [])
    .map((item) => ({
      q: String(item?.q ?? item?.question ?? "").trim(),
      a: String(item?.a ?? item?.answer ?? "").trim(),
    }))
    .filter((item) => Boolean(item.q && item.a))
);
</script>

<template>
  <div v-if="normalized.length" :class="['space-y-3', props.class]">
    <details
      v-for="(faq, index) in normalized"
      :key="`${index}-${faq.q}`"
      class="group overflow-hidden rounded-2xl border border-border/70 bg-card/70"
    >
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span class="text-base font-semibold leading-6 text-foreground">
          {{ faq.q }}
        </span>

        <span
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>

      <div class="border-t border-border/60 px-5 py-4">
        <p class="whitespace-pre-line text-body leading-7 text-foreground/80">
          {{ faq.a }}
        </p>
      </div>
    </details>
  </div>
</template>