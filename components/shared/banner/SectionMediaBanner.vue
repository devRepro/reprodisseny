<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/shared/button/AppButton.vue";

type LinkTarget = string | Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    primaryLabel: string;
    primaryTo: LinkTarget;
    secondaryLabel?: string;
    secondaryTo?: LinkTarget | null;

    /** Carpeta en /public */
    basePath: string;

    /** Nombre base del archivo, sin _1440w.webp */
    imageName: string;
    imageAlt?: string;

    height?: number;
    objectPosition?: string;
    fullBleed?: boolean;
    rounded?: boolean;
  }>(),
  {
    eyebrow: "",
    description: "",
    secondaryLabel: "",
    secondaryTo: null,
    imageAlt: "",
    height: 320,
    objectPosition: "right center",
    fullBleed: true,
    rounded: false,
  }
);

const hasSecondaryAction = computed(() =>
  Boolean(props.secondaryLabel?.trim() && props.secondaryTo)
);

const base = computed(() => {
  const value = String(props.basePath || "").trim();
  return value.startsWith("/")
    ? value.replace(/\/$/, "")
    : `/${value.replace(/\/$/, "")}`;
});

const widths = [1440, 1920, 2560, 2880, 3840, 4096] as const;

const webpSrcset = computed(() =>
  widths.map((w) => `${base.value}/${props.imageName}_${w}w.webp ${w}w`).join(", ")
);

const jpgSrcset = computed(() =>
  widths.map((w) => `${base.value}/${props.imageName}_${w}w.jpg ${w}w`).join(", ")
);

const fallbackJpg = computed(() => `${base.value}/${props.imageName}_1920w.jpg`);

const resolvedAlt = computed(() => props.imageAlt?.trim() || props.title);

const pictureSizes = computed(() =>
  props.fullBleed ? "100vw" : "(min-width: 1536px) 1440px, 100vw"
);

const cssVars = computed(
  () =>
    ({
      "--section-media-banner-h": `${props.height}px`,
      "--section-media-banner-pos": props.objectPosition,
    } as Record<string, string>)
);

const outerClass = computed(() =>
  props.fullBleed
    ? "relative left-1/2 right-1/2 -mx-[50vw] w-[100vw] overflow-x-clip"
    : "container-wide"
);

const innerContainerClass = computed(() =>
  props.fullBleed ? "container-wide" : "w-full"
);

const frameClass = computed(() =>
  ["relative overflow-hidden bg-muted", props.rounded ? "rounded-[28px]" : ""]
    .filter(Boolean)
    .join(" ")
);
</script>

<template>
  <section class="catalog-section">
    <div :class="outerClass">
      <div :class="frameClass" :style="cssVars">
        <div class="relative min-h-[var(--section-media-banner-h)]">
          <picture>
            <source type="image/webp" :srcset="webpSrcset" :sizes="pictureSizes" />
            <source type="image/jpeg" :srcset="jpgSrcset" :sizes="pictureSizes" />
            <img
              :src="fallbackJpg"
              :alt="resolvedAlt"
              class="absolute inset-0 h-full w-full object-cover"
              :style="{ objectPosition: 'var(--section-media-banner-pos)' }"
              loading="lazy"
              decoding="async"
            />
          </picture>

          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/95 via-background/86 to-background/20 md:from-background md:via-background/82 md:to-transparent"
          />

          <div class="relative z-10 min-h-[var(--section-media-banner-h)]">
            <div :class="innerContainerClass" class="h-full">
              <div
                class="flex min-h-[var(--section-media-banner-h)] items-center px-6 py-8 md:px-8 md:py-10"
              >
                <div class="max-w-3xl">
                  <p v-if="props.eyebrow" class="section-eyebrow mb-0">
                    {{ props.eyebrow }}
                  </p>

                  <h2
                    class="mt-4 text-balance text-3xl font-bold leading-tight text-foreground md:text-4xl"
                  >
                    {{ props.title }}
                  </h2>

                  <p
                    v-if="props.description"
                    class="mt-4 mb-0 max-w-2xl text-body text-foreground/80"
                  >
                    {{ props.description }}
                  </p>

                  <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <AppButton :to="props.primaryTo" size="md">
                      {{ props.primaryLabel }}
                    </AppButton>

                    <AppButton
                      v-if="hasSecondaryAction"
                      :to="props.secondaryTo!"
                      variant="ghost"
                      size="md"
                      class="hover:bg-foreground/5"
                    >
                      {{ props.secondaryLabel }}
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
