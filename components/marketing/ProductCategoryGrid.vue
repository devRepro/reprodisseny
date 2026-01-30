<script setup lang="ts">
import { computed } from "vue"
import MarketingCategoryCard from "@/components/marketing/MarketingCategoryCard.vue"

type CategoryItem = {
  slug: string
  title: string
  image?: string | null
  path?: string
  href?: string
}
type FilledItem = CategoryItem & { __placeholder?: boolean }

const props = withDefaults(
  defineProps<{
    title?: string
    categories?: CategoryItem[] | null
    totalSlots?: number
  }>(),
  {
    title: "Nuestros productos",
    categories: () => [],
    totalSlots: 8,
  }
)

const normalized = computed<CategoryItem[]>(() =>
  Array.isArray(props.categories) ? props.categories : []
)

const filled = computed<FilledItem[]>(() => {
  const base = normalized.value.slice(0, props.totalSlots)
  const missing = Math.max(0, props.totalSlots - base.length)

  const placeholders: FilledItem[] = Array.from({ length: missing }, (_, i) => ({
    slug: `__placeholder_${i}`,
    title: "",
    image: null,
    __placeholder: true,
  }))

  return [...base, ...placeholders]
})

function categoryHref(c: CategoryItem) {
  return c.href || c.path || `/categoria/${c.slug}`
}
</script>

<template>
  <section class="bg-white">
    <div class="mx-auto max-w-6xl px-4 py-16">
      <h2 class="text-[22px] leading-[28px] font-semibold text-slate-900">
        {{ title }}
      </h2>

      <div class="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        <template v-for="(c, idx) in filled" :key="c.slug + ':' + idx">
          <div v-if="c.__placeholder" class="block pointer-events-none" aria-hidden="true">
            <div class="rounded-[14px] bg-[#F6E7C9] overflow-hidden">
              <div class="px-5 pt-5 pb-4">
                <div class="w-full aspect-[4/3] rounded-[12px] bg-[#8E8E8E] ring-1 ring-black/5" />
              </div>
            </div>
            <div class="mt-2 h-4 w-24 rounded bg-transparent" />
          </div>

          <MarketingCategoryCard
            v-else
            :title="c.title"
            :href="categoryHref(c)"
            :image="c.image"
          />
        </template>
      </div>
    </div>
  </section>
</template>
