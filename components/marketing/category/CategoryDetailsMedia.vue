<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
import ContentKeywordPills from "@/components/marketing/content/ContentKeywordPills.vue";
import type { KeywordPillItem } from "@/utils/relatedKeywordPills";

type GalleryItem = {
  src: string;
  alt: string;
  caption?: string;
  role?: "primary" | "detail" | "usage";
};

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title?: string;
    intro?: string;
    description?: string;
    gallery?: GalleryItem[];
    productPills?: KeywordPillItem[];
    containerClass?: string;
  }>(),
  {
    eyebrow: "",
    title: "",
    intro: "",
    description: "",
    gallery: () => [],
    productPills: () => [],
    containerClass: "container-content",
  }
);

const normalizedGallery = computed(() =>
  (props.gallery || []).filter((item) => String(item?.src || "").trim()).slice(0, 1)
);

const normalizedPills = computed(() =>
  (props.productPills || [])
    .filter((item) => String(item?.label || "").trim() && String(item?.to || "").trim())
    .slice(0, 3)
);

const primaryImage = computed(() => normalizedGallery.value[0] || null);
const hasGallery = computed(() => !!primaryImage.value);
const hasPills = computed(() => normalizedPills.value.length > 0);
const hasHeading = computed(() => !!props.eyebrow || !!props.title);
</script>

<template>
  <section :class="cn('py-6 md:py-8', props.containerClass)">
    <div class="grid items-start gap-y-8 lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10">
      <div class="lg:col-span-5">
        <div class="max-w-[34rem]">
          <SectionHeading
            v-if="hasHeading"
            as="h2"
            size="compact"
            align="left"
            :title="title"
            :eyebrow="eyebrow"
            :line="true"
          />

          <div :class="hasHeading ? 'mt-4 space-y-4' : 'space-y-4'">
            <p
              v-if="intro"
              class="max-w-[34ch] text-base leading-relaxed text-foreground/90 md:text-lg"
            >
              {{ intro }}
            </p>

            <p
              v-if="description"
              class="max-w-[42ch] text-sm leading-relaxed text-muted-foreground"
            >
              {{ description }}
            </p>
          </div>

          <div v-if="hasPills" class="mt-4">
            <ContentKeywordPills
              :items="normalizedPills"
              aria-label="Productos relacionados"
            />
          </div>
        </div>
      </div>

      <div v-if="hasGallery" class="lg:col-span-7">
        <article>
          <figure class="group">
            <div
              class="overflow-hidden rounded-[26px] bg-muted/15 shadow-[0_18px_40px_-30px_hsl(var(--foreground)/0.2)]"
            >
              <div class="aspect-[16/9] overflow-hidden">
                <NuxtImg
                  :src="primaryImage!.src"
                  :alt="primaryImage!.alt || title || intro || 'Imagen principal'"
                  class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </div>

            <figcaption
              v-if="primaryImage?.caption"
              class="pt-2 text-body-s font-medium text-muted-foreground"
            >
              {{ primaryImage.caption }}
            </figcaption>
          </figure>
        </article>
      </div>
    </div>
  </section>
</template>
