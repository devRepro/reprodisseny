<script setup lang="ts">
import { computed } from "vue";

type Faq = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

const props = withDefaults(
  defineProps<{
    items: Faq[];
    title?: string;
    subtitle?: string;
  }>(),
  {
    items: () => [],
    title: "",
    subtitle: "",
  }
);

const normalized = computed(() =>
  (props.items || [])
    .map((f) => ({
      q: String(f.q ?? f.question ?? "").trim(),
      a: String(f.a ?? f.answer ?? "").trim(),
    }))
    .filter((f) => f.q && f.a)
);
</script>

<template>
  <section v-if="normalized.length" class="w-full">
    <header v-if="title || subtitle" class="max-w-3xl">
      <p v-if="title" class="text-label text-primary">Preguntas frecuentes</p>

      <h2
        v-if="title"
        class="mt-2 text-[clamp(1.6rem,2vw,2rem)] font-semibold leading-tight tracking-tight text-foreground"
      >
        {{ title }}
      </h2>

      <p v-if="subtitle" class="mt-2 max-w-[62ch] text-body text-muted-foreground">
        {{ subtitle }}
      </p>
    </header>

    <div class="mt-8 space-y-3">
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
  </section>
</template>
