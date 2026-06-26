<!-- components/marketing/content/ContentDetailsTabPanel.vue -->
<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { cn } from "@/lib/utils"
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia"

import CmsImage from "@/components/shared/blocks/CmsImage.vue"
import AppChip from "@/components/shared/pills/AppChip.vue"
import CategoryShowcaseCta from "@/components/marketing/category/CategoryShowcaseCta.vue"
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue"

type DetailsSection = {
  id?: string
  key?: string
  title?: string
  intro?: string
  body?: string
  text?: string
  html?: string
}

type DetailsMediaItem = {
  image?: {
    src?: string
    alt?: string
    caption?: string
  } | null
  pills?: Array<{
    label?: string
    to?: string
    ariaLabel?: string
  }>
}

const props = withDefaults(
  defineProps<{
    section: DetailsSection
    detailsMedia?: DetailsMediaItem | null
    featuredProduct?: Record<string, unknown> | null
    headerMode?: "default" | "intro-only" | "none"
    class?: string
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
    headerMode: "default",
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

const hasImageLoadError = ref(false)

watch(
  () => props.detailsMedia?.image?.src,
  () => {
    hasImageLoadError.value = false
  },
)

const leadImage = computed(() => {
  if (hasImageLoadError.value) return null

  const image = props.detailsMedia?.image
  const src = normalizeCmsMediaSrc(image?.src || "")

  if (!src) return null

  return {
    src,
    alt: String(
      image?.alt ||
        productTitle.value ||
        props.section?.title ||
        "",
    ).trim(),
    caption: String(image?.caption || "").trim(),
  }
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

const hasLeadImage = computed(() => Boolean(leadImage.value))

const showDetailsHeader = computed(() => props.headerMode === "default")

const layoutClass = computed(() =>
  cn(
    "content-details-panel__layout",
    hasLeadImage.value
      ? "content-details-panel__layout--with-media"
      : "content-details-panel__layout--text-only",
  ),
)
</script>

<template>
  <div :class="cn('content-details-panel', props.class)">
    <section :aria-label="section.title || 'Detalle'" class="content-details-panel__card">
      <div :class="layoutClass">
        <div class="content-details-panel__body">
          <ContentDetailsSection
            :section="section"
            eyebrow="Información"
            :show-header="showDetailsHeader"
            content-class="content-details-panel__richtext"
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

        <figure v-if="leadImage" class="content-details-panel__media">
          <CmsImage
            :src="leadImage.src"
            :alt="leadImage.alt"
            width="840"
            height="630"
            class="content-details-panel__image"
            @error="hasImageLoadError = true"
          />

          <figcaption v-if="leadImage.caption" class="content-details-panel__caption">
            {{ leadImage.caption }}
          </figcaption>
        </figure>
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
