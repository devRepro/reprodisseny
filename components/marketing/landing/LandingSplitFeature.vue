<script setup lang="ts">
import type { Component } from "vue";
import CmsImage from "@/components/shared/blocks/CmsImage.vue";
import LandingFeatureList from "@/components/marketing/landing/LandingFeatureList.vue";

type Feature = {
  title: string;
  description: string;
  icon?: Component | string | null;
};

const props = withDefaults(
  defineProps<{
    imageSrc: string;
    imageAlt: string;
    eyebrow?: string;
    title: string;
    intro?: string;
    features?: Feature[];
  }>(),
  {
    eyebrow: "",
    intro: "",
    features: () => [],
  }
);
</script>

<template>
  <div class="py-16 px-6 lg:px-20">
    <div class="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2 lg:items-center">
      
      <!-- Contenedor de Imagen -->
      <div class="relative overflow-hidden rounded-2xl shadow-2xl">
        <CmsImage
          :src="props.imageSrc"
          :alt="props.imageAlt"
          width="720"
          height="720"
          class="aspect-square h-full w-full object-cover"
        />
      </div>

      <!-- Contenido de Texto -->
      <div class="flex flex-col">
        <p v-if="props.eyebrow" class="text-xs font-bold uppercase tracking-widest text-black/40">
          {{ props.eyebrow }}
        </p>
        
        <h2 class="mt-2 text-[clamp(2rem,3vw,3rem)] font-bold tracking-tight text-black/90">
          {{ props.title }}
        </h2>

        <p v-if="props.intro" class="mt-4 text-lg font-medium text-black/90">
          {{ props.intro }}
        </p>

        <!-- Lista de Features Refactorizada -->
        <div class="mt-10 space-y-8">
          <div v-for="(feature, index) in props.features" :key="index" class="group">
            <h3 class="text-base font-bold text-black/90">
              {{ feature.title }}
            </h3>
            <p class="mt-1 text-[15px] leading-relaxed text-black/90">
              {{ feature.description }}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>