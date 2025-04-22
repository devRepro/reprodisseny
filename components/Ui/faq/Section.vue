<template>
  <section v-if="faqs?.length" class="py-16 px-4 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
    <div class="max-w-screen-xl mx-auto px-4 md:px-8">
      <h2 class="text-3xl md:text-4xl font-bold mb-8 text-center text-[hsl(var(--color-primary))]">
        Preguntas frecuentes
      </h2>
      <Accordion type="multiple" class="space-y-4">
        <AccordionItem v-for="(item, index) in faqs" :key="index" :value="`faq-${index}`">
          <AccordionTrigger class="text-lg font-medium text-left">
            {{ item.pregunta || item.question }}
          </AccordionTrigger>
          <AccordionContent class="text-base text-[hsl(var(--muted-foreground))]">
            {{ item.respuesta || item.answer }}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  faqs: Array<{ pregunta?: string; respuesta?: string; question?: string; answer?: string }>
}>()
</script>
