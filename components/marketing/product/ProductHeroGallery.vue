<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import CmsImage from "@/components/shared/blocks/CmsImage.vue";

type GalleryImage =
  | string
  | {
      src?: string | null;
      alt?: string | null;
      caption?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type GallerySlide = {
  src: string;
  alt: string;
  caption?: string;
};

const props = withDefaults(
  defineProps<{
    primaryImage?: GalleryImage;
    images?: GalleryImage[];
    alt?: string;
    fallback?: string;
  }>(),
  {
    images: () => [],
    alt: "Producto",
    fallback: "/img/placeholders/producto.webp",
  }
);

const activeIndex = ref(0);
const failedSources = ref<Set<string>>(new Set());

function getImageSrc(image: GalleryImage) {
  if (typeof image === "string") return image;
  return image?.src || "";
}

function getImageAlt(image: GalleryImage) {
  if (typeof image === "object" && image?.alt) {
    return image.alt;
  }

  return props.alt;
}

function getImageCaption(image: GalleryImage) {
  if (typeof image === "object" && image?.caption) {
    return image.caption;
  }

  return undefined;
}

const slides = computed<GallerySlide[]>(() => {
  const seen = new Set<string>();
  const sourceImages = [props.primaryImage, ...(props.images ?? [])];

  const normalized = sourceImages
    .map((image) => {
      const src = normalizeCmsMediaSrc(getImageSrc(image));

      if (!src || seen.has(src)) {
        return null;
      }

      seen.add(src);

      return {
        src,
        alt: getImageAlt(image),
        caption: getImageCaption(image),
      };
    })
    .filter(Boolean) as GallerySlide[];

  if (!normalized.length) {
    return [
      {
        src: props.fallback,
        alt: props.alt,
      },
    ];
  }

  return normalized;
});

watch(
  slides,
  (value) => {
    if (!value.length || activeIndex.value > value.length - 1) {
      activeIndex.value = 0;
    }
  },
  { immediate: true }
);

const activeSlide = computed(() => {
  return slides.value[activeIndex.value] || slides.value[0];
});

const displayedImageSrc = computed(() => {
  const src = activeSlide.value?.src;

  if (!src || failedSources.value.has(src)) {
    return props.fallback;
  }

  return src;
});

function selectSlide(index: number) {
  activeIndex.value = index;
}

function onImageError() {
  const src = activeSlide.value?.src;

  if (!src || src === props.fallback) {
    return;
  }

  failedSources.value = new Set([...failedSources.value, src]);
}
</script>

<template>
  <div>
    <figure
      class="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.16)]"
    >
      <CmsImage
        :src="displayedImageSrc"
        :alt="activeSlide?.alt || alt"
        class="aspect-[16/11] w-full object-cover"
        width="760"
        height="522"
        eager
        @error="onImageError"
      />

      <figcaption v-if="activeSlide?.caption" class="sr-only">
        {{ activeSlide.caption }}
      </figcaption>

      <meta itemprop="image" :content="displayedImageSrc" />
    </figure>

    <div
      v-if="slides.length > 1"
      class="mt-3 flex gap-2 overflow-x-auto pb-1"
      aria-label="Galería de producto"
    >
      <button
        v-for="(slide, index) in slides"
        :key="slide.src"
        type="button"
        class="h-16 w-20 shrink-0 overflow-hidden rounded-xl border bg-card transition md:h-18 md:w-24"
        :class="
          index === activeIndex
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border/70 opacity-75 hover:opacity-100'
        "
        :aria-label="`Ver imagen ${index + 1} de ${slides.length}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        :title="slide.caption || slide.alt"
        @click="selectSlide(index)"
      >
        <CmsImage
          :src="slide.src"
          :alt="slide.alt"
          class="h-full w-full object-cover"
          width="160"
          height="110"
        />
      </button>
    </div>
  </div>
</template>