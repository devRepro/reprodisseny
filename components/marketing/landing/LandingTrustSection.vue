<!-- components/marketing/landing/LandingTrustSection.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { CheckCircle2 } from "lucide-vue-next";
import CmsImage from "@/components/shared/blocks/CmsImage.vue";

type TrustFeature = {
  title: string;
  description?: string;
};

const props = withDefaults(
  defineProps<{
    title: string;
    eyebrow?: string;
    description?: string;
    imageSrc?: string;
    imageAlt?: string;
    features?: TrustFeature[];
    reverse?: boolean;
  }>(),
  {
    eyebrow: "",
    description: "",
    imageSrc: "",
    imageAlt: "",
    features: () => [],
    reverse: false,
  }
);

const safeFeatures = computed(() =>
  props.features
    .map((item) => ({
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
    }))
    .filter((item) => item.title)
);
</script>

<template>
  <section class="bg-white py-16 md:py-20">
    <div class="container-content">
      <div
        class="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14"
        :class="{ 'lg:grid-cols-[1.08fr_0.92fr]': props.reverse }"
      >
        <div
          v-if="props.imageSrc"
          class="overflow-hidden rounded-3xl border border-border/70 bg-[hsl(var(--brand-bg-2))] shadow-[0_22px_70px_-45px_rgba(0,0,0,.5)]"
          :class="{ 'lg:order-2': props.reverse }"
        >
          <CmsImage
            :src="props.imageSrc"
            :alt="props.imageAlt || props.title"
            width="900"
            height="720"
            class="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div>
          <p
            v-if="props.eyebrow"
            class="text-xs font-bold uppercase tracking-[0.18em] text-primary"
          >
            {{ props.eyebrow }}
          </p>

          <h2 class="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-foreground">
            {{ props.title }}
          </h2>

          <p
            v-if="props.description"
            class="mt-4 max-w-2xl text-base leading-7 text-foreground/70 md:text-lg"
          >
            {{ props.description }}
          </p>

          <ul v-if="safeFeatures.length" class="mt-8 space-y-4" role="list">
            <li
              v-for="item in safeFeatures"
              :key="item.title"
              class="flex gap-4 rounded-2xl border border-border/70 bg-[hsl(var(--brand-bg-2))] p-4"
            >
              <span
                class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <CheckCircle2 class="h-5 w-5" />
              </span>

              <div>
                <h3 class="text-base font-bold leading-6 text-foreground">
                  {{ item.title }}
                </h3>

                <p
                  v-if="item.description"
                  class="mt-1 text-sm leading-6 text-foreground/70"
                >
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>