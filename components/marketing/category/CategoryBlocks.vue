<!-- components/marketing/category/CategoryBlocks.vue -->
<script setup lang="ts">
import type { Block } from "@/utils/categoryRail"
import { isHtmlTextBlock } from "@/utils/categoryRail"

defineProps<{ blocks: Block[] }>()
</script>

<template>
  <div class="space-y-6 leading-relaxed text-muted-foreground md:text-[15px]">
    <template v-for="(b, bi) in blocks" :key="bi">
      <div v-if="isHtmlTextBlock(b)" class="prose prose-slate max-w-none dark:prose-invert" v-html="b.text" />

      <p v-else-if="b.type === 'text'" class="whitespace-pre-line">
        {{ (b as any).text }}
      </p>

      <ul v-else-if="b.type === 'bullets'" class="grid gap-3 sm:grid-cols-2">
        <li
          v-for="(it, j) in (b as any).items || []"
          :key="j"
          class="group rounded-2xl border border-border/60 bg-muted/30 p-4 transition hover:bg-muted/40"
        >
          <div class="flex items-start gap-3">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span class="text-sm font-semibold text-foreground/90">{{ it }}</span>
          </div>
        </li>
      </ul>

      <figure v-else-if="b.type === 'image'" class="overflow-hidden rounded-2xl border border-border/60">
        <div class="group relative">
          <NuxtImg
            :src="(b as any).src"
            :alt="(b as any).alt || ''"
            :width="(b as any).width"
            :height="(b as any).height"
            class="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
            loading="lazy"
            format="webp"
            quality="80"
          />
          <div class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
        </div>

        <figcaption
          v-if="(b as any).caption"
          class="border-t border-border/60 bg-background/40 px-4 py-3 text-center text-sm text-muted-foreground"
        >
          {{ (b as any).caption }}
        </figcaption>
      </figure>
    </template>

    <div v-if="!blocks?.length" class="rounded-2xl bg-muted/30 p-4 text-center italic">
      Información no disponible.
    </div>
  </div>
</template>