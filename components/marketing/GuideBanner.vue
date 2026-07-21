<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/shared/button/AppButton.vue";
type GuideBannerCta = {
  label: string;
  to: string;
  external?: boolean;
  ariaLabel?: string;
};

type Props = {
  title?: string;
  description?: string;
  cta?: GuideBannerCta | null;

  imageBasePath?: string;
  imageName?: string;
  imageAlt?: string;
  imageSizes?: string;

  height?: number;
  mobileHeight?: number;
  desktopHeight?: number;

  fullBleed?: boolean;
  rounded?: boolean;

  containerClass?: string;
  contentClass?: string;
  objectPosition?: string;
  overlayClass?: string;
};

const props = withDefaults(defineProps<Props>(), {
  title: "¿Sabes cómo preparar tus archivos correctamente?",
  description: "",
  cta: () => ({
    label: "Ver la guía rápida",
    to: "/como-preparar-archivos",
    external: false,
  }),

  imageBasePath: "/img/ui/banners/como-preparar-archivos",
  imageName: "archivos_banner",
  imageAlt: "",
  imageSizes: "100vw",

  height: 240,
  mobileHeight: 220,
  desktopHeight: 280,

  fullBleed: true,
  rounded: false,

  containerClass: "container-wide",
  contentClass: "",
  objectPosition: "right center",
  overlayClass: "guide-banner__overlay",
});

const hasCta = computed(() => Boolean(props.cta?.label && props.cta?.to));

const normalizedBasePath = computed(() => {
  const value = String(props.imageBasePath || "").trim();

  if (!value) return "";

  const cleanValue = value.replace(/\/$/, "");

  return cleanValue.startsWith("/") ? cleanValue : `/${cleanValue}`;
});

const normalizedImageName = computed(() =>
  String(props.imageName || "archivos_banner").trim()
);

const bannerStyle = computed(
  () =>
    ({
      "--guide-banner-height": `${props.height}px`,
      "--guide-banner-height-mobile": `${props.mobileHeight}px`,
      "--guide-banner-height-desktop": `${props.desktopHeight}px`,
      "--guide-banner-object-position": props.objectPosition,
    } as Record<string, string>)
);

const imageWidths = [1440, 1920, 2560, 2880, 3840, 4096] as const;

const webpSrcset = computed(() =>
  imageWidths
    .map(
      (width) =>
        `${normalizedBasePath.value}/${normalizedImageName.value}_${width}w.webp ${width}w`
    )
    .join(", ")
);



const fallbackImage = computed(
  () => `${normalizedBasePath.value}/${normalizedImageName.value}_1920w.webp`
);

const isDecorativeImage = computed(() => !props.imageAlt);
</script>

<template>
  <section
    class="guide-banner"
    :class="{
      'guide-banner--full-bleed': props.fullBleed,
    }"
    :style="bannerStyle"
  >
    <div
      class="guide-banner__frame"
      :class="{
        'guide-banner__frame--rounded': props.rounded,
      }"
    >
      <div class="guide-banner__media">
        <picture class="guide-banner__picture">
          <source type="image/webp" :srcset="webpSrcset" :sizes="props.imageSizes" />
          <img
            class="guide-banner__image"
            :src="fallbackImage"
            :alt="props.imageAlt"
            :aria-hidden="isDecorativeImage ? 'true' : undefined"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div :class="props.overlayClass" />

        <div class="guide-banner__body">
          <div :class="[props.containerClass, 'guide-banner__container']">
            <div class="guide-banner__content" :class="props.contentClass">
              <h2 class="guide-banner__title">
                {{ props.title }}
              </h2>

              <p v-if="props.description" class="guide-banner__description">
                {{ props.description }}
              </p>

              <div v-if="hasCta" class="guide-banner__actions">
                <AppButton
                  :to="props.cta!.to"
                  :aria-label="props.cta?.ariaLabel || props.cta?.label"
                  variant="primary"
                  size="lg"
                >
                  {{ props.cta!.label }}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
