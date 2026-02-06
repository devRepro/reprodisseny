<template>
  <section id="servicios" class="bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-16">
      <div class="max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ title }}</h2>
        <p v-if="subtitle" class="mt-3 text-slate-600">{{ subtitle }}</p>
      </div>

      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(s, i) in services"
          :key="i"
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Icon v-if="s.icon" :name="s.icon" class="h-5 w-5" />
              <span v-else class="text-sm font-bold">RD</span>
            </div>

            <div>
              <h3 class="text-base font-semibold text-slate-900">{{ s.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-slate-600">{{ s.description }}</p>
            </div>
          </div>

          <NuxtLink
            v-if="s.to"
            :to="s.to"
            class="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:underline"
          >
            Ver más →
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Service = {
  title: string
  description: string
  icon?: string
  to?: string
}

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    services?: Service[]
  }>(),
  {
    title: "Servicios principales",
    subtitle: "Soluciones de impresión y comunicación visual para tu negocio.",
    services: () => [
      { title: "Gran formato", description: "Lonas, cartelería, paneles, foam, dibond y más.", icon: "lucide:scan", to: "/categorias/gran-formato" },
      { title: "Vinilos y rotulación", description: "Vinilo de corte, impreso, escaparates, vehículos y señalética.", icon: "lucide:sticker", to: "/categorias/vinilos" },
      { title: "PLV y stands", description: "Displays, mostradores, roll-ups, photocalls y ferias.", icon: "lucide:layout-template", to: "/categorias/plv" },
      { title: "Impresión digital", description: "Flyers, tarjetas, dípticos, catálogos, papelería corporativa.", icon: "lucide:printer", to: "/categorias/impresion-digital" },
      { title: "Merchandising", description: "Regalos corporativos y productos personalizados.", icon: "lucide:gift", to: "/categorias/merchandising" },
      { title: "Montaje e instalación", description: "Servicio completo: producción + instalación in situ.", icon: "lucide:truck", to: "/contacto" },
    ],
  }
)
</script>
