<script setup lang="ts">
import { computed } from "vue"
import type { RouteLocationRaw } from "vue-router"
import CmsImage from "@/components/shared/blocks/CmsImage.vue"
import AppButton from "@/components/shared/button/AppButton.vue"
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia"

type CardMedia =
  | string
  | {
      src?: string | null
      alt?: string | null
      width?: number | null
      height?: number | null
    }
  | null
  | undefined

type Props = {
  href: RouteLocationRaw | string
  title: string
  description?: string | null
  image?: CardMedia
  ctaLabel?: string
  imageAspectClass?: string
  fallbackLabel?: string
  badge?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  description: "",
  image: null,
  ctaLabel: "Ver más",
  imageAspectClass: "aspect-[4/3]",
  fallbackLabel: "Sin imagen",
  badge: "",
})

const safeTitle = computed(() => String(props.title || "").trim())
const safeDescription = computed(() => String(props.description || "").trim())
const safeCtaLabel = computed(() => String(props.ctaLabel || "Ver más").trim())
const safeFallbackLabel = computed(() =>
  String(props.fallbackLabel || "Sin imagen").trim()
)
const safeBadge = computed(() => String(props.badge || "").trim())

const cleanTitle = computed(() => props.title.trim());

const cleanDescription = computed(() => {
  const value = props.description?.trim() ?? "";
  return value.length > 0 ? value : "";
});

const cleanBadge = computed(() => {
  const value = props.badge?.trim() ?? "";
  return value.length > 0 ? value : "";
});

const media = computed(() => {
  const value = props.image

  if (typeof value === "string") {
    return {
      src: normalizeCmsMediaSrc(value),
      alt: cleanTitle.value,
      width: null as number | null,
      height: null as number | null,
    }
  }

  return {
    src: normalizeCmsMediaSrc(value?.src ?? ""),
    alt: value?.alt?.trim() || cleanTitle.value,
    width: value?.width ?? null,
    height: value?.height ?? null,
  }
})

const hasMedia = computed(() => Boolean(media.value.src))

const linkAriaLabel = computed(() => {
  if (!safeTitle.value) return safeCtaLabel.value

const hasMedia = computed(() => Boolean(media.value.src));

const linkAriaLabel = computed(() => {
  const label = props.ctaLabel?.trim() || "Ver más";
  return `${label}: ${cleanTitle.value}`;
});
</script>

<template>
  <article class="h-full">
    <NuxtLink
      :to="props.href"
      :aria-label="linkAriaLabel"
      class="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:ring-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div class="p-4 pb-0 md:p-5 md:pb-0">
        <div
          class="overflow-hidden rounded-[1.35rem] border border-border/50 bg-muted/30"
        >
          <div :class="['relative w-full overflow-hidden', imageAspectClass]">
            <CmsImage
              v-if="hasMedia"
              :src="media.src"
              :alt="media.alt"
              :width="media.width || undefined"
              :height="media.height || undefined"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />

            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-muted/40 px-6 text-center text-sm font-medium text-muted-foreground"
            >
              {{ fallbackLabel }}
            </div>

            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-4 p-4 pt-5 md:p-5 md:pt-5">
        <div class="space-y-2.5">
          <p
            v-if="cleanBadge"
            class="text-xs font-bold uppercase tracking-[0.16em] text-primary"
          >
            {{ cleanBadge }}
          </p>

          <h3
            class="text-balance text-lg font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary md:text-xl"
          >
            {{ cleanTitle }}
          </h3>

          <p
            v-if="cleanDescription"
            class="line-clamp-3 text-sm leading-6 text-muted-foreground md:line-clamp-2 md:text-base"
          >
            {{ cleanDescription }}
          </p>
        </div>

        <div class="mt-auto pt-2">
          <span
            class="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md"
          >
            {{ ctaLabel }}
            <ArrowRight
              class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </NuxtLink>

    <div class="catalog-card__actions">
      <AppButton
        :to="props.href"
        variant="outline"
        size="sm"
        arrow
        :aria-label="linkAriaLabel"
      >
        {{ safeCtaLabel }}
      </AppButton>
    </div>
  </article>
</template>
