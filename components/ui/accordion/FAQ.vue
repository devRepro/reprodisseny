<template>
  <section aria-labelledby="faq-title" class="space-y-4">
    <h2 id="faq-title" class="text-2xl font-semibold">Preguntas Frecuentes</h2>
    <Accordion type="single" collapsible>
      <AccordionItem v-for="faq in items" :key="faq.question" :value="faq.question">
        <AccordionTrigger>{{ faq.question }}</AccordionTrigger>
        <AccordionContent v-html="faq.answer" />
      </AccordionItem>
    </Accordion>
  </section>
</template>

<script setup lang="ts">


interface FAQ { question: string; answer: string }

defineProps<{ items: FAQ[] }>()
</script>