<template>
  <section id="categorias" class="bg-white">
    <div class="mx-auto max-w-6xl px-4 py-16">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ title }}</h2>
          <p v-if="subtitle" class="mt-3 text-slate-600">{{ subtitle }}</p>
        </div>

        <NuxtLink
          v-if="allLink"
          :to="allLink.to"
          class="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:underline sm:mt-0"
        >
          {{ allLink.label }} →
        </NuxtLink>
      </div>

      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="c in categories"
          :key="c.slug"
          :to="`/categorias/${c.slug}`"
          class="group rounded-2xl border border-slate-200 p-6 hover:bg-slate-50"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Icon v-if="c.icon" :name="c.icon" class="h-5 w-5" />
              <span v-else class="text-sm font-bold">#</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900 group-hover:underline">{{ c.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-slate-600">{{ c.description }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Category = {
  slug: string
  title: string
  description: string
  icon?: string
}

type Link = { label: string; to: string }

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    categories?: Category[]
    allLink?: Link
  }>(),
  {
    title: "Categorías destacadas",
    subtitle: "Explora las familias de producto más solicitadas.",
    categories: () => [
      { slug: "gran-formato", title: "Gran formato", description: "Lonas, carteles, paneles y soportes rígidos.", icon: "lucide:landmark" },
      { slug: "vinilos", title: "Vinilos", description: "Escaparates, vehículos, paredes y señalética.", icon: "lucide:sticker" },
      { slug: "plv", title: "PLV y stands", description: "Ferias, expositores, roll-ups y displays.", icon: "lucide:layout-template" },
      { slug: "impresion-digital", title: "Impresión digital", description: "Flyers, tarjetas, folletos y catálogos.", icon: "lucide:printer" },
      { slug: "rotulos", title: "Rótulos", description: "Rótulos luminosos, corpóreos y señalización.", icon: "lucide:badge" },
      { slug: "merchandising", title: "Merchandising", description: "Regalos corporativos personalizados.", icon: "lucide:gift" },
    ],
    allLink: () => ({ label: "Ver todas las categorías", to: "/categorias" }),
  }
)
</script>
