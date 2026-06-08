<!-- components/marketing/landing/LandingServiceCards.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { CheckCircle2 } from "lucide-vue-next";
import CmsImage from "@/components/shared/blocks/CmsImage.vue";

type ServiceCard = {
  eyebrow?: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  bullets: string[];
};

const props = withDefaults(
  defineProps<{
    title: string;
    intro?: string;
    items?: ServiceCard[];
  }>(),
  {
    intro: "",
    items: () => [],
  }
);

const safeItems = computed(() =>
  props.items
    .map((item) => ({
      eyebrow: String(item.eyebrow || "").trim(),
      title: String(item.title || "").trim(),
      imageSrc: String(item.imageSrc || "").trim(),
      imageAlt: String(item.imageAlt || item.title || "").trim(),
      bullets: (item.bullets || [])
        .map((bullet) => String(bullet || "").trim())
        .filter(Boolean),
    }))
    .filter((item) => item.title && item.imageSrc && item.bullets.length)
);
</script>

<template>
  <section v-if="safeItems.length" class="bg-[hsl(var(--brand-bg-2))] py-16 md:py-20">
    <div class="container-content">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-foreground">
          {{ props.title }}
        </h2>

        <p v-if="props.intro" class="mt-4 text-base leading-7 text-foreground/70 md:text-lg">
          {{ props.intro }}
        </p>
      </div>

      <div class="mt-10 grid gap-6 md:mt-12 lg:grid-cols-2">
        <article
          v-for="item in safeItems"
          :key="item.title"
          class="overflow-hidden rounded-3xl border border-border/70 bg-white shadow-[0_18px_55px_-38px_rgba(0,0,0,.45)]"
        >
          <CmsImage
            :src="item.imageSrc"
            :alt="item.imageAlt"
            width="900"
            height="560"
            class="aspect-[16/10] w-full object-cover"
            loading="lazy"
          />

          <div class="p-6 md:p-8">
            <p
              v-if="item.eyebrow"
              class="text-xs font-bold uppercase tracking-[0.16em] text-primary"
            >
              {{ item.eyebrow }}
            </p>

            <h3 class="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {{ item.title }}
            </h3>

            <ul class="mt-6 space-y-3" role="list">
              <li
                v-for="bullet in item.bullets"
                :key="bullet"
                class="flex gap-3 text-[15px] leading-6 text-foreground/78"
              >
                <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>