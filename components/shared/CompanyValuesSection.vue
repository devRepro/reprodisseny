<script setup lang="ts">
import { computed, type Component } from "vue";

type ValueItem = {
  title: string;
  description: string;
  proof?: string;
  icon?: Component;
};

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title?: string;
    intro?: string;
    items: ValueItem[];
  }>(),
  {
    eyebrow: "Nuestra forma de trabajar",
    title: "Nuestros valores",
    items: () => [],
  }
);

const safeItems = computed(() =>
  (props.items || []).filter(
    (item) =>
      item?.title?.trim()?.length &&
      item?.description?.trim()?.length
  )
);
</script>

<template>
  <section class="bg-slate-50 py-16 sm:py-20 lg:py-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <header v-if="eyebrow || title || intro" class="max-w-3xl">
        <p
          v-if="eyebrow"
          class="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80"
        >
          {{ eyebrow }}
        </p>

        <h2
          v-if="title"
          class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
        >
          {{ title }}
        </h2>

        <p v-if="intro" class="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          {{ intro }}
        </p>
      </header>

      <ul
        v-if="safeItems.length"
        role="list"
        class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <li
          v-for="(item, index) in safeItems"
          :key="`${item.title}-${index}`"
          class="h-full"
        >
          <article
            class="group flex h-full min-h-[260px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
          >
            <div
              v-if="item.icon"
              class="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-primary transition-transform duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <component :is="item.icon" class="h-6 w-6" />
            </div>

            <h3 class="mt-5 text-xl font-semibold tracking-tight text-slate-900">
              {{ item.title }}
            </h3>

            <p class="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
              {{ item.description }}
            </p>

            <p
              v-if="item.proof"
              class="mt-4 border-l-2 border-primary/20 pl-3 text-sm font-medium leading-6 text-slate-700"
            >
              {{ item.proof }}
            </p>
          </article>
        </li>
      </ul>

      <p v-else class="mt-8 text-sm text-slate-500">No hay valores disponibles.</p>
    </div>
  </section>
</template>
