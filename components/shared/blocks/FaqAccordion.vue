<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "lucide-vue-next";
import { cn } from "@/lib/utils";

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

type FaqAccordionVariant = "default" | "editorial";

const props = withDefaults(
  defineProps<{
    items?: IncomingFaq[];
    class?: string;
    variant?: FaqAccordionVariant;
  }>(),
  {
    items: () => [],
    class: "",
    variant: "default",
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

const isEditorial = computed(() => props.variant === "editorial");
</script>

<template>
  <div
    v-if="normalized.length"
    :class="
      cn(
        isEditorial
          ? 'w-full max-w-[960px] border-t border-border/70'
          : 'space-y-3',
        props.class
      )
    "
  >
    <details
      v-for="(faq, index) in normalized"
      :key="`${index}-${faq.q}`"
      :class="
        isEditorial
          ? 'group border-b border-border/70 bg-transparent'
          : 'group overflow-hidden rounded-2xl border border-border/70 bg-card/70'
      "
    >
      <summary
        :class="
          isEditorial
            ? 'flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-4 pl-0 pr-1 text-left outline-none transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-4 focus-visible:ring-offset-background md:min-h-16 md:py-[18px]'
            : 'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left'
        "
      >
        <span
          :class="
            isEditorial
              ? 'min-w-0 text-body font-semibold leading-6 text-foreground'
              : 'text-base font-semibold leading-6 text-foreground'
          "
        >
          {{ faq.q }}
        </span>

        <span
          v-if="!isEditorial"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>

        <Plus
          v-else
          class="size-[19px] shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 group-hover:text-foreground"
          :stroke-width="1.8"
          aria-hidden="true"
        />
      </summary>

      <div
        :class="
          isEditorial
            ? 'pb-5 pl-0 pr-10 md:pb-[18px]'
            : 'border-t border-border/60 px-5 py-4'
        "
      >
        <p
          :class="
            isEditorial
              ? 'max-w-[72ch] whitespace-pre-line text-body leading-7 text-muted-foreground'
              : 'whitespace-pre-line text-body leading-7 text-foreground/80'
          "
        >
          {{ faq.a }}
        </p>
      </div>
    </details>
  </div>
</template>