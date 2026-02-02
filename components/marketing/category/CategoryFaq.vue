<script setup lang="ts">
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

type Faq = {
  q?: string
  a?: string
  question?: string
  answer?: string
}

const props = defineProps<{ items: Faq[] }>()

const normalized = computed(() =>
  (props.items || [])
    .map((f) => ({
      q: (f.q ?? f.question ?? "").trim(),
      a: (f.a ?? f.answer ?? "").trim(),
    }))
    .filter((f) => f.q && f.a)
)
</script>

<template>
  <section v-if="normalized.length" class="mx-auto max-w-4xl px-6 py-24">
    <h2 class="mb-8 text-2xl font-semibold">Preguntes freqüents</h2>

    <Accordion type="single" collapsible>
      <AccordionItem v-for="(f, i) in normalized" :key="i" :value="String(i)">
        <AccordionTrigger>{{ f.q }}</AccordionTrigger>
        <AccordionContent>
          <p class="whitespace-pre-line">{{ f.a }}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </section>
</template>

    