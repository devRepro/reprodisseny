<script setup lang="ts">
import { computed } from "vue"
import { Card, CardContent } from "@/components/ui/card"
import { NuxtImg } from "#components"

const props = defineProps<{
  title: string
  href: string
  image?: string | null
}>()

const fallback = "/img/placeholders/mockup.webp"
const imgSrc = computed(() => props.image || fallback)
</script>

<template>
  <NuxtLink :to="href" class="group block">
    <Card
      class="rounded-[14px] border-0 shadow-none bg-[#F6E7C9] overflow-hidden
             transition-transform duration-200 group-hover:-translate-y-[2px]"
    >
      <CardContent class="p-0">
        <div class="px-5 pt-5 pb-4">
          <div
            class="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden bg-[#8E8E8E]
                   ring-1 ring-black/5"
          >
            <!-- ✅ siempre renderiza imagen: si no hay, usa fallback -->
            <NuxtImg
              :src="imgSrc"
              :alt="title"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px"
              width="480"
              height="360"
              loading="lazy"
              decoding="async"
              format="webp"
            />

            <!-- ✅ overlay sutil (como diseño) -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5" />
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="mt-2 text-[12px] leading-[16px] text-slate-700">
      {{ title }}
    </div>
  </NuxtLink>
</template>
