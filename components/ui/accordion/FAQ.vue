<template>
  <section>
    <h2 class="text-2xl font-semibold mb-4">Preguntas Frecuentes</h2>
    <Accordion type="single" collapsible>
      <AccordionItem v-for="faq in faqs" :key="faq.question" :value="faq.question">
        <AccordionTrigger>{{ faq.question }}</AccordionTrigger>
        <AccordionContent>
          <div v-html="faq.answer" class="prose text-sm text-gray-700"></div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </section>
</template>

<script setup lang="ts">
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { defineProps } from 'vue'

const props = defineProps<{ faqs: Array<{ question: string; answer: string }> }>()
</script>