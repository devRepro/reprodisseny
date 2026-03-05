<script setup lang="ts">
import { computed } from "vue"
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

const props = withDefaults(
  defineProps<{
    items: Faq[]
    title?: string
    subtitle?: string
  }>(),
  {
    items: () => [],
    title: "",
    subtitle: "",
  }
)

const normalized = computed(() =>
  (props.items || [])
    .map((f) => ({
      q: String(f.q ?? f.question ?? "").trim(),
      a: String(f.a ?? f.answer ?? "").trim(),
    }))
    .filter((f) => f.q && f.a)
)
</script>

<template>
  <section v-if="normalized.length" class="w-full">
    <!-- Heading opcional (si prefieres el heading en la página, no pases title/subtitle) -->
    <header v-if="title || subtitle" class="mb-6">
      <h2 v-if="title" class="text-[22px] leading-[28px] font-semibold text-foreground">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-2 text-[15px] leading-[22px] text-slate-600 max-w-3xl">
        {{ subtitle }}
      </p>
    </header>

    <!-- Card container -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Accordion type="single" collapsible class="divide-y divide-slate-200">
        <AccordionItem v-for="(f, i) in normalized" :key="i" :value="String(i)" class="px-6 md:px-10">
          <AccordionTrigger class="text-left">
            {{ f.q }}
          </AccordionTrigger>
          <AccordionContent>
            <p class="whitespace-pre-line text-slate-700 leading-relaxed">
              {{ f.a }}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>