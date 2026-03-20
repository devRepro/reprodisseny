<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "reka-ui";
import { ChevronDown } from "lucide-vue-next";
import { computed } from "vue";

type ProductFaqItem = {
  q: string;
  a: string;
};

const props = withDefaults(
  defineProps<{
    faqs?: ProductFaqItem[];
    type?: "single" | "multiple";
    collapsible?: boolean;
    defaultOpenFirst?: boolean;
  }>(),
  {
    faqs: () => [],
    type: "single",
    collapsible: true,
    defaultOpenFirst: true,
  }
);

const safeFaqs = computed(() =>
  (props.faqs || [])
    .filter((faq) => faq && typeof faq === "object")
    .map((faq) => ({
      q: String(faq.q || "").trim(),
      a: String(faq.a || "").trim(),
    }))
    .filter((faq) => faq.q && faq.a)
);

const defaultValue = computed(() => {
  if (!props.defaultOpenFirst || !safeFaqs.value.length) return undefined;
  return props.type === "multiple" ? ["faq-0"] : "faq-0";
});
</script>

<template>
  <div v-if="safeFaqs.length" class="w-full">
    <AccordionRoot
      :type="type"
      :collapsible="collapsible"
      :default-value="defaultValue"
      class="space-y-3"
    >
      <AccordionItem
        v-for="(faq, index) in safeFaqs"
        :key="`${faq.q}-${index}`"
        :value="`faq-${index}`"
        class="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_8px_24px_-22px_hsl(var(--foreground)/0.12)]"
      >
        <AccordionHeader>
          <AccordionTrigger
            class="group flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
          >
            <span
              class="text-base font-semibold leading-6 text-foreground md:text-[17px]"
            >
              {{ faq.q }}
            </span>

            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-foreground"
            >
              <ChevronDown class="h-4 w-4" />
            </span>
          </AccordionTrigger>
        </AccordionHeader>

        <AccordionContent
          class="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        >
          <div class="border-t border-border/70 px-5 py-5 md:px-6">
            <div
              class="max-w-none whitespace-pre-line text-body text-foreground/78 md:text-[17px] md:leading-[1.72]"
            >
              {{ faq.a }}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  </div>
</template>
