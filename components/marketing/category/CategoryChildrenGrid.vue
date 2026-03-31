<script setup lang="ts">
import { computed } from "vue";
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";

type ChildItem = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  image?: {
    src?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

const props = withDefaults(
  defineProps<{
    children?: ChildItem[] | null;
    eyebrow?: string;
    title?: string;
    description?: string;
    containerClass?: string;
  }>(),
  {
    children: () => [],
    eyebrow: "Subcategorías",
    title: "Explora esta línea de soluciones",
    description:
      "Accede directamente a las subcategorías relacionadas con esta área.",
    containerClass: "container-content",
  }
);

const visibleChildren = computed(() =>
  (props.children ?? []).filter(
    (item) =>
      Boolean(item?.title || item?.name) &&
      Boolean(item?.path || item?.slug)
  )
);

const gridClass = computed(() => {
  const count = visibleChildren.value.length;

  if (count <= 1) return "mx-auto max-w-[420px] grid-cols-1";
  if (count === 2) return "mx-auto max-w-[920px] grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
});
</script>

<template>
  <section
    v-if="visibleChildren.length"
    id="subcategorias"
    class="bg-background"
    aria-label="Subcategorías"
  >
    <div :class="containerClass">
      <div class="space-y-8 md:space-y-10">
        <ContentSectionIntro
          v-if="title || description || eyebrow"
          :eyebrow="eyebrow"
          :title="title"
          :description="description"
          class="max-w-3xl"
        />

        <ul :class="['grid auto-rows-fr gap-6', gridClass]">
          <li
            v-for="child in visibleChildren"
            :key="child.path || child.slug || child.title || child.name"
            class="h-full list-none"
          >
            <CatalogCard
              :href="child.path || `/categorias/${child.slug}`"
              :title="child.title || child.name || ''"
              :description="child.shortDescription || child.description || ''"
              :image="child.image"
              cta-label="Ver subcategoría"
              fallback-label="Subcategoría"
              image-sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
            />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>