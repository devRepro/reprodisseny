<script setup lang="ts">
import { computed } from "vue";

type GalleryItem = {
  src: string;
  alt: string;
  caption?: string;
  role?: "primary" | "detail" | "usage";
};

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    intro?: string;
    description?: string;
    gallery?: GalleryItem[];
    containerClass?: string;
  }>(),
  {
    eyebrow: "",
    intro: "",
    description: "",
    gallery: () => [],
    containerClass: "container-content",
  }
);

const normalizedGallery = computed(() =>
  (props.gallery || []).filter((item) => String(item?.src || "").trim()).slice(0, 3)
);

const primaryImage = computed(() => normalizedGallery.value[0] || null);
const secondaryImages = computed(() => normalizedGallery.value.slice(1, 3));

const hasGallery = computed(() => normalizedGallery.value.length > 0);
</script>

<template>
  <section :class="containerClass">
    <div
      class="overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_18px_50px_-36px_hsl(var(--foreground)/0.18)]"
    >
      <div class="grid gap-0 lg:grid-cols-12">
        <div
          class="flex flex-col justify-center px-6 py-7 sm:px-8 md:px-10 md:py-10 lg:col-span-5 lg:px-10 lg:py-12 xl:px-12"
        >
          <p
            v-if="eyebrow"
            class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80"
          >
            {{ eyebrow }}
          </p>

          <h2
            class="mt-3 text-[28px] font-semibold leading-[1.08] text-foreground md:text-[34px] xl:text-[38px]"
          >
            {{ title }}
          </h2>

          <div class="mt-5 h-px w-full max-w-[110px] bg-border" />

          <p
            v-if="intro"
            class="mt-6 text-[15px] leading-[1.75] text-foreground/78 md:text-body"
          >
            {{ intro }}
          </p>

          <p v-if="description" class="mt-4 text-body-s leading-[1.7] text-foreground/64">
            {{ description }}
          </p>
        </div>

        <div
          v-if="hasGallery"
          class="border-t border-border/70 bg-muted/20 p-4 sm:p-5 lg:col-span-7 lg:border-t-0 lg:border-l lg:p-6"
        >
          <div class="grid gap-4 md:grid-cols-12">
            <figure
              v-if="primaryImage"
              class="group overflow-hidden rounded-[24px] border border-border/70 bg-background md:col-span-12"
            >
              <div class="aspect-[16/9] overflow-hidden bg-muted/25">
                <img
                  :src="primaryImage.src"
                  :alt="primaryImage.alt || title"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <figcaption
                v-if="primaryImage.caption"
                class="px-4 py-3 text-body-s text-foreground/62"
              >
                {{ primaryImage.caption }}
              </figcaption>
            </figure>

            <figure
              v-for="image in secondaryImages"
              :key="image.src"
              class="group overflow-hidden rounded-[22px] border border-border/70 bg-background md:col-span-6"
            >
              <div class="aspect-[16/10] overflow-hidden bg-muted/25">
                <img
                  :src="image.src"
                  :alt="image.alt || title"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <figcaption
                v-if="image.caption"
                class="px-4 py-3 text-body-s text-foreground/62"
              >
                {{ image.caption }}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
