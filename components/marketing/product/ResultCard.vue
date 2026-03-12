<script setup lang="ts">
import { computed } from "vue";
import type { ProductListItem } from "@/types/product";

const props = defineProps<{
  product: ProductListItem;
}>();

const href = computed(
  () => props.product?.path || `/productos/${props.product?.slug || ""}`
);

const imageSrc = computed(() => props.product?.image || null);
const title = computed(() => props.product?.title || "");
const categoryLabel = computed(() => props.product?.categorySlug || "");
const description = computed(() => props.product?.description || "");
const alt = computed(() => props.product?.alt || title.value || "");
</script>

<template>
  <article v-if="props.product" class="catalog-card overflow-hidden rounded-2xl border bg-white">
    <NuxtLink :to="href" class="block">
      <div class="aspect-[4/3] w-full bg-muted">
        <NuxtImg
          v-if="imageSrc"
          :src="imageSrc"
          :alt="alt"
          width="640"
          height="480"
          class="h-full w-full object-cover"
        />
        <div v-else class="h-full w-full bg-muted" />
      </div>
    </NuxtLink>

    <div class="catalog-card-body p-5">
      <p v-if="categoryLabel" class="catalog-kicker text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {{ categoryLabel }}
      </p>

      <h3 class="catalog-title mt-2 text-lg font-semibold leading-tight">
        <NuxtLink :to="href" class="hover:underline">
          {{ title }}
        </NuxtLink>
      </h3>

      <p v-if="description" class="catalog-description mt-2 text-sm text-muted-foreground">
        {{ description }}
      </p>
    </div>
  </article>
</template>