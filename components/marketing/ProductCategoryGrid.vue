<script setup lang="ts">
import { computed } from "vue"
import MarketingCategoryCard from "@/components/marketing/MarketingCategoryCard.vue"

type ImageDto = { src: string; alt?: string; width?: number; height?: number } | null

type CategoryItem = {
  slug: string
  title: string
  image?: ImageDto
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
    title: "Ofrecemos una amplia gama de productos",
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
  return c.href || c.path || `/categorias/${c.slug}`
}
</script>

<template>
  <section class="bg-white">
    <div class="mx-auto max-w-[1200px] px-4 md:px-0 py-16">
      <h2
  class="relative block w-full text-[#212121] font-semibold
         text-[30px] leading-[36px]
         after:content-[''] after:block after:mt-[8px]
         after:h-[2px] after:w-full after:bg-[#212121]"
>
  {{ title }}
</h2>


      <div class="mt-12">
        <div class="grid grid-cols-2 gap-x-6 gap-y-8 md:flex md:flex-wrap md:justify-between md:gap-y-10">
          <template v-for="(c, idx) in filled" :key="c.slug + ':' + idx">
            <div class="w-full md:w-[252px]">
              <div v-if="c.__placeholder" class="pointer-events-none" aria-hidden="true">
                <div class="flex flex-col items-center gap-2 pb-2">
                  <div class="h-[231px] w-full rounded-[12px] bg-black/10 ring-1 ring-black/5" />
                  <div class="h-6 w-40 rounded bg-transparent" />
                </div>
              </div>

              <MarketingCategoryCard
                v-else
                :title="c.title"
                :href="categoryHref(c)"
                :image="c.image ?? null"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
