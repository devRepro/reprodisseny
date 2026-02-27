<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(
  defineProps<{
    title?: string
    description: string
    imageSrc?: string | null
    chips?: string[]
    class?: string
  }>(),
  {
    title: undefined,
    imageSrc: null,
    chips: () => [],
    class: "",
  }
)

const safeChips = computed(() => (props.chips || []).map((s) => String(s).trim()).filter(Boolean).slice(0, 3))
</script>

<template>
  <section :class="cn('mb-6', props.class)">
    <div
      class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <!-- glow sutil -->
      <div class="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />
      <div class="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl" />

      <div class="relative grid items-center gap-6 lg:grid-cols-[1fr,280px]">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Información clave
          </p>

          <h2 v-if="title" class="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            {{ title }}
          </h2>

          <p class="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {{ description }}
          </p>

          <div v-if="safeChips.length" class="mt-5 flex flex-wrap gap-2">
            <span
              v-for="(c, i) in safeChips"
              :key="i"
              class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {{ c }}
            </span>
          </div>
        </div>

        <!-- bloque visual opcional -->
        <div v-if="imageSrc" class="hidden lg:block">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <NuxtImg
              :src="imageSrc"
              alt=""
              class="h-[180px] w-full object-cover"
              loading="lazy"
              format="webp"
              quality="75"
            />
          </div>
          <p class="mt-2 text-center text-xs text-slate-500">
            Vista previa de la categoría
          </p>
        </div>
      </div>
    </div>
  </section>
</template>