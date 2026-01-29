<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { NuxtImg } from "#components";

const props = defineProps<{
  title: string;
  href: string;
  image?: string | null;
}>();

const fallback = "/img/placeholders/mockup.webp";
const hasImage = computed(() => !!props.image);
</script>

<template>
  <NuxtLink :to="href" class="group block">
    <Card
      class="rounded-[14px] border-0 shadow-none bg-[#F6E7C9] overflow-hidden transition-transform duration-200 group-hover:-translate-y-[2px]"
    >
      <CardContent class="p-0">
        <div class="px-5 pt-5 pb-4">
          <div class="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden">
            <NuxtImg
              v-if="hasImage"
              :src="image!"
              :alt="title"
              class="absolute inset-0 h-full w-full object-contain"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px"
              width="480"
              height="360"
              loading="lazy"
              decoding="async"
              format="webp"
              :placeholder="fallback"
              @error="($event.target as HTMLImageElement).src = fallback"
            />
            <div v-else class="absolute inset-0 bg-[#8E8E8E]" />
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="mt-2 text-[12px] leading-[16px] text-slate-700">
      {{ title }}
    </div>
  </NuxtLink>
</template>
