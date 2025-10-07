<!-- ===============================
components/shared/card/CategoryCard.vue
UX 2025-ready category card: responsive, accessible, fast.
- Works for categories (not products) but can be reused.
- Focus on LCP: <NuxtImg> with proper sizes, lazy, placeholder.
- Subtle micro-interactions respect prefers-reduced-motion.
- Optional: excerpt, product count, badges, quick-peek of top products.
- Dark mode OK. Keyboard-accessible. SSR-safe.
================================== -->
<template>
  <Card
    class="group h-full overflow-hidden rounded-2xl border bg-card/90 shadow-sm transition-shadow hover:shadow-lg focus-within:shadow-lg"
    :aria-label="title"
  >
    <!-- Media -->
    <CardHeader class="p-0">
      <NuxtLink
        :to="href"
        class="relative block aspect-[4/3] md:aspect-square overflow-hidden"
        :aria-label="`Abrir categoría ${title}`"
        :prefetch="prefetch"
      >
        <NuxtImg
          :src="image || fallback"
          :alt="title"
          class="h-full w-full object-cover transition-transform duration-300 will-change-transform"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          :width="width"
          :height="height"
          :placeholder="placeholder"
          :loading="loading"
          :decoding="decoding"
          :format="format"
          :quality="quality"
          :preload="priority"
          @error="onImgError"
        />

        <!-- Gradient overlay + title chip -->
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"
        ></div>
        <div class="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <span
            class="inline-flex max-w-[85%] items-center rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900/90 dark:text-white dark:ring-white/10"
          >
            <span class="truncate">{{ title }}</span>
          </span>
          <span
            v-if="count != null"
            class="ml-auto rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white dark:bg-white/20"
          >
            {{ count }} {{ count === 1 ? "producto" : "productos" }}
          </span>
        </div>
      </NuxtLink>
    </CardHeader>

    <!-- Body -->
    <CardContent class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-center gap-2">
        <span
          v-for="(b, i) in badges"
          :key="i"
          class="rounded-md border px-2 py-0.5 text-2xs font-medium text-foreground/80 dark:border-white/10"
        >
          {{ b }}
        </span>
      </div>

      <p v-if="excerpt" class="line-clamp-2 text-sm text-muted-foreground">
        {{ excerpt }}
      </p>

      <!-- Quick peek of top products (optional) -->
      <div v-if="topProducts?.length" class="mt-auto flex items-center gap-2">
        <div class="flex -space-x-2">
          <NuxtImg
            v-for="(p, idx) in topProducts.slice(0, 3)"
            :key="idx"
            :src="p.thumb"
            :alt="p.title"
            class="h-8 w-8 rounded-full border border-white object-cover dark:border-neutral-800"
            sizes="64px"
            :width="64"
            :height="64"
            :placeholder="'blur'"
            loading="lazy"
            decoding="async"
          />
        </div>
        <span class="text-2xs text-muted-foreground">Top en esta categoría</span>
      </div>
    </CardContent>

    <!-- Footer -->
    <CardFooter class="p-4 pt-0">
      <div class="flex w-full items-center justify-between">
        <NuxtLink
          :to="href"
          class="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          :prefetch="prefetch"
        >
          Ver categoría
          <svg
            class="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </NuxtLink>

        <!-- Optional secondary action -->
        <button
          v-if="ctaLabel && onCta"
          type="button"
          class="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          @click="onCta"
        >
          {{ ctaLabel }}
        </button>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { NuxtImg } from "#components";

const props = withDefaults(
  defineProps<{
    title: string;
    href: string;
    image?: string | null;
    excerpt?: string | null;
    count?: number | null;
    badges?: string[];
    topProducts?: { title: string; thumb: string; href?: string }[];
    // Media tuning
    width?: number;
    height?: number;
    placeholder?: "blur" | "empty" | "dominant";
    loading?: "lazy" | "eager";
    decoding?: "async" | "auto" | "sync";
    format?: "webp" | "avif" | "jpeg" | "png";
    quality?: number;
    priority?: boolean; // maps to NuxtImg preload
    prefetch?: boolean;
    ctaLabel?: string;
    onCta?: () => void;
  }>(),
  {
    image: "",
    excerpt: null,
    count: null,
    badges: () => [],
    width: 600,
    height: 450,
    placeholder: "blur",
    loading: "lazy",
    decoding: "async",
    format: "webp",
    quality: 70,
    priority: false,
    prefetch: true,
    ctaLabel: undefined,
    onCta: undefined,
  }
);

const fallback = "/images/placeholders/category-fallback.jpg";

function onImgError(e: Event) {
  const el = e.target as HTMLImageElement;
  if (el && el.getAttribute("src") !== fallback) {
    el.setAttribute("src", fallback);
  }
}
</script>

<style scoped>
/***** Micro-interactions honoring reduced motion *****/
@media (prefers-reduced-motion: reduce) {
  .group:hover img {
    transform: none !important;
  }
}
</style>
