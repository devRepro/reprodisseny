<!-- components/marketing/content/ContentDetailsTabPanel.vue -->
<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { cn } from "@/lib/utils"
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia"
import type {
  DetailsMediaImage,
  DetailsMediaItem,
  SectionViewModel,
} from "~/types/contentSections"

import CmsImage from "@/components/shared/blocks/CmsImage.vue"
import AppChip from "@/components/shared/pills/AppChip.vue"
import CategoryShowcaseCta from "@/components/marketing/category/CategoryShowcaseCta.vue"
import ContentRichText from "@/components/marketing/content/ContentRichText.vue"

const props = withDefaults(
  defineProps<{
    section: SectionViewModel
    detailsMedia?: DetailsMediaItem | null
    featuredProduct?: Record<string, unknown> | null
    headerMode?: "default" | "intro-only" | "none"
    presentation?: "default" | "product"
    showIntro?: boolean
    class?: string
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
    headerMode: "default",
    presentation: "default",
    showIntro: true,
    class: "",
  },
)

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function cleanText(value: unknown) {
  return String(value ?? "").trim()
}

function readString(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) return ""

  for (const key of keys) {
    const value = cleanText(source[key])
    if (value) return value
  }

  return ""
}

const productRecord = computed(() => asRecord(props.featuredProduct))

const productTitle = computed(() =>
  readString(productRecord.value, ["title", "name"]),
)

const failedImageSrcs = ref<Set<string>>(new Set())

watch(
  () =>
    [
      props.detailsMedia?.image?.src,
      ...(props.detailsMedia?.images || []).map((image) => image?.src),
    ].join("|"),
  () => {
    failedImageSrcs.value = new Set()
  },
)

function normalizeDetailsImage(image: DetailsMediaImage | null | undefined) {
  const src = normalizeCmsMediaSrc(image?.src || "")

  if (!src || failedImageSrcs.value.has(src)) return null

  return {
    src,
    alt: String(
      image?.alt ||
        productTitle.value ||
        props.section?.title ||
        "",
    ).trim(),
    caption: String(image?.caption || "").trim(),
    width: image?.width || 840,
    height: image?.height || 630,
  }
}

const mediaImages = computed(() => {
  const images = props.detailsMedia?.images?.length
    ? props.detailsMedia.images
    : props.detailsMedia?.image
      ? [props.detailsMedia.image]
      : []

  const seen = new Set<string>()

  return images
    .map((image) => normalizeDetailsImage(image))
    .filter((image): image is NonNullable<ReturnType<typeof normalizeDetailsImage>> => {
      if (!image?.src || seen.has(image.src)) return false
      seen.add(image.src)
      return true
    })
})

const pills = computed(() =>
  (props.detailsMedia?.pills || [])
    .map((item) => {
      const label = String(item?.label || "").trim()
      const to = String(item?.to || "").trim()
      const ariaLabel = String(item?.ariaLabel || "").trim()

      return {
        label,
        to,
        ariaLabel: ariaLabel || `Ver ${label}`,
      }
    })
    .filter((item) => item.label && item.to),
)

const hasLeadImage = computed(() => mediaImages.value.length > 0)
const hasBodyContent = computed(() =>
  Boolean((props.showIntro && props.section.intro) || props.section.html || pills.value.length),
)

const layoutClass = computed(() =>
  cn(
    "content-details-panel__layout",
    hasLeadImage.value
      ? "content-details-panel__layout--with-media"
      : "content-details-panel__layout--text-only",
    hasLeadImage.value && !hasBodyContent.value && "content-details-panel__layout--media-only",
  ),
)

function onImageError(src: string) {
  failedImageSrcs.value = new Set([...failedImageSrcs.value, src])
}
</script>

<template>
  <div :class="cn('content-details-panel', props.presentation === 'product' && 'content-details-panel--product', props.class)">
    <section :aria-label="section.title || 'Detalle'" class="content-details-panel__card">
      <div :class="layoutClass">
        <div v-if="hasBodyContent" class="content-details-panel__body">
          <ContentRichText
            v-if="section.html || (showIntro && section.intro)"
            :html="section.html"
            :intro="showIntro ? section.intro : ''"
            class="content-details-panel__richtext"
          />

          <aside
            v-if="pills.length"
            class="content-details-panel__related"
            aria-label="Productos o soluciones relacionadas"
          >
            <div class="content-details-panel__related-header">
              <span class="content-details-panel__related-line" aria-hidden="true" />

              <p class="content-details-panel__related-title">
                Productos o soluciones relacionadas
              </p>
            </div>

            <div class="content-details-panel__related-list">
              <AppChip
                v-for="pill in pills"
                :key="`${pill.to}-${pill.label}`"
                variant="related"
                :to="pill.to"
                :aria-label="pill.ariaLabel"
              >
                {{ pill.label }}
              </AppChip>
            </div>
          </aside>
        </div>

        <div
          v-if="mediaImages.length"
          :class="cn('content-details-panel__media-list', mediaImages.length === 1 && 'content-details-panel__media-list--single')"
        >
          <figure
            v-for="image in mediaImages"
            :key="image.src"
            class="content-details-panel__media"
          >
            <CmsImage
              :src="image.src"
              :alt="image.alt"
              :width="image.width"
              :height="image.height"
              class="content-details-panel__image"
              @error="onImageError(image.src)"
            />

            <figcaption v-if="image.caption" class="content-details-panel__caption">
              {{ image.caption }}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <CategoryShowcaseCta
      v-if="featuredProduct"
      :product="featuredProduct"
      :highlights="[
        'Ideal para packaging, retail y promociones.',
        'Disponible en distintos materiales y acabados.',
        'Solicita presupuesto desde la ficha del producto.',
      ]"
    />
  </div>
</template>
