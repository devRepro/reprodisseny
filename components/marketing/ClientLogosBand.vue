<script setup lang="ts">
import { computed } from "vue"

type Logo = {
  src: string
  alt: string
  href?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    logos: Logo[]
    maxItems?: number // por defecto 12 => 2 filas de 6
    logoBoxHeight?: "sm" | "md" | "lg"
  }>(),
  {
    title: "Clientes que confían en nosotros",
    maxItems: 12,
    logoBoxHeight: "md",
  }
)

const displayed = computed(() => props.logos.slice(0, props.maxItems))

const boxH = computed(() => {
  switch (props.logoBoxHeight) {
    case "sm":
      return "h-10 sm:h-12"
    case "lg":
      return "h-14 sm:h-16"
    default:
      return "h-12 sm:h-14"
  }
})
</script>

<template>
  <section class="bg-[#F7EFE6]">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <!-- Título + línea -->
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-x-0 top-1/2 h-px bg-[#1E1E1E]/40"></div>
        <h2 class="relative bg-[#F7EFE6] px-6 text-center text-2xl sm:text-3xl font-semibold text-[#1E1E1E]">
          {{ title }}
        </h2>
      </div>

      <!-- Logos: 2 filas x 6 en lg -->
      <ul
        class="mt-10 grid items-center justify-items-center
               grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
               gap-x-10 gap-y-10"
      >
        <li
          v-for="logo in displayed"
          :key="logo.src + logo.alt"
          class="w-full flex justify-center"
        >
          <component
            :is="logo.href ? 'a' : 'div'"
            :href="logo.href"
            class="w-full flex justify-center"
            :class="logo.href ? 'hover:opacity-80 transition-opacity' : ''"
            target="_blank"
            rel="noopener noreferrer"
          >
            <!-- Caja con altura fija => homogeneiza -->
            <div
              class="w-full max-w-[170px] flex items-center justify-center"
              :class="boxH"
            >
              <!-- Truco: limitamos tamaño y centramos -->
              <NuxtImg
                :src="logo.src"
                :alt="logo.alt"
                class="max-h-full w-auto max-w-full object-contain"
                sizes="(min-width: 1024px) 170px, (min-width: 640px) 160px, 140px"
              />
            </div>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>
