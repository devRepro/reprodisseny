<!-- components/google/reviews/Carousel.vue -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useHead } from "#imports";
import emblaCarouselVue from "embla-carousel-vue";

import AppButton from "@/components/shared/button/AppButton.vue";
import type { ReviewCardItem } from "@/types/reviews";

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
    mapsUrl: "",
    rating: undefined,
    count: undefined,
  },
);

const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: true,
  align: "start",
  watchFocus: true,
});

const selectedIndex = ref(0);
const expanded = ref<Record<string, boolean>>({});

const slides = computed<ReviewCardItem[]>(() =>
  (props.reviews ?? []).filter(Boolean),
);

const hasAggregate = computed(
  () =>
    Boolean(props.businessName) &&
    Number.isFinite(props.rating) &&
    Number.isFinite(props.count),
);

function getReviewKey(review: ReviewCardItem, index: number) {
  return String(review.id || `${review.author || "review"}-${index}`);
}

function isExpanded(review: ReviewCardItem, index: number) {
  return Boolean(expanded.value[getReviewKey(review, index)]);
}

function toggleExpanded(review: ReviewCardItem, index: number) {
  const key = getReviewKey(review, index);
  expanded.value[key] = !expanded.value[key];
}

function onSelect() {
  if (!emblaApi.value) return;
  selectedIndex.value = emblaApi.value.selectedScrollSnap();
}

function prev() {
  emblaApi.value?.scrollPrev();
}

function next() {
  emblaApi.value?.scrollNext();
}

function scrollTo(index: number) {
  emblaApi.value?.scrollTo(index);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    next();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prev();
  }
}

onMounted(() => {
  if (!emblaApi.value) return;

  emblaApi.value.on("select", onSelect);
  emblaApi.value.on("reInit", onSelect);
  onSelect();
});

onBeforeUnmount(() => {
  if (!emblaApi.value) return;

  emblaApi.value.off("select", onSelect);
  emblaApi.value.off("reInit", onSelect);
});

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
    : {},
);
</script>

<template>
  <section
    aria-labelledby="reviews-title"
    class="google-reviews-section"
  >
    <div class="container-wide">
      <header class="google-reviews-header">
        <div class="min-w-0">
          <p class="section-eyebrow">
            Opiniones verificadas
          </p>

          <h2
            id="reviews-title"
            class="section-title section-title--subsection mt-2"
          >
            {{ title }}
          </h2>

          <p
            v-if="typeof rating === 'number' && typeof count === 'number'"
            class="google-reviews-rating"
          >
            <span class="font-semibold text-foreground">
              {{ rating.toFixed(1) }}
            </span>
            / 5 · {{ count }} valoraciones
          </p>
        </div>

        <div class="google-reviews-header-actions">
          <AppButton
            v-if="mapsUrl"
            :href="mapsUrl"
            target="_blank"
            rel="noopener nofollow"
            variant="outline"
            size="sm"
          >
            Ver todas en Google
          </AppButton>

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
            class="hidden h-4 w-auto dark:block"
            loading="lazy"
            decoding="async"
          />
        </div>
      </header>

      <p
        v-if="!slides.length"
        class="google-reviews-empty"
      >
        No hay reseñas para mostrar.
      </p>

      <div
        v-else
        ref="emblaRef"
        class="google-reviews-carousel"
        role="region"
        aria-roledescription="carousel"
        :aria-label="title"
        tabindex="0"
        @keydown="onKeydown"
      >
        <div class="google-reviews-track">
          <article
            v-for="(review, index) in slides"
            :key="getReviewKey(review, index)"
            class="google-reviews-slide"
            role="group"
            :aria-label="`Opinión ${index + 1} de ${slides.length}`"
          >
            <div class="google-reviews-card">
              <div class="google-reviews-card-header">
                <Avatar class="h-10 w-10 shrink-0">
                  <AvatarImage
                    :src="review.avatar || undefined"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                  />

                  <AvatarFallback>
                    {{ (review.author || "?").slice(0, 1).toUpperCase() }}
                  </AvatarFallback>
                </Avatar>

                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-foreground">
                    {{ review.author }}
                  </p>

                  <p class="text-xs text-muted-foreground">
                    {{ review.time }}
                  </p>
                </div>

                <div
                  class="google-reviews-stars"
                  aria-label="Puntuación"
                  role="img"
                >
                  <svg
                    v-for="star in 5"
                    :key="star"
                    viewBox="0 0 20 20"
                    class="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.886 2.125c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L3.48 8.72c-.783-.57-.38-1.81.588-1.81H7.53a1 1 0 0 0 .95-.69l1.07-3.292z"
                      :fill="review.rating >= star ? 'currentColor' : 'none'"
                      stroke="currentColor"
                    />
                  </svg>

                  <span class="sr-only">
                    {{ review.rating }} de 5
                  </span>
                </div>
              </div>

              <div class="google-reviews-card-body">
                <p :class="{ 'google-reviews-clamp': !isExpanded(review, index) }">
                  {{ review.text }}
                </p>

                <div class="google-reviews-card-footer">
                  <button
                    v-if="review.text?.length > 240"
                    type="button"
                    class="google-reviews-text-button"
                    @click="toggleExpanded(review, index)"
                  >
                    {{ isExpanded(review, index) ? "Ver menos" : "Ver más" }}
                  </button>

                  <a
                    v-if="review.url"
                    :href="review.url"
                    target="_blank"
                    rel="noopener nofollow"
                    class="google-reviews-link"
                  >
                    Ver en Google
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="google-reviews-controls">
          <div class="google-reviews-arrows">
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              aria-label="Anterior"
              @click="prev"
            >
              ‹
            </AppButton>

            <AppButton
              type="button"
              variant="outline"
              size="sm"
              aria-label="Siguiente"
              @click="next"
            >
              ›
            </AppButton>
          </div>

          <div
            class="google-reviews-dots"
            aria-label="Diapositivas"
          >
            <button
              v-for="(_, index) in slides"
              :key="index"
              type="button"
              class="google-reviews-dot"
              :class="index === selectedIndex && 'google-reviews-dot--active'"
              :aria-label="`Ir a la reseña ${index + 1}`"
              :aria-current="index === selectedIndex ? 'true' : undefined"
              @click="scrollTo(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>