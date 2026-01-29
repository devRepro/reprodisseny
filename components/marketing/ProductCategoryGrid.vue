<script setup lang="ts">
import { computed } from "vue";
import MarketingCategoryCard from "@/components/marketing/MarketingCategoryCard.vue";

type CategoryItem = {
  slug: string;
  title: string;
  image?: string | null;
  path?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    categories?: CategoryItem[] | null;
    totalSlots?: number; // para clavar 8 como Figma
  }>(),
  {
    title: "Nuestros productos",
    categories: () => [],
    totalSlots: 8,
  }
);

const normalized = computed(() =>
  Array.isArray(props.categories) ? props.categories : []
);

// Rellena hasta totalSlots con placeholders (para que el layout siempre sea 4x2)
const filled = computed(() => {
  const base = normalized.value.slice(0, props.totalSlots);
  const missing = Math.max(0, props.totalSlots - base.length);
  const placeholders = Array.from({ length: missing }, (_, i) => ({
    slug: `__placeholder_${i}`,
    title: "",
    image: null,
    path: "",
    __placeholder: true,
  }));
  return [...base, ...placeholders] as Array<CategoryItem & { __placeholder?: boolean }>;
});
</script>

<template>
  <section class="bg-white">
    <div class="mx-auto max-w-6xl px-4 py-16">
      <h2 class="text-[22px] leading-[28px] font-semibold text-slate-900">
        {{ title }}
      </h2>

      <div class="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        <template v-for="c in filled" :key="c.slug">
          <!-- Placeholder card (gris + sin texto) -->
          <div v-if="(c as any).__placeholder" class="block">
            <div class="rounded-[14px] bg-[#F6E7C9] overflow-hidden">
              <div class="px-5 pt-5 pb-4">
                <div class="w-full aspect-[4/3] rounded-[12px] bg-[#8E8E8E]" />
              </div>
            </div>
            <div class="mt-2 h-4 w-24 rounded bg-transparent" />
          </div>

          <!-- Real card -->
          <MarketingCategoryCard
            v-else
            :title="c.title"
            :href="(c as any).href || c.path || `/categorias/${c.slug}`"
            :image="c.image"
          />
        </template>
      </div>
    </div>
  </section>
</template>
