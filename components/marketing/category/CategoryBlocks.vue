<!-- components/marketing/category/CategoryBlocks.vue -->
<script setup lang="ts">
import { computed } from "vue"
import type { Block } from "@/utils/categoryRail"
import { isHtmlTextBlock } from "@/utils/categoryRail"

const props = defineProps<{ blocks: Block[] }>()

const safeBlocks = computed(() => props.blocks || [])

function hasItems(block: Block) {
  return block?.type === "bullets" && Array.isArray((block as any).items) && (block as any).items.length > 0
}
</script>

<template>
  <div class="space-y-8 text-foreground">
    <template v-for="(b, bi) in safeBlocks" :key="bi">
      <!-- HTML rico -->
      <div
        v-if="isHtmlTextBlock(b)"
        class="category-richtext max-w-[72ch]"
        v-html="b.text"
      />

      <!-- Texto normal -->
      <div
        v-else-if="b.type === 'text'"
        class="max-w-[72ch]"
      >
        <p class="mb-0 whitespace-pre-line text-body text-foreground/82 md:text-[18px] md:leading-[1.72]">
          {{ (b as any).text }}
        </p>
      </div>

      <!-- Lista editorial, no cards -->
      <div
        v-else-if="b.type === 'bullets' && hasItems(b)"
        class="max-w-[78ch]"
      >
        <ul class="space-y-4 md:space-y-5">
          <li
            v-for="(it, j) in (b as any).items || []"
            :key="j"
            class="flex items-start gap-3.5 border-b border-border/45 pb-4 last:border-b-0 last:pb-0"
          >
            <span
              class="mt-[0.72em] h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span class="text-body text-foreground/88 md:text-[17px] md:leading-[1.7]">
              {{ it }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Imagen -->
      <figure
        v-else-if="b.type === 'image'"
        class="overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-sm"
      >
        <div class="relative">
          <NuxtImg
            :src="(b as any).src"
            :alt="(b as any).alt || ''"
            :width="(b as any).width"
            :height="(b as any).height"
            class="h-auto w-full object-cover"
            loading="lazy"
            format="webp"
            quality="80"
          />
          <div class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
        </div>

        <figcaption
          v-if="(b as any).caption"
          class="border-t border-border/60 px-4 py-3 text-center text-body-s text-muted-foreground"
        >
          {{ (b as any).caption }}
        </figcaption>
      </figure>
    </template>

    <div
      v-if="!safeBlocks.length"
      class="rounded-2xl border border-border/60 bg-muted/25 px-5 py-4 text-body-s text-muted-foreground"
    >
      Información no disponible.
    </div>
  </div>
</template>

<style scoped>
.category-richtext :deep(h3),
.category-richtext :deep(h4) {
  margin-top: 0;
  margin-bottom: 1rem;
  color: hsl(var(--foreground));
  font-weight: 600;
}

.category-richtext :deep(p) {
  margin: 0 0 1rem 0;
  max-width: 72ch;
  color: hsl(var(--foreground) / 0.82);
  font-size: var(--font-body);
  line-height: 1.72;
}

@media (min-width: 768px) {
  .category-richtext :deep(p) {
    font-size: 18px;
  }
}

.category-richtext :deep(ul),
.category-richtext :deep(ol) {
  margin: 0;
  padding: 0;
  list-style: none;
  max-width: 78ch;
}

.category-richtext :deep(li) {
  position: relative;
  margin: 0;
  padding: 0 0 1rem 1.5rem;
  border-bottom: 1px solid hsl(var(--border) / 0.45);
  color: hsl(var(--foreground) / 0.88);
  line-height: 1.7;
}

.category-richtext :deep(li:last-child) {
  border-bottom: 0;
  padding-bottom: 0;
}

.category-richtext :deep(li)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  background: hsl(var(--primary));
}
</style>