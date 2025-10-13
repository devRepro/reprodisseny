<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}
// default a [] para que nunca rompa
const props = withDefaults(defineProps<{ items?: FaqItem[] }>(), { items: () => [] });
</script>

<template>
  <Accordion v-if="items.length" type="single" collapsible class="w-full">
    <AccordionItem v-for="(faq, index) in items" :key="index" :value="`item-${index}`">
      <AccordionTrigger>
        <h3 class="text-left font-semibold text-base">{{ faq.question }}</h3>
      </AccordionTrigger>
      <AccordionContent>
        <!-- Usa v-html si tus respuestas llevan Markdown/HTML ya renderizado;
             si no, deja interpolación simple {{ faq.answer }} -->
        <p class="text-base text-muted-foreground" v-html="faq.answer"></p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
