<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";

type CTA = {
  label: string;
  to: string;
  external?: boolean;
};

type Props = {
  title?: string;
  description?: string;
  cta?: CTA | null;
  imageBasePath?: string;
  imageName?: string;
  height?: number;
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
  height: 240,
  rounded: false,
  fullBleed: true,
  containerClass: "mx-auto w-full max-w-[1440px] px-6 lg:px-10 2xl:px-[120px]",
  contentClass: "",
  objectPosition: "right center",
  overlayClass:
    "pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent",
});

const ctaLabel = computed(() => props.cta?.label ?? "Ver la guía rápida");
const ctaTo = computed(() => props.cta?.to ?? "/como-preparar-archivos");
const isExternal = computed(() => Boolean(props.cta?.external));

const base = computed(() => {
  const s = String(props.imageBasePath || "").trim();
  if (!s) return "";
  return s.startsWith("/") ? s.replace(/\/$/, "") : `/${s.replace(/\/$/, "")}`;
});

const fileBaseName = computed(() => String(props.imageName || "archivos_banner").trim());

const cssVars = computed(
  () =>
    ({
      "--gb-h": `${props.height}px`,
      "--gb-pos": props.objectPosition,
    } as Record<string, string>)
);

const widths = [1440, 1920, 2560, 2880, 3840, 4096] as const;

const webpSrcset = computed(() =>
  widths
    .map((w) => `${base.value}/${fileBaseName.value}_${w}w.webp ${w}w`)
    .join(", ")
);

const jpgSrcset = computed(() =>
  widths
    .map((w) => `${base.value}/${fileBaseName.value}_${w}w.jpg ${w}w`)
    .join(", ")
);

const fallbackJpg = computed(
  () => `${base.value}/${fileBaseName.value}_1920w.jpg`
);
</script>

<template>
  <section
    :class="
      props.fullBleed
        ? 'relative left-1/2 right-1/2 -mx-[50vw] w-[100vw] overflow-x-clip'
        : ''
    "
  >
    <div
      class="relative overflow-hidden bg-background"
      :class="props.rounded ? 'rounded-xl' : ''"
      :style="cssVars"
    >
      <div class="relative h-[var(--gb-h)] w-full">
        <picture>
          <source type="image/webp" :srcset="webpSrcset" sizes="100vw" />
          <source type="image/jpeg" :srcset="jpgSrcset" sizes="100vw" />
          <img
            :src="fallbackJpg"
            alt=""
            class="absolute inset-0 h-full w-full object-cover"
            :style="{ objectPosition: 'var(--gb-pos)' }"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div :class="props.overlayClass" />

        <div class="relative h-full">
          <div :class="props.containerClass" class="h-full">
            <div
              class="flex h-full flex-col items-start justify-center gap-5"
              :class="props.contentClass"
            >
              <h2
                class="text-2xl font-semibold leading-tight text-foreground md:text-3xl"
              >
                {{ title }}
              </h2>

              <p
                v-if="description"
                class="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base"
              >
                {{ description }}
              </p>

              <Button as-child class="h-11 rounded-full px-6">
                <NuxtLink
                  :to="ctaTo"
                  :target="isExternal ? '_blank' : undefined"
                  :rel="isExternal ? 'noopener noreferrer' : undefined"
                >
                  {{ ctaLabel }}
                </NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>