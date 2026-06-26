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
  },
);

const activeIndex = ref(0);
const failedSources = ref<Set<string>>(new Set());

function getImageSrc(image: GalleryImage) {
  if (typeof image === "string") return image;
  return image?.src || "";
}

function getImageAlt(image: GalleryImage) {
  if (image && typeof image === "object" && image.alt) {
    return image.alt;
  }

  return props.alt;
}

function getImageCaption(image: GalleryImage) {
  if (image && typeof image === "object" && image.caption) {
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

      if (!src || seen.has(src)) return null;

      seen.add(src);

      return {
        src,
        alt: getImageAlt(image),
        caption: getImageCaption(image),
      };
    })
    .filter((item): item is GallerySlide => Boolean(item));

  if (normalized.length) return normalized;

  const fallbackSrc = normalizeCmsMediaSrc(props.fallback);

  return fallbackSrc
    ? [
        {
          src: fallbackSrc,
          alt: props.alt,
        },
      ]
    : [];
});

const slideSignature = computed(() => slides.value.map((slide) => slide.src).join("|"));

watch(
  slideSignature,
  () => {
    activeIndex.value = 0;
    failedSources.value = new Set();
  },
  { immediate: true },
);

watch(
  slides,
  (value) => {
    if (!value.length || activeIndex.value > value.length - 1) {
      activeIndex.value = 0;
    }
  },
);

const activeSlide = computed(() => {
  return slides.value[activeIndex.value] || slides.value[0] || null;
});

const displayedImageSrc = computed(() => {
  const src = activeSlide.value?.src;

  if (!src) return "";

  if (failedSources.value.has(src)) {
    return normalizeCmsMediaSrc(props.fallback);
  }

  return src;
});

const hasGallery = computed(() => slides.value.length > 1);

function selectSlide(index: number) {
  activeIndex.value = index;
}

function onImageError() {
  const src = activeSlide.value?.src;

  if (!src || src === normalizeCmsMediaSrc(props.fallback)) return;

  failedSources.value = new Set([...failedSources.value, src]);
}
</script>

<template>
  <div class="product-hero-gallery">
    <figure v-if="displayedImageSrc" class="product-hero-gallery__frame">
      <div class="product-hero-media">
        <CmsImage
          :src="displayedImageSrc"
          alt=""
          aria-hidden="true"
          class="product-hero-media__backdrop"
          width="760"
          height="760"
          eager
        />

        <CmsImage
          :src="displayedImageSrc"
          :alt="activeSlide?.alt || alt"
          class="product-hero-media__image"
          width="760"
          height="760"
          eager
          @error="onImageError"
        />
      </div>

      <figcaption v-if="activeSlide?.caption" class="sr-only">
        {{ activeSlide.caption }}
      </figcaption>

      <meta itemprop="image" :content="displayedImageSrc" />
    </figure>

    <div v-if="hasGallery" class="product-hero-gallery__thumbs" aria-label="Galería de producto">
      <button
        v-for="(slide, index) in slides"
        :key="slide.src"
        type="button"
        class="product-hero-gallery__thumb"
        :class="{ 'product-hero-gallery__thumb--active': index === activeIndex }"
        :aria-label="`Ver imagen ${index + 1} de ${slides.length}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        :title="slide.caption || slide.alt"
        @click="selectSlide(index)"
      >
        <CmsImage
          :src="slide.src"
          :alt="slide.alt"
          class="product-hero-gallery__thumb-image"
          width="160"
          height="160"
        />
      </button>
    </div>
  </div>
</template>
