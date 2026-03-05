<script setup lang="ts">
import { computed } from "vue";

type GridItem = {
  title: string;
  to: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaText?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    items: GridItem[];
    ctaText?: string;
  }>(),
  { items: () => [], ctaText: "Ver producto" }
);

const safeItems = computed(() => (props.items || []).filter((i) => i?.title && i?.to));
</script>

<template>
  <section>
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
            class="group focus:outline-none"
          >
            <!-- Card -->
            <div
              class="flex w-[260px] flex-col items-center text-center
                     min-h-[380px] md:min-h-[400px]"
            >
              <!-- Imagen -->
              <div
                class="w-[220px] h-[220px] rounded-full overflow-hidden bg-muted ring-1 ring-border
                       group-focus-visible:ring-2 group-focus-visible:ring-ring"
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

              <!-- Título (altura consistente) -->
              <p
                class="mt-4 text-[17px] leading-[1.35] text-foreground/90
                       max-w-[240px]
                       line-clamp-2 min-h-[46px]"
              >
                {{ it.title }}
              </p>

              <!-- Botón siempre abajo -->
              <span
                role="button"
                class="mt-auto inline-flex items-center rounded-md bg-primary px-4 py-2
                       text-xs font-medium text-primary-foreground transition-opacity
                       group-hover:opacity-90"
              >
                {{ it.ctaText || props.ctaText }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <p v-if="!safeItems.length" class="mt-6 text-sm text-slate-500">
          No hay elementos disponibles.
        </p>
      </div>
    </div>
  </section>
</template>