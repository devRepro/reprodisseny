<!-- components/category/Carousel.vue -->
<script setup lang="ts">
import { computed } from "vue";
// Importa SIEMPRE desde shadcn-nuxt:
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const props = withDefaults(
  defineProps<{
    items: any[] | null | undefined;
  }>(),
  {
    items: () => [],
  }
);

// Normaliza lista
const list = computed(() => (Array.isArray(props.items) ? props.items : []));

// Construye ruta de página (nunca API) y limpia dobles barras
const pageLink = (it: any) =>
  (it?.path || (it?.slug ? `/categorias/${it.slug}` : "/categorias")).replace(
    /\/{2,}/g,
    "/"
  );

// Key estable
const itemKey = (it: any) => it.id ?? it._id ?? it.slug ?? it.path ?? JSON.stringify(it);

// Imagen segura (placeholder si no hay)
const imgSrc = (it: any) => {
  const raw = it?.image;
  const src = typeof raw === "string" ? raw : raw?.src;
  return src || "/img/placeholders/categoria.webp";
};
</script>

<template>
  <section>
    <div v-if="!list.length" class="py-8 text-center text-muted-foreground">
      No hay categorías para mostrar.
    </div>

    <!-- Embla en client -->
    <ClientOnly v-else>
      <Carousel class="relative" :opts="{ align: 'start', loop: true, dragFree: true }">
        <CarouselContent>
          <CarouselItem
            v-for="it in list"
            :key="itemKey(it)"
            class="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <NuxtLink :to="pageLink(it)" class="block group h-full">
              <Card
                class="h-full overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div class="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <NuxtImg
                    :src="imgSrc(it)"
                    :alt="it.alt || it.nav || it.title || 'Categoría'"
                    sizes="(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 20vw"
                    width="600"
                    height="450"
                    format="webp"
                    loading="lazy"
                    class="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                </div>

                <CardContent class="p-4">
                  <h3 class="line-clamp-1 text-base font-semibold">
                    {{ it.nav || it.title || it.slug }}
                  </h3>
                  <p
                    v-if="it.description"
                    class="mt-1 line-clamp-2 text-sm text-muted-foreground"
                  >
                    {{ it.description }}
                  </p>
                </CardContent>
              </Card>
            </NuxtLink>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious class="left-0 md:-left-3" />
        <CarouselNext class="right-0 md:-right-3" />
      </Carousel>
    </ClientOnly>
  </section>
</template>
