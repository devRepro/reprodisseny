<script setup lang="ts">
type GridItem = {
  title: string
  to?: string
  imageSrc: string
  imageAlt?: string
}

const props = defineProps<{
  title?: string
  items: GridItem[]
}>()

const row1 = computed(() => (props.items || []).slice(0, 4))
const row2 = computed(() => (props.items || []).slice(4, 7))
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-6 py-16">
    <div class="flex flex-col items-start gap-10">
      <!-- H2 -->
      <h2 class="text-[30px] leading-[36px] font-semibold text-foreground">
        {{ title || "¿Qué quieres hacer?" }}
      </h2>

      <!-- Contenedor filas (gap 64) -->
      <div class="flex flex-col items-start gap-16 w-full">
        <!-- Fila 1 (4 items) -->
        <div
          class="hidden lg:flex w-full items-start justify-between gap-[68px]"
        >
          <NuxtLink
            v-for="(it, i) in row1"
            :key="`r1-${i}`"
            :to="it.to || '#'"
            class="group flex flex-col items-center justify-center gap-4 w-[220px] focus:outline-none"
          >
            <div
              class="w-[220px] h-[220px] rounded-full overflow-hidden bg-muted ring-1 ring-border
                     group-focus-visible:ring-2 group-focus-visible:ring-ring"
            >
              <img
                :src="it.imageSrc"
                :alt="it.imageAlt || it.title"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <p class="text-[17px] leading-[1.4] text-center text-foreground/90 max-w-[220px]">
              {{ it.title }}
            </p>
          </NuxtLink>
        </div>

        <!-- Fila 2 (3 items) -->
        <div
          class="hidden lg:flex w-full items-start gap-[106px]"
        >
          <NuxtLink
            v-for="(it, i) in row2"
            :key="`r2-${i}`"
            :to="it.to || '#'"
            class="group flex flex-col items-center justify-center gap-4 w-[220px] focus:outline-none"
          >
            <div
              class="w-[220px] h-[220px] rounded-full overflow-hidden bg-muted ring-1 ring-border
                     group-focus-visible:ring-2 group-focus-visible:ring-ring"
            >
              <img
                :src="it.imageSrc"
                :alt="it.imageAlt || it.title"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <p class="text-[17px] leading-[1.4] text-center text-foreground/90 max-w-[220px]">
              {{ it.title }}
            </p>
          </NuxtLink>
        </div>

        <!-- Responsive (móvil/tablet): grid simple -->
        <div class="grid gap-8 sm:grid-cols-2 lg:hidden">
          <NuxtLink
            v-for="(it, i) in items"
            :key="`m-${i}`"
            :to="it.to || '#'"
            class="group flex flex-col items-center gap-4 focus:outline-none"
          >
            <div
              class="w-[220px] h-[220px] rounded-full overflow-hidden bg-muted ring-1 ring-border
                     group-focus-visible:ring-2 group-focus-visible:ring-ring"
            >
              <img
                :src="it.imageSrc"
                :alt="it.imageAlt || it.title"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <p class="text-[17px] leading-[1.4] text-center text-foreground/90 max-w-[220px]">
              {{ it.title }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
