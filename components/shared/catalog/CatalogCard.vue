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

const media = computed(() => {
  const value = props.image

  if (typeof value === "string") {
    return {
      src: normalizeCmsMediaSrc(value),
      alt: safeTitle.value,
      width: null as number | null,
      height: null as number | null,
    }
  }

  return {
    src: normalizeCmsMediaSrc(value?.src ?? ""),
    alt: value?.alt || safeTitle.value,
    width: value?.width ?? null,
    height: value?.height ?? null,
  }
})

const hasMedia = computed(() => Boolean(media.value.src))

const linkAriaLabel = computed(() => {
  if (!safeTitle.value) return safeCtaLabel.value

  return `${safeCtaLabel.value}: ${safeTitle.value}`
})
</script>

<template>
  <article class="catalog-card">
    <NuxtLink
      :to="props.href"
      :aria-label="linkAriaLabel"
      class="catalog-card__main-link"
    >
      <div class="catalog-card__media">
        <div :class="['catalog-card__media-frame', props.imageAspectClass]">
          <CmsImage
            v-if="hasMedia"
            :src="media.src"
            :alt="media.alt"
            :width="media.width || undefined"
            :height="media.height || undefined"
            class="catalog-card__image"
          />

          <div
            v-else
            class="catalog-card__fallback"
          >
            {{ safeFallbackLabel }}
          </div>
        </div>
      </div>

      <div class="catalog-card__content">
        <p
          v-if="safeBadge"
          class="catalog-card__badge"
        >
          {{ safeBadge }}
        </p>

        <h3 class="catalog-card__title">
          {{ safeTitle }}
        </h3>

        <p
          v-if="safeDescription"
          class="catalog-card__description"
        >
          {{ safeDescription }}
        </p>
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