<script setup lang="ts">
import { computed } from "vue";

type GridItem = {
  title: string;
  to: string;
  imageSrc?: string;
  imageAlt?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    items: GridItem[];
  }>(),
  { items: () => [] }
);

const safeItems = computed(() => (props.items || []).filter((i) => i?.title && i?.to));
</script>

<template>
  <section class="mx-auto max-w-[1440px] px-6">
    <div class="flex flex-col items-start gap-3">
      <h2 class="text-[30px] leading-[36px] font-semibold text-foreground">
        {{ title || "¿Qué quieres hacer?" }}
      </h2>

      <p v-if="subtitle" class="text-[15px] leading-[22px] text-slate-600">
        {{ subtitle }}
      </p>

      <div class="mt-10 w-full">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
          <NuxtLink
            v-for="(it, i) in safeItems"
            :key="`${it.to}-${i}`"
            :to="it.to"
            class="group flex flex-col items-center gap-4 focus:outline-none"
          >
            <div
              class="w-[220px] h-[220px] rounded-full overflow-hidden bg-muted ring-1 ring-border group-focus-visible:ring-2 group-focus-visible:ring-ring"
            >
              <img
                v-if="it.imageSrc"
                :src="it.imageSrc"
                :alt="it.imageAlt || it.title"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <p
              class="text-[17px] leading-[1.4] text-center text-foreground/90 max-w-[220px]"
            >
              {{ it.title }}
            </p>
          </NuxtLink>
        </div>

        <p v-if="!safeItems.length" class="mt-6 text-sm text-slate-500">
          No hay elementos disponibles.
        </p>
      </div>
    </div>
  </section>
</template>
