<!-- components/category/Carousel.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { categoryHref } from "@/utils/categoryHref";
import CmsImage from "@/components/shared/blocks/CmsImage.vue";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Card, CardContent } from "@/components/ui/card";

type CarouselItemData = {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  path?: string;
  nav?: string;
  title?: string;
  description?: string;
  alt?: string;
  image?:
    | string
    | {
        src?: string | null;
        alt?: string | null;
        width?: number | null;
        height?: number | null;
      }
    | null;
};

const props = withDefaults(
  defineProps<{
    items: CarouselItemData[] | null | undefined;
  }>(),
  {
    items: () => [],
  }
);

const list = computed(() => (Array.isArray(props.items) ? props.items : []));

function pageLink(item: CarouselItemData) {
  return categoryHref(item);
}

function itemKey(item: CarouselItemData) {
  return item.id ?? item._id ?? item.slug ?? item.path ?? JSON.stringify(item);
}

function imageSrcOf(item: CarouselItemData) {
  const raw = item?.image;

  if (typeof raw === "string") {
    return raw || "/img/placeholders/categoria.webp";
  }

  return raw?.src || "/img/placeholders/categoria.webp";
}

function imageAltOf(item: CarouselItemData) {
  const raw = item?.image;

  if (typeof raw === "object" && raw?.alt) {
    return raw.alt;
  }

  return item.alt || item.nav || item.title || "Categoría";
}

function imageWidthOf(item: CarouselItemData) {
  const raw = item?.image;

  if (typeof raw === "object" && raw?.width) {
    return raw.width;
  }

  return 600;
}

function imageHeightOf(item: CarouselItemData) {
  const raw = item?.image;

  if (typeof raw === "object" && raw?.height) {
    return raw.height;
  }

  return 450;
}
</script>

<template>
  <section>
    <div v-if="!list.length" class="py-8 text-center text-muted-foreground">
      No hay categorías para mostrar.
    </div>

    <ClientOnly v-else>
      <Carousel class="relative" :opts="{ align: 'start', loop: true, dragFree: true }">
        <CarouselContent>
          <CarouselItem
            v-for="it in list"
            :key="itemKey(it)"
            class="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <NuxtLink :to="pageLink(it)" class="block h-full group">
              <Card
                class="h-full overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
              >
                <div class="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <CmsImage
                    :src="imageSrcOf(it)"
                    :alt="imageAltOf(it)"
                    :width="imageWidthOf(it)"
                    :height="imageHeightOf(it)"
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
