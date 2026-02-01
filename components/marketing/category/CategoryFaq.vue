<script setup lang="ts">
  import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from "@/components/ui/accordion"
  
  defineProps<{ items: any[] }>()
  </script>
  
  <template>
    <section class="mx-auto max-w-4xl px-6 py-24">
      <h2 class="mb-8 text-2xl font-semibold">
        Preguntas frecuentes
      </h2>
  
      <Accordion type="single" collapsible>
        <AccordionItem
          v-for="(f, i) in items"
          :key="i"
          :value="String(i)"
        >
          <AccordionTrigger>{{ f.q }}</AccordionTrigger>
          <AccordionContent>{{ f.a }}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  </template>
  
    