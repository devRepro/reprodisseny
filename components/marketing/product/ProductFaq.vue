<script setup lang="ts">
import { computed } from "vue";

type ProductFaqItem = {
  q: string;
  a: string;
};

const props = withDefaults(
  defineProps<{
    faqs?: ProductFaqItem[];
  }>(),
  {
    faqs: () => [],
  }
);

const safeFaqs = computed(() =>
  (props.faqs || []).filter((faq): faq is ProductFaqItem =>
    Boolean(faq && typeof faq === "object" && faq.q?.trim() && faq.a?.trim())
  )
);
</script>

<template>
  <div class="space-y-3">
    <details
      v-for="(faq, index) in safeFaqs"
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
