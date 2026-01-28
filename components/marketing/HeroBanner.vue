<!-- ~/components/Home/HeroBanner.vue -->
<template>
  <section class="relative">
    <div
      class="relative overflow-hidden rounded-3xl border bg-white/80 backdrop-blur shadow-sm"
      :class="panelClass"
    >
      <!-- Background layer -->
      <div class="pointer-events-none absolute inset-0">
        <!-- Variants -->
        <div v-if="variant === 'wood'" class="absolute inset-0 wood-slats" :style="woodStyle" />
        <div v-else-if="variant === 'gradient'" class="absolute inset-0 gradient-bg" />
        <div v-else class="absolute inset-0 bg-slate-50" />

        <!-- Soft highlight -->
        <div class="absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-transparent" />
        <!-- Subtle vignette -->
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/[0.03] via-transparent to-slate-900/[0.03]" />
      </div>

      <!-- Content -->
      <div class="relative z-10 p-6 md:p-10">
        <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div class="max-w-2xl">
            <p v-if="kicker" class="text-sm font-medium text-slate-600">
              {{ kicker }}
            </p>

            <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {{ title }}
            </h1>

            <p v-if="subtitle" class="mt-3 text-base text-slate-700 md:text-lg">
              {{ subtitle }}
            </p>

            <div v-if="$slots.meta" class="mt-5">
              <slot name="meta" />
            </div>
          </div>

          <div v-if="$slots.actions" class="flex flex-wrap gap-3">
            <slot name="actions" />
          </div>
        </div>

        <div v-if="$slots.default" class="mt-6">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type HeroVariant = "wood" | "gradient" | "plain"

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    kicker?: string

    /**
     * wood: listones (sin imagen)
     * gradient: fondo suave
     * plain: neutro
     */
    variant?: HeroVariant

    /**
     * Tailwind classes extra para el panel.
     * Ej: "shadow-md md:rounded-[32px]"
     */
    panelClass?: string

    /**
     * Ajustes finos del fondo wood (para pixel-perfect con Figma)
     */
    slatWidth?: number // px
    slatGap?: number // px
    woodContrast?: number // 0..1 (sube/baja opacidad)
  }>(),
  {
    variant: "wood",
    panelClass: "",
    slatWidth: 18,
    slatGap: 4,
    woodContrast: 0.22,
  }
)

const woodStyle = computed(() => {
  // Usamos CSS vars para poder a
