<script setup lang="ts">
import { ref } from "vue";

type TimelineItem = {
  year: number | string;
  title: string;
  text: string;
  icon?: any;
  imageSrc?: string;
  imageAlt?: string;
  mediaLabel?: string;
  side?: "left" | "right";
};

const props = defineProps<{
  items: TimelineItem[];
}>();

const expanded = ref<Record<number, boolean>>({});

const toggle = (index: number) => {
  expanded.value[index] = !expanded.value[index];
};

const shouldClamp = (text?: string) => String(text || "").trim().length > 220;

const resolvedSide = (item: TimelineItem, index: number) =>
  item.side || (index % 2 === 0 ? "left" : "right");

const mediaOrderClass = (item: TimelineItem, index: number) =>
  resolvedSide(item, index) === "right" ? "lg:order-2" : "lg:order-1";

const contentOrderClass = (item: TimelineItem, index: number) =>
  resolvedSide(item, index) === "right" ? "lg:order-1" : "lg:order-2";
</script>

<template>
  <section
    aria-label="Historia cronológica de la empresa"
    class="container-content py-12 md:py-16 lg:py-20"
  >
    <ol class="space-y-12 md:space-y-16 lg:space-y-20">
      <li
        v-for="(item, index) in props.items"
        :key="`${item.year}-${item.title}`"
        class="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12"
      >
        <div :class="mediaOrderClass(item, index)" class="w-full">
          <div class="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-black/5">
            <div class="relative aspect-[4/3] w-full overflow-hidden">
              <img
                v-if="item.imageSrc"
                :src="item.imageSrc"
                :alt="
                  item.imageAlt ||
                  `Imagen representativa del hito ${item.year}: ${item.title}`
                "
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />

              <div
                v-else
                class="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300"
              />

              <div
                v-if="item.icon || item.mediaLabel"
                class="pointer-events-none absolute inset-0 flex items-end justify-start p-5"
                aria-hidden="true"
              >
                <div class="flex items-center gap-3">
                  <component
                    :is="item.icon"
                    v-if="item.icon"
                    class="h-10 w-10 text-white drop-shadow-md"
                  />

                  <span
                    v-if="item.mediaLabel"
                    class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
                  >
                    {{ item.mediaLabel }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div :class="contentOrderClass(item, index)" class="min-w-0">
          <div
            class="inline-flex items-center rounded-full bg-brand-base-light px-3 py-1 text-sm font-semibold text-brand-base-dark"
          >
            {{ item.year }}
          </div>

          <h3
            class="mt-4 text-2xl font-semibold leading-tight text-foreground md:text-3xl"
          >
            {{ item.title }}
          </h3>

          <div class="relative mt-4">
            <p
              :id="`timeline-text-${index}`"
              class="whitespace-pre-line text-base leading-7 text-muted-foreground transition-[max-height] duration-300 ease-out"
              :class="
                shouldClamp(item.text)
                  ? expanded[index]
                    ? 'max-h-[1000px]'
                    : 'max-h-[6.5rem] overflow-hidden'
                  : ''
              "
            >
              {{ item.text }}
            </p>

            <div
              v-if="shouldClamp(item.text) && !expanded[index]"
              class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent"
              aria-hidden="true"
            />
          </div>

          <button
            v-if="shouldClamp(item.text)"
            type="button"
            class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-base-dark transition-colors hover:text-brand-base"
            :aria-expanded="expanded[index] ? 'true' : 'false'"
            :aria-controls="`timeline-text-${index}`"
            @click="toggle(index)"
          >
            {{ expanded[index] ? "Ocultar detalles" : "Leer más" }}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4 transition-transform duration-300"
              :class="expanded[index] ? 'rotate-180' : 'rotate-0'"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </li>
    </ol>
  </section>
</template>
