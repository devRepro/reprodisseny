<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

type GridItem = {
  title: string;
  to: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaText?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    items: GridItem[];
    ctaText?: string;
    class?: string;
  }>(),
  {
    title: "Productos de esta categoría",
    subtitle: "",
    eyebrow: "Productos relacionados",
    items: () => [],
    ctaText: "Ver producto",
    class: "",
  }
);

const safeItems = computed(() =>
  (props.items || []).filter((item) => item?.title && item?.to)
);
</script>

<template>
  <section :class="cn('w-full', props.class)" aria-labelledby="category-grid-heading">
    <header class="max-w-3xl">
      <p v-if="eyebrow" class="text-label text-primary">
        {{ eyebrow }}
      </p>

      <h2
        id="category-grid-heading"
        class="mt-2 text-[clamp(1.6rem,2vw,2rem)] font-semibold leading-tight tracking-tight text-foreground"
      >
        {{ title }}
      </h2>

      <p v-if="subtitle" class="mt-2 max-w-[62ch] text-body text-muted-foreground">
        {{ subtitle }}
      </p>
    </header>

    <div class="mt-8 md:mt-10">
      <div
        v-if="safeItems.length"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="(it, i) in safeItems"
          :key="`${it.to}-${i}`"
          :to="it.to"
          :aria-label="`Ver detalles de ${it.title}`"
          class="group flex h-full flex-col rounded-[28px] border border-border/70 bg-card px-5 pb-6 pt-5 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
        >
          <div class="relative mx-auto w-full max-w-[220px]">
            <div
              aria-hidden="true"
              class="absolute -inset-2 rounded-full bg-[linear-gradient(180deg,hsl(var(--accent)/0.55)_0%,hsl(var(--background))_100%)] blur-lg opacity-60 transition-opacity duration-300 group-hover:opacity-80"
            />

            <div
              class="relative grid aspect-square w-full place-items-center rounded-full border border-border/70 bg-[linear-gradient(180deg,hsl(var(--accent)/0.35)_0%,hsl(var(--background))_100%)] p-3"
            >
              <div
                class="h-full w-full overflow-hidden rounded-full bg-muted/30 ring-1 ring-border/60"
              >
                <NuxtImg
                  v-if="it.imageSrc"
                  :src="it.imageSrc"
                  :alt="it.imageAlt || it.title"
                  width="220"
                  height="220"
                  class="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div
                  v-else
                  class="grid h-full w-full place-items-center bg-muted text-body-s text-muted-foreground"
                >
                  Imagen no disponible
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-1 flex-col items-center text-center">
            <div class="flex min-h-[64px] items-start justify-center">
              <h3
                aria-hidden="true"
                class="max-w-[18ch] text-[1.1rem] font-semibold leading-[1.35] tracking-tight text-foreground"
              >
                {{ it.title }}
              </h3>
            </div>

            <span
              aria-hidden="true"
              class="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-body-s-bold text-foreground transition group-hover:border-primary/25 group-hover:text-primary"
            >
              {{ it.ctaText || props.ctaText }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <div
        v-else
        class="rounded-[24px] border border-border/70 bg-card px-5 py-4 text-body-s text-muted-foreground"
      >
        No hay elementos disponibles.
      </div>
    </div>
  </section>
</template>
