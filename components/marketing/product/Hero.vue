<!-- components/marketing/product/Hero.vue -->
<script setup lang="ts">
import { computed } from "vue";
import LeadForm from "@/components/marketing/product/LeadForm.vue";

const props = defineProps<{ product: any }>();

const FALLBACK = "/img/placeholders/producto.webp";

const imgSrc = computed(() => {
  const x = props.product?.image;
  const src = typeof x === "string" ? x : x?.src;
  return src || FALLBACK;
});

const imgAlt = computed(
  () => props.product?.image?.alt || props.product?.title || "Producto"
);

const extraFields = computed(
  () => props.product?.formFields || props.product?.extraFields || []
);
</script>

<template>
  <!-- Figma: producte 1200 dentro de px-[120px] -->
  <section class="w-[1200px]">
    <!-- Figma: 575 + 555.95, gap 69 -->
    <div class="grid grid-cols-[575px_555.95px] gap-[69px] items-start">
      <!-- IZQUIERDA -->
      <div class="w-[575px]">
        <!-- Figma Frame 125: w 571.14, gap 24 -->
        <div class="w-[571.14px] min-h-[104px] flex flex-col gap-6">
          <h1 class="text-[30px] leading-[36px] font-semibold text-[#1E1E1E]">
            {{ product?.title }}
          </h1>

          <p class="text-[16px] leading-[22.4px] text-[#1E1E1E]">
            {{ product?.shortDescription }}
          </p>
        </div>

        <!-- Figma: 24px entre texto e imagen -->
        <div class="mt-6">
          <NuxtImg
            :src="imgSrc"
            :alt="imgAlt"
            class="w-[575px] h-[575px] rounded-[12px] object-cover"
            sizes="575px"
            densities="x1 x2"
            fetchpriority="high"
          />
        </div>
      </div>

      <!-- DERECHA -->
      <!-- Figma: right block empieza 60px más abajo (top 295 vs 235) -->
      <div class="pt-[60px] w-[555.95px]">
        <LeadForm
          :producto="product.title"
          :product-data="product"
          :extra-fields="product.formFields || []"
          :category-slug="category?.slug || product.categorySlug"
        />
      </div>
    </div>
  </section>
</template>
