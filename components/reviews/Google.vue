<!-- components/GoogleReviews.vue -->
<script setup lang="ts">
import { computed, defineComponent, h } from "vue";
import { useHead } from "#imports";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Props
const props = withDefaults(defineProps<{
  title?: string;
  limit?: number;          // cuántas reseñas pintar (<=5 por API)
  placeId?: string;        // para el enlace "Ver todas en Google"
}>(), {
  title: "Opiniones de clientes",
  limit: 5
});

// Tu composable actual
const { data, pending, error } = useGoogleReviews({ lang: "es" });

/** Normaliza nombres de campos según la versión de Places/endpoint */
const normalized = computed(() => {
  const r = data?.value ?? {};
  const reviews = (r.reviews ?? []).map((it: any) => ({
    author: it.author || it.author_name,
    authorUrl: it.author_url || it.authorAttribution?.uri,
    avatar: it.profilePhotoUri || it.profile_photo_url || it.authorAttribution?.photoUri,
    rating: Number(it.rating ?? 0),
    text: it.text ?? it.originalText?.text ?? "",
    time: it.relativeTime || it.relative_time_description || it.publishTime || it.time
  }));

  return {
    rating: Number(r.rating ?? r.averageRating ?? 0),
    total: Number(r.total ?? r.userRatingCount ?? r.user_ratings_total ?? reviews.length),
    reviews
  };
});

// JSON-LD básico para LocalBusiness + AggregateRating (Google Search)
useHead(() => {
  if (!normalized.value.rating || !normalized.value.total) return {};
  return {
    script: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Repro Disseny",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": normalized.value.rating,
          "reviewCount": normalized.value.total
        }
      })
    }]
  };
});

// Enlace a todas las reseñas en Google
const allReviewsUrl = computed(() =>
  props.placeId ? `https://www.google.com/maps/place/?q=place_id:${props.placeId}` : undefined
);

/** Stars: SVG accesible sin dependencias extra */
const Stars = defineComponent({
  name: "Stars",
  props: { value: { type: Number, required: true } },
  setup(p) {
    return () => h("div", { class: "flex items-center", role: "img", "aria-label": `Puntuación ${p.value} de 5` },
      Array.from({ length: 5 }, (_, i) => {
        const full = p.value >= i + 1;
        const half = p.value > i && p.value < i + 1;
        return h("svg", {
          key: i, viewBox: "0 0 20 20",
          class: "h-4 w-4", "aria-hidden": "true"
        }, [
          h("path", {
            d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.886 2.125c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.48 8.72c-.783-.57-.38-1.81.588-1.81H7.53a1 1 0 00.95-.69l1.07-3.292z",
            fill: full ? "currentColor" : "none", stroke: "currentColor"
          }),
          half && h("path", {
            d: "M10 2.5v15.1", stroke: "currentColor", "stroke-width": "0" // marcador para mitad (opcional: simplificado)
          })
        ]);
      })
    );
  }
});

/** Clamp simple con line-clamp de Tailwind */
const Clamp = defineComponent({
  name: "Clamp",
  props: { text: { type: String, default: "" }, lines: { type: Number, default: 5 } },
  setup(p) { return () => h("span", { class: `line-clamp-${p.lines}` }, p.text); }
});
</script>

<template>
  <section aria-labelledby="reviews-title" class="max-w-3xl mx-auto">
    <header class="mb-4 flex items-center justify-between gap-3">
      <h2 id="reviews-title" class="text-xl font-semibold">
        {{ title }}
      </h2>

      <!-- ⚠️ Muestra SIEMPRE la atribución oficial cuando no hay mapa -->
      <a
        class="inline-flex items-center gap-2 text-xs text-muted-foreground"
        :href="allReviewsUrl || 'https://maps.google.com'"
        target="_blank" rel="noopener noreferrer"
        aria-label="Ver reseñas en Google"
      >
        <!-- Descarga el asset oficial desde la página de attributions de Google -->
        <img
          src="/img/google/powered-by-google-on-white@2x.png"
          alt="Powered by Google"
          class="h-4 w-auto"
          loading="lazy" decoding="async"
        />
      </a>
    </header>

    <!-- Loading skeleton -->
    <div v-if="pending" class="space-y-3">
      <div class="flex items-center gap-3">
        <Skeleton class="h-6 w-40" />
      </div>
      <div class="space-y-3">
        <Card v-for="i in 3" :key="i" class="p-4">
          <div class="flex items-center gap-3">
            <Skeleton class="h-8 w-8 rounded-full" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-3 w-20" />
            </div>
            <Skeleton class="h-4 w-10" />
          </div>
          <Skeleton class="mt-3 h-16 w-full" />
        </Card>
      </div>
    </div>

    <!-- Error -->
    <p v-else-if="error" class="text-sm text-destructive">
      No se han podido cargar las reseñas.
    </p>

    <!-- Content -->
    <div v-else>
      <p class="mb-3 text-sm text-muted-foreground">
        <span class="font-medium">{{ normalized.rating?.toFixed?.(1) || "—" }}</span>
        / 5 · {{ normalized.total }} valoraciones
      </p>

      <ScrollArea class="max-h-[520px] pr-3">
        <ul class="space-y-4">
          <li v-for="(r, idx) in normalized.reviews.slice(0, limit)" :key="idx">
            <Card class="p-4">
              <div class="flex items-center gap-3">
                <Avatar class="h-8 w-8">
                  <AvatarImage
                    :src="r.avatar"
                    alt=""
                    loading="lazy" decoding="async"
                    referrerpolicy="no-referrer"
                  />
                  <AvatarFallback>{{ (r.author || "?").slice(0, 1).toUpperCase() }}</AvatarFallback>
                </Avatar>

                <div class="text-sm leading-tight">
                  <p class="font-medium">
                    <a v-if="r.authorUrl" :href="r.authorUrl" target="_blank" rel="noopener noreferrer">
                      {{ r.author }}
                    </a>
                    <span v-else>{{ r.author }}</span>
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ r.time }}
                  </p>
                </div>

                <div class="ml-auto">
                  <Stars :value="r.rating" />
                </div>
              </div>

              <p class="mt-3 text-sm leading-relaxed">
                <Clamp :text="r.text" :lines="5" />
              </p>
            </Card>
          </li>
        </ul>
      </ScrollArea>

      <div class="mt-4 flex justify-end">
        <Button v-if="allReviewsUrl" as-child variant="secondary" size="sm">
          <a :href="allReviewsUrl" target="_blank" rel="noopener noreferrer">
            Ver todas en Google
          </a>
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Asegúrate de tener habilitado 'lineClamp' en tailwind.config */
</style>

