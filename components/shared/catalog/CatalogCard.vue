<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight } from "lucide-vue-next";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

type CardMedia =
  | string
  | {
      src?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

const props = withDefaults(
  defineProps<{
    href: string;
    title: string;
    description?: string | null;
    image?: CardMedia;
    ctaLabel?: string;
    imageAspectClass?: string;
    imageSizes?: string;
    fallbackLabel?: string;
    badge?: string | null;
  }>(),
  {
    description: "",
    image: null,
    ctaLabel: "Ver más",
    imageAspectClass: "aspect-[4/3]",
    imageSizes: "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw",
    fallbackLabel: "Sin imagen",
    badge: "",
  }
);

const media = computed(() => {
  const value = props.image;

  if (typeof value === "string") {
    return {
      src: normalizeCmsMediaSrc(value),
      alt: props.title,
      width: null as number | null,
      height: null as number | null,
    };
  }

  return {
    src: normalizeCmsMediaSrc(value?.src ?? ""),
    alt: value?.alt || props.title,
    width: value?.width ?? null,
    height: value?.height ?? null,
  };
});

const hasMedia = computed(() => Boolean(media.value.src));
const linkAriaLabel = computed(() => `${props.ctaLabel}: ${props.title}`);
</script>

<template>
  <article class="group h-full">
    <NuxtLink
      :to="href"
      :aria-label="linkAriaLabel"
      class="flex h-full flex-col rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:p-5"
    >
      <div class="overflow-hidden rounded-[1.25rem] border border-border/40 bg-muted/40">
        <div :class="['relative w-full overflow-hidden', imageAspectClass]">
          <NuxtImg
            v-if="hasMedia"
            :src="media.src!"
            :alt="media.alt"
            :width="media.width || undefined"
            :height="media.height || undefined"
            :sizes="imageSizes"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />

          <div
            v-else
            class="flex h-full w-full items-center justify-center px-6 text-center text-sm font-medium text-muted-foreground"
          >
            {{ fallbackLabel }}
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-4 px-1 pt-4">
        <div class="space-y-2">
          <p
            v-if="badge"
            class="text-xs font-semibold uppercase tracking-[0.12em] text-primary"
          >
            {{ badge }}
          </p>

          <h3 class="text-lg font-semibold leading-tight text-foreground md:text-xl">
            {{ title }}
          </h3>

          <p
            v-if="description"
            class="text-sm leading-6 text-muted-foreground md:text-base"
          >
            {{ description }}
          </p>
        </div>

        <div class="mt-auto pt-2">
          <span
            class="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-200 group-hover:border-primary/20 group-hover:text-primary"
          >
            {{ ctaLabel }}
            <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>