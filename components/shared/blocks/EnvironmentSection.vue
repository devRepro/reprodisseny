<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    intro?: string;
    items?: string[];
    itemsLeft?: string[];
    itemsRight?: string[];
    backgroundSrc?: string;
    overlayOpacity?: number;
  }>(),
  {
    intro: "",
    items: () => [],
    itemsLeft: undefined,
    itemsRight: undefined,
    backgroundSrc: "/img/ui/bggreen_1920.webp",
    overlayOpacity: 0.55,
  }
);

const leftItems = computed(() => {
  if (props.itemsLeft?.length) return props.itemsLeft;
  const half = Math.ceil((props.items?.length || 0) / 2);
  return (props.items || []).slice(0, half);
});

const rightItems = computed(() => {
  if (props.itemsRight?.length) return props.itemsRight;
  const half = Math.ceil((props.items?.length || 0) / 2);
  return (props.items || []).slice(half);
});

const hasTwoColumns = computed(() => rightItems.value.length > 0);

const contentClass = computed(() =>
  hasTwoColumns.value
    ? "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
    : "mx-auto max-w-3xl"
);

const overlayStyle = computed(() => ({
  backgroundColor: `rgba(3, 65, 55, ${props.overlayOpacity})`,
}));
</script>

<template>
  <section class="relative isolate overflow-hidden bg-brand-base-dark">
    <img
      :src="props.backgroundSrc"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 -z-20 h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />

    <div class="absolute inset-0 -z-10" :style="overlayStyle" />
    <div class="absolute inset-0 -z-10 bg-black/10" />
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-r from-black/10 via-transparent to-black/10"
    />

    <div class="container-content py-12 md:py-16 lg:py-20">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-3xl font-semibold leading-tight text-white md:text-4xl">
          {{ props.title }}
        </h2>

        <p
          v-if="props.intro"
          class="mt-4 text-base leading-7 text-white/80 md:text-lg md:leading-8"
        >
          {{ props.intro }}
        </p>
      </div>

      <div class="mt-8 md:mt-10" :class="contentClass">
        <ul v-if="leftItems.length" class="space-y-4 md:space-y-5">
          <li
            v-for="(item, index) in leftItems"
            :key="`left-${index}`"
            class="rounded-2xl bg-white/8 px-5 py-4 ring-1 ring-white/10 backdrop-blur-[2px]"
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-white/90"
                aria-hidden="true"
              />
              <p
                class="text-base font-medium leading-7 text-white md:text-lg md:leading-8"
              >
                {{ item }}
              </p>
            </div>
          </li>
        </ul>

        <ul v-if="rightItems.length" class="space-y-4 md:space-y-5">
          <li
            v-for="(item, index) in rightItems"
            :key="`right-${index}`"
            class="rounded-2xl bg-white/8 px-5 py-4 ring-1 ring-white/10 backdrop-blur-[2px]"
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-white/90"
                aria-hidden="true"
              />
              <p
                class="text-base font-medium leading-7 text-white md:text-lg md:leading-8"
              >
                {{ item }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
