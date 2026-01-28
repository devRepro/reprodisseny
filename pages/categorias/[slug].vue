<script setup lang="ts">
import HeroBanner from "@/components/marketing/HeroBanner.vue";
import CircleActionGrid from "@/components/marketing/CircleActionGrid.vue";
import FaqAccordion from "@/components/marketing/FaqAccordion.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";

const route = useRoute();
const slug = String(route.params.slug); // eventos, gran-formato, etc.

const { data: category } = await useAsyncData(`cat:${slug}`, () =>
  queryCollection("categorias").path(`/categorias/${slug}`).first()
);

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" });
}

const { data: products } = await useAsyncData(`catProducts:${slug}`, () =>
  queryCollection("productos")
    .where("hidden", "=", false)
    .where("inStock", "=", true)
    .where("categorySlug", "=", slug)
    .order("order", "ASC")
    .select("title", "image", "path")
    .all()
);

const actions = computed(() =>
  (products.value || []).map((p: any) => ({
    label: p.title,
    to: p.path,
    image: p.image?.src || "",
  }))
);

const faqs = computed(() =>
  (category.value?.faqs || [])
    .filter((f: any) => f?.question?.trim() && f?.answer?.trim())
    .map((f: any) => ({ q: f.question, a: f.answer }))
);
</script>

<template>
  <div>
    <HeroBanner
      :title="category.title"
      :subtitle="category.description || ''"
      :image-src="category.image?.src || ''"
      :cta="category.cta ? { label: category.cta.text, to: category.cta.link } : null"
    />

    <CircleActionGrid v-if="actions.length" title="Productos" :actions="actions" />

    <FaqAccordion
      v-if="faqs.length"
      :title="`Preguntas frecuentes sobre ${category.title}`"
      :faqs="faqs"
    />

    <GuideBanner bg-image-src="/img/banners/archivos.jpg" />
  </div>
</template>
