<template>
  <section id="proyectos" class="bg-white">
    <div class="mx-auto max-w-6xl px-4 py-16">
      <div class="max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ title }}</h2>
        <p v-if="subtitle" class="mt-3 text-slate-600">{{ subtitle }}</p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-3">
        <figure
          v-for="(t, i) in testimonials"
          :key="i"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-6"
        >
          <blockquote class="text-sm leading-6 text-slate-700">“{{ t.quote }}”</blockquote>
          <figcaption class="mt-4 text-sm font-semibold text-slate-900">
            {{ t.name }}
            <span v-if="t.company" class="font-normal text-slate-600">· {{ t.company }}</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Testimonial = { quote: string; name: string; company?: string }

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    testimonials?: Testimonial[]
  }>(),
  {
    title: "Clientes y proyectos",
    subtitle: "Trabajamos para marcas, comercios y eventos en toda Cataluña.",
    testimonials: () => [
      { quote: "Rapidez y acabados impecables. Nos asesoraron en todo el proceso.", name: "Cliente", company: "Empresa" },
      { quote: "Muy buena calidad en gran formato y entrega puntual.", name: "Cliente", company: "Retail" },
      { quote: "La rotulación quedó perfecta. Repetiremos.", name: "Cliente", company: "Restauración" },
    ],
  }
)
</script>
