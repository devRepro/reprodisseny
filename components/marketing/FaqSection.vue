<template>
  <section class="bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-16">
      <div class="max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ title }}</h2>
        <p v-if="subtitle" class="mt-3 text-slate-600">{{ subtitle }}</p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <details
          v-for="(f, i) in items"
          :key="i"
          class="group rounded-2xl border border-slate-200 bg-white p-6"
        >
          <summary class="cursor-pointer list-none font-semibold text-slate-900">
            <span class="flex items-center justify-between gap-4">
              {{ f.q }}
              <span class="text-slate-500 group-open:rotate-180">⌄</span>
            </span>
          </summary>
          <p class="mt-3 text-sm leading-6 text-slate-600">{{ f.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Faq = { q: string; a: string }

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    items?: Faq[]
  }>(),
  {
    title: "Preguntas frecuentes",
    subtitle: "Respuestas rápidas para acelerar tu pedido.",
    items: () => [
      { q: "¿Qué archivos tengo que enviar?", a: "PDF en alta calidad (preferible) o AI/SVG. Si tienes dudas, te ayudamos a revisarlo." },
      { q: "¿Hacéis envío y montaje?", a: "Sí, podemos gestionar entrega y/o instalación según el proyecto." },
      { q: "¿Plazos de entrega?", a: "Depende del producto y acabados. Te confirmamos plazos al validar el arte final." },
      { q: "¿Podéis asesorar en materiales?", a: "Sí. Recomendamos material y acabado según uso (interior/exterior, duración, etc.)." },
    ],
  }
)
</script>
