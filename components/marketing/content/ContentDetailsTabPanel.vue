<!-- components/marketing/content/ContentDetailsTabPanel.vue -->
<script setup lang="ts">
import { computed } from "vue"
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

function stripCmsOrigin(value: string) {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^[a-z]+:\/\/[^/]+\//i, "")
    .replace(/^\/+/, "")
    .replace(/[?#].*$/, "")
    .replace(/\/{2,}/g, "/")
}

function getParentPath(value: string) {
  const clean = stripCmsOrigin(value)
  const parts = clean.split("/").filter(Boolean)

  if (parts.length <= 1) return ""

  parts.pop()

  return parts.join("/")
}

const productRecord = computed(() => asRecord(props.featuredProduct))

const categoryRecord = computed(() =>
  asRecord(productRecord.value?.category),
)

const productImageRecord = computed(() =>
  asRecord(productRecord.value?.image),
)

const productSlug = computed(() =>
  readString(productRecord.value, ["slug", "productSlug"]),
)

const productTitle = computed(() =>
  readString(productRecord.value, ["title", "name"]),
)

const categorySlug = computed(() => {
  const direct = readString(productRecord.value, ["categorySlug"])

  if (direct) return direct

  return readString(categoryRecord.value, ["slug", "categorySlug"])
})

const productImageSrc = computed(() => {
  const direct = readString(productRecord.value, ["imageSrc"])

  if (direct) return direct

  return readString(productImageRecord.value, ["src"])
})

const fallbackDetailsImageSrc = computed(() => {
  if (!productSlug.value) return ""

  const imageParentPath = getParentPath(productImageSrc.value)

  if (imageParentPath) {
    return `${imageParentPath}/details/${productSlug.value}/01-detail.webp`
  }

  if (categorySlug.value) {
    return `media/product/${categorySlug.value}/details/${productSlug.value}/01-detail.webp`
  }

  return ""
})

const leadImage = computed(() => {
  const image = props.detailsMedia?.image

  const explicitSrc = normalizeCmsMediaSrc(image?.src || "")
  const fallbackSrc = normalizeCmsMediaSrc(fallbackDetailsImageSrc.value)
  const src = explicitSrc || fallbackSrc

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
  hasLeadImage.value
    ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-start lg:gap-8"
    : "max-w-[860px]",
)
</script>

<template>
  <div :class="cn('space-y-8 md:space-y-10', props.class)">
    <section
      :aria-label="section.title || 'Detalle'"
      class="w-full overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm md:p-7"
    >
      <div :class="layoutClass">
        <div class="min-w-0 space-y-6 md:space-y-7">
          <ContentDetailsSection
  :section="section"
  eyebrow="Información"
  :show-header="showDetailsHeader"
  content-class="space-y-5 pt-1 md:space-y-6"
/>

          <aside
            v-if="pills.length"
            class="rounded-2xl border border-border/60 bg-background/45 p-4 sm:p-5"
            aria-label="Productos o soluciones relacionadas"
          >
            <div class="mb-3 flex items-center gap-3">
              <span
                class="h-px w-8 shrink-0 bg-foreground/25"
                aria-hidden="true"
              />

              <p class="mb-0 text-sm font-semibold tracking-wide text-foreground">
                Productos o soluciones relacionadas
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
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

        <figure
          v-if="leadImage"
          class="overflow-hidden rounded-2xl bg-muted/30 p-2"
        >
          <CmsImage
            :src="leadImage.src"
            :alt="leadImage.alt"
            width="840"
            height="630"
            class="aspect-[4/3] w-full rounded-xl object-cover"
          />

          <figcaption
            v-if="leadImage.caption"
            class="px-2 pt-3 text-body-s leading-6 text-muted-foreground"
          >
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