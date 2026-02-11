<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    addressLines?: string[]
    mapsQuery?: string // texto para buscar en google maps
    mapsUrl?: string   // si ya tienes una url directa
  }>(),
  {
    title: "Dónde estamos",
    subtitle: "Visítanos o ven a recoger tu pedido.",
    addressLines: () => ["Repro Disseny, SL", "C/ Juan de Mena, 19", "08035, Barcelona"],
    mapsQuery: "Repro Disseny, SL, C/ Juan de Mena 19, 08035 Barcelona",
  }
)

const mapsHref = computed(() => {
  if (props.mapsUrl) return props.mapsUrl
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.mapsQuery)}`
})

// Iframe embed (sin API key)
const embedSrc = computed(() => {
  // Esto funciona bien para embeds simples:
  return `https://www.google.com/maps?q=${encodeURIComponent(props.mapsQuery)}&output=embed`
})
</script>

<template>
  <section class="bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
        <!-- Texto (SEO-friendly) -->
        <div>
          <h2 class="text-2xl sm:text-3xl font-semibold text-[#1E1E1E]">
            {{ title }}
          </h2>
          <p class="mt-3 text-base text-[#4B4B4B]">
            {{ subtitle }}
          </p>

          <div class="mt-6 rounded-2xl border border-[#E6E6E6] p-6">
            <div class="text-sm font-semibold text-[#1E1E1E]">Dirección</div>
            <div class="mt-2 space-y-1 text-sm text-[#4B4B4B]">
              <p v-for="(l, i) in addressLines" :key="i">{{ l }}</p>
            </div>

            <a
              class="mt-5 inline-flex items-center justify-center rounded-lg bg-[#0076B3] px-4 py-2 text-sm font-medium text-white hover:bg-[#005a8d] transition-colors"
              :href="mapsHref"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en Google Maps
            </a>
          </div>
        </div>

        <!-- Mapa (client-only para no afectar SSR) -->
        <ClientOnly>
          <div class="overflow-hidden rounded-2xl border border-[#E6E6E6] bg-[#F7F7F7]">
            <div class="aspect-[16/10] w-full">
              <iframe
                class="h-full w-full"
                :src="embedSrc"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
              />
            </div>
          </div>

          <template #fallback>
            <!-- Placeholder SSR -->
            <div class="overflow-hidden rounded-2xl border border-[#E6E6E6] bg-[#F2F2F2]">
              <div class="aspect-[16/10] w-full flex items-center justify-center text-sm text-[#666]">
                Cargando mapa…
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>