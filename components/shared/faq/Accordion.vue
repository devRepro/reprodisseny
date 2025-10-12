<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// 1. Definimos la estructura de cada objeto en el array de FAQs.
interface FaqItem {
  question: string;
  answer: string;
}

// 2. El componente acepta una propiedad (prop) llamada "items",
//    que debe ser un array que sigue la estructura de FaqItem.
defineProps<{
  items: FaqItem[];
}>();
</script>

<template>
  <Accordion type="single" class="w-full" collapsible>
    <AccordionItem v-for="(faq, index) in items" :key="index" :value="`item-${index}`">
      <AccordionTrigger>
        <h3 class="text-left font-semibold text-base">{{ faq.question }}</h3>
      </AccordionTrigger>

      <AccordionContent>
        <p class="text-base text-muted-foreground">{{ faq.answer }}</p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
