<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    addressLines?: string[];
    mapsQuery?: string; // texto para buscar en google maps
    mapsUrl?: string; // si ya tienes una url directa

    /**
     * Figma: normalmente NO se muestra texto en el bloque del mapa.
     * Si quieres mostrar cabecera + CTA (modo "contacto"), ponlo a true.
     */
    showMeta?: boolean;

    /** clases para alinear con tu layout global */
    sectionClass?: string;
    containerClass?: string;

    /** altura del mapa (full-bleed). Ajusta a tu Figma si hace falta. */
    heightClass?: string;

    /** muestra un CTA flotante "Ver en Google Maps" encima del mapa */
    showFloatingCta?: boolean;
  }>(),
  {
    title: "Dónde estamos",
    subtitle: "Visítanos o ven a recoger tu pedido.",
    addressLines: () => ["Repro Disseny, SL", "C/ Juan de Mena, 19", "08035, Barcelona"],
    mapsQuery: "Repro Disseny, SL, C/ Juan de Mena 19, 08035 Barcelona",

    showMeta: false,
    sectionClass: "bg-background",
    containerClass: "container",
    // desktop similar a tu captura (ajústalo si tu Figma marca otra altura)
    heightClass: "h-[455px]",
    showFloatingCta: false,
  }
);

const mapsHref = computed(() => {
  if (props.mapsUrl) return props.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    props.mapsQuery
  )}`;
});

// Iframe embed (sin API key)
const embedSrc = computed(() => {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    props.mapsQuery
  )}&output=embed`;
});
</script>

<template>
  <section :class="props.sectionClass">
    <!-- Opcional: meta arriba (si quieres reutilizarlo en /contacto) -->
    <div v-if="props.showMeta" :class="props.containerClass" class="py-12 sm:py-16">
      <h2>{{ props.title }}</h2>
      <p class="text-body mb-0 mt-3 text-muted-foreground">
        {{ props.subtitle }}
      </p>

      <div class="mt-6">
        <div class="text-label text-foreground">Dirección</div>
        <div class="mt-2 space-y-1 text-body text-muted-foreground">
          <p v-for="(l, i) in props.addressLines" :key="i" class="mb-0">{{ l }}</p>
        </div>

        <a
          :href="mapsHref"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary mt-5"
        >
          Ver en Google Maps
        </a>
      </div>
    </div>

    <!-- ✅ Figma: mapa a lo ancho, sin card -->
    <div class="relative w-full overflow-hidden">
      <ClientOnly>
        <div class="w-full" :class="props.heightClass">
          <iframe
            class="h-full w-full"
            :src="embedSrc"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            title="Mapa"
          />
        </div>

        <!-- CTA flotante opcional (si lo quieres) -->
        <a
          v-if="props.showFloatingCta"
          :href="mapsHref"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary absolute left-4 top-4"
        >
          Ver en Google Maps
        </a>

        <template #fallback>
          <div class="w-full" :class="props.heightClass">
            <div
              class="flex h-full w-full items-center justify-center bg-muted text-body text-muted-foreground"
            >
              Cargando mapa…
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- SEO/Accesibilidad (sin ensuciar el diseño) -->
      <div class="sr-only">
        <h2>{{ props.title }}</h2>
        <p>{{ props.subtitle }}</p>
        <p v-for="(l, i) in props.addressLines" :key="'a' + i">{{ l }}</p>
        <a :href="mapsHref">Ver en Google Maps</a>
      </div>
    </div>
  </section>
</template>
