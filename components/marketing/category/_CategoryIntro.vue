<script setup lang="ts">
defineProps<{ category: any }>();

const trustPoints = [
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Revisión Gratuita",
    desc: "Validamos tus archivos antes de imprimir.",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Entrega Rápida",
    desc: "Producción en 24/48h y envío urgente.",
  },
  {
    icon: "M5 13l4 4L19 7",
    title: "Calidad Premium",
    desc: "Última tecnología offset y digital.",
  },
];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-10 md:py-20">
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 md:mb-20 border-b border-slate-100 pb-12"
    >
      <div
        v-for="(item, idx) in trustPoints"
        :key="idx"
        class="flex items-center md:flex-col md:text-center gap-4 md:gap-4 w-full md:w-1/3"
      >
        <div
          class="flex-shrink-0 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-sky-50 text-sky-700"
        >
          <svg
            class="h-5 w-5 md:h-7 md:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="item.icon"
            />
          </svg>
        </div>

        <div class="flex flex-col">
          <h3
            class="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-900 leading-none md:leading-normal"
          >
            {{ item.title }}
          </h3>
          <p class="mt-1 md:mt-2 text-sm text-slate-500 leading-snug">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto text-center">
      <h2
        class="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight"
      >
        {{ category?.introTitle || category?.title }}
      </h2>

      <p
        v-if="category?.description"
        class="mt-6 text-[16px] md:text-lg text-slate-600 leading-relaxed italic border-l-4 border-sky-100 pl-4 md:border-none md:pl-0"
      >
        {{ category.description }}
      </p>
    </div>
  </section>
</template>
