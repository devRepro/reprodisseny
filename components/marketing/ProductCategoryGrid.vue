<script setup lang="ts">
import { computed } from "vue"
import SectionHeading from "@/components/marketing/content/SectionHeading.vue"
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue"

type CategoryImage = {
  src?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

type CategoryItem = {
  id: string
  title: string
  slug: string
  href: string
  image: CategoryImage | null
  shortDescription?: string | null
  description?: string | null
}

type Props = {
  id?: string
  title?: string
  description?: string
  categories?: CategoryItem[] | null
  totalSlots?: number
  pending?: boolean
  sectionClass?: string
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: "home-product-category-grid",
  title: "Ofrecemos una amplia gama de productos",
  description: "",
  categories: () => [],
  totalSlots: 8,
  pending: false,
  sectionClass: "",
  containerClass: "home-section__inner",
})

const headingId = computed(() => `${props.id}-title`)

const safeTitle = computed(() => String(props.title || "").trim())
const safeDescription = computed(() => String(props.description || "").trim())

const safeTotalSlots = computed(() => {
  const value = Number(props.totalSlots)

  if (!Number.isFinite(value)) return 8

  return Math.max(0, Math.floor(value))
})

const sourceCategories = computed<CategoryItem[]>(() => {
  if (!Array.isArray(props.categories)) return []

  return props.categories
    .filter(Boolean)
    .map((item) => ({
      ...item,
      id: String(item.id || item.slug || item.href || "").trim(),
      title: String(item.title || "").trim(),
      slug: String(item.slug || "").trim(),
      href: String(item.href || "").trim(),
      shortDescription: item.shortDescription
        ? String(item.shortDescription).trim()
        : "",
      description: item.description ? String(item.description).trim() : "",
    }))
    .filter((item) => item.id && item.title && item.href)
})

const visibleItems = computed<CategoryItem[]>(() =>
  sourceCategories.value.slice(0, safeTotalSlots.value)
)

const skeletonCount = computed(() => {
  if (!props.pending) return 0

  return Math.max(0, safeTotalSlots.value - visibleItems.value.length)
})

const hasHeader = computed(() =>
  Boolean(safeTitle.value || safeDescription.value)
)
</script>

<template>
  <section
    :id="props.id"
    :class="['home-category-grid', props.sectionClass]"
    :aria-labelledby="safeTitle ? headingId : undefined"
  >
    <div :class="[props.containerClass, 'home-category-grid__container']">
      <header
        v-if="hasHeader"
        class="home-category-grid__header"
      >
        <SectionHeading
          v-if="safeTitle"
          :id="headingId"
          as="h2"
          :title="safeTitle"
          title-tone="ink"
          line-tone="ink"
          class="home-category-grid__heading"
        />

        <p
          v-if="safeDescription"
          class="home-category-grid__description"
        >
          {{ safeDescription }}
        </p>
      </header>

      <div class="home-category-grid__body">
        <ul class="home-category-grid__list">
          <li
            v-for="item in visibleItems"
            :key="item.id"
            class="home-category-grid__item"
          >
            <CatalogCard
              :href="item.href"
              :title="item.title"
              :description="item.shortDescription || item.description || ''"
              :image="item.image"
              cta-label="Ver categoría"
              fallback-label="Categoría"
            />
          </li>

          <li
            v-for="n in skeletonCount"
            :key="`home-category-skeleton-${n}`"
            class="home-category-grid__item"
            aria-hidden="true"
          >
            <article class="home-category-grid__skeleton-card">
              <div class="home-category-grid__skeleton-media">
                <div class="home-category-grid__skeleton-image" />
              </div>

              <div class="home-category-grid__skeleton-content">
                <div class="home-category-grid__skeleton-title" />
                <div class="home-category-grid__skeleton-text" />

                <div class="home-category-grid__skeleton-action">
                  <div class="home-category-grid__skeleton-button" />
                </div>
              </div>
            </article>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>