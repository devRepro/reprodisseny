<!-- components/google/reviews/Carousel.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import emblaCarouselVue from "embla-carousel-vue";

import type { ReviewCardItem } from "@/types/reviews";
// useHead está autoimportado en Nuxt; si tu TS se queja, añade: import { useHead } from '#imports'

const props = withDefaults(
  defineProps<{
    title?: string;
    reviews: ReviewCardItem[];
    rating?: number;
    count?: number;
    mapsUrl?: string;
    businessName?: string;
    businessUrl?: string;
  }>(),
  {
    title: "Opiniones de clientes",
    businessName: "",
    businessUrl: "",
  }
);

// Embla – inicializa en cliente
const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: true,
  align: "start",
  watchFocus: true,
});
const selectedIndex = ref(0);
const onSelect = () => {
  if (!emblaApi.value) return;
  selectedIndex.value = emblaApi.value.selectedScrollSnap();
};

onMounted(() => {
  if (!emblaApi.value) return;
  emblaApi.value.on("select", onSelect);
  onSelect();
});
onBeforeUnmount(() => {
  // Limpia el listener si está disponible el método off
  // (algunas versiones lo exponen; si no, no pasa nada)
  // @ts-expect-error - off puede no existir según versión
  emblaApi.value?.off?.("select", onSelect);
});

function prev() {
  emblaApi.value?.scrollPrev();
}
function next() {
  emblaApi.value?.scrollNext();
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  }
}

const expanded = ref<Record<string, boolean>>({});

// Normalización por si llegan nulos
const slides = computed<ReviewCardItem[]>(() => (props.reviews ?? []).filter((r) => !!r));

// ---------- JSON-LD al <head> (no en template) ----------
const hasAggregate = computed(
  () =>
    !!props.businessName && Number.isFinite(props.rating) && Number.isFinite(props.count)
);

useHead(() =>
  hasAggregate.value
    ? {
        script: [
          {
            key: `ld-agg-rating-${props.businessName}`,
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: props.businessName,
              ...(props.businessUrl ? { url: props.businessUrl } : {}),
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: props.rating,
                reviewCount: props.count,
              },
            }),
          },
        ],
      }
    : {}
);
</script>

<template>
  <section aria-labelledby="reviews-title" class="w-full">
    <header class="mb-4 flex items-center justify-between gap-3">
      <h2 id="reviews-title" class="text-xl font-semibold">{{ title }}</h2>
      <div class="flex items-center gap-3">
        <a
          v-if="mapsUrl"
          :href="mapsUrl"
          target="_blank"
          rel="noopener nofollow"
          class="text-xs text-muted-foreground underline underline-offset-2"
        >
          Ver todas en Google
        </a>
        <img
          src="/img/google/google-badge-light.svg"
          alt="Google"
          class="h-4 w-auto dark:hidden"
          loading="lazy"
          decoding="async"
        />
        <img
          src="/img/google/google-badge-dark.svg"
          alt="Google"
          class="h-4 w-auto hidden dark:block"
          loading="lazy"
          decoding="async"
        />
      </div>
    </header>

    <p
      v-if="typeof rating === 'number' && typeof count === 'number'"
      class="mb-3 text-sm text-muted-foreground"
    >
      <span class="font-medium">{{ rating.toFixed(1) }}</span> / 5 ·
      {{ count }} valoraciones
    </p>

    <p v-if="!slides.length" class="text-sm text-muted-foreground">
      No hay reseñas para mostrar.
    </p>

    <div
      v-else
      ref="emblaRef"
      class="embla outline-none"
      role="region"
      aria-roledescription="carousel"
      :aria-label="title"
      tabindex="0"
      @keydown="onKeydown"
    >
      <div class="embla__container">
        <div
          v-for="(r, i) in slides"
          :key="r.id || i"
          class="embla__slide px-2"
          role="group"
          :aria-label="`Opinión ${i + 1} de ${slides.length}`"
        >
          <Card class="h-full">
            <CardContent class="p-4">
              <div class="flex items-center gap-3">
                <Avatar class="h-9 w-9 shrink-0">
                  <AvatarImage
                    :src="r.avatar || undefined"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                  />
                  <AvatarFallback>{{
                    (r.author || "?").slice(0, 1).toUpperCase()
                  }}</AvatarFallback>
                </Avatar>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ r.author }}</p>
                  <p class="text-xs text-muted-foreground">{{ r.time }}</p>
                </div>
                <div
                  class="ml-auto flex items-center gap-1 text-amber-500"
                  aria-label="Puntuación"
                  role="img"
                >
                  <svg
                    v-for="n in 5"
                    :key="n"
                    viewBox="0 0 20 20"
                    class="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.886 2.125c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L3.48 8.72c-.783-.57-.38-1.81.588-1.81H7.53a1 1 0 0 0 .95-.69l1.07-3.292z"
                      :fill="r.rating >= n ? 'currentColor' : 'none'"
                      stroke="currentColor"
                    />
                  </svg>
                  <span class="sr-only">{{ r.rating }} de 5</span>
                </div>
              </div>

              <div class="mt-3 text-sm leading-relaxed">
                <p :class="{ 'line-clamp-5': !expanded[r.id] }">{{ r.text }}</p>
                <div class="mt-2 flex items-center justify-between">
                  <button
                    v-if="r.text?.length > 240"
                    class="text-xs text-primary underline underline-offset-2"
                    @click="expanded[r.id] = !expanded[r.id]"
                  >
                    {{ expanded[r.id] ? "Ver menos" : "Ver más" }}
                  </button>
                  <a
                    v-if="r.url"
                    :href="r.url"
                    target="_blank"
                    rel="noopener nofollow"
                    class="ml-auto text-xs text-muted-foreground underline underline-offset-2"
                  >
                    Ver en Google
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="prev" aria-label="Anterior"
            >‹</Button
          >
          <Button variant="outline" size="sm" @click="next" aria-label="Siguiente"
            >›</Button
          >
        </div>
        <div class="flex items-center gap-1" aria-label="Diapositivas">
          <button
            v-for="(_, i) in slides"
            :key="i"
            class="h-1.5 w-5 rounded-full transition-all"
            :class="i === selectedIndex ? 'bg-foreground' : 'bg-muted'"
            :aria-label="`Ir a la reseña ${i + 1}`"
            @click="emblaApi?.scrollTo(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.embla {
  overflow: hidden;
}
.embla__container {
  display: flex;
}
.embla__slide {
  flex: 0 0 auto;
  min-width: 0;
  width: 100%;
}
@media (min-width: 640px) {
  .embla__slide {
    width: 50%;
  }
}
@media (min-width: 1024px) {
  .embla__slide {
    width: 33.3333%;
  }
}
.line-clamp-5 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
}
</style>
