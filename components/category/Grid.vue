<!-- components/category/Grid.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { CategoriaNodeNav } from "@/types";

// ⬇️ importa explícitamente los componentes shadcn
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { NuxtImg } from "#components";

const props = defineProps<{ categories: CategoriaNodeNav[] | undefined | null }>();

/** normaliza la lista */
const items = computed(() => (Array.isArray(props.categories) ? props.categories : []));

/** Construye URL de imagen con fallback (usa /public) */
function getCategoryImageUrl(image?: string): string {
  const fallback = "/img/categorias/mockupCategoria.webp";
  if (!image || !image.trim()) return fallback;
  return image.startsWith("/") ? image : `/img/categorias/${image}`;
}

/** Label accesible */
const labelOf = (c: CategoriaNodeNav) =>
  `Ver categoría ${c.nav || c.title || c.slug || ""}`;
</script>

<template>
  <section aria-labelledby="category-grid-title" class="container mx-auto px-4 py-10">
    <h2 id="category-grid-title" class="sr-only">Categorías</h2>

    <!-- estado vacío claro -->
    <div v-if="!items.length" class="text-center text-sm text-muted-foreground py-10">
      No hay categorías para mostrar.
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="c in items"
        :key="c.path || c.slug"
        :to="c.path || `/categorias/${c.slug}`"
        class="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background transition-shadow hover:shadow-lg"
        :aria-label="labelOf(c)"
        prefetch
      >
        <Card
          class="h-full overflow-hidden flex flex-col bg-white dark:bg-muted border border-border shadow-sm"
        >
          <CardHeader class="p-0 border-b">
            <div class="aspect-[3/2] overflow-hidden">
              <NuxtImg
                :src="getCategoryImageUrl(c.image)"
                :alt="c.alt || c.title || c.slug || 'Imagen de categoría'"
                class="w-full h-full object-cover object-center transition-transform duration-300 ease-in-out group-hover:scale-105"
                width="400"
                height="267"
                format="webp"
                placeholder
                loading="lazy"
              />
            </div>
          </CardHeader>

          <CardContent class="p-4 flex-grow flex items-center justify-center">
            <CardTitle
              class="text-lg md:text-base text-center font-semibold text-foreground group-hover:text-primary transition-colors duration-200"
            >
              {{ c.nav || c.title || c.slug }}
            </CardTitle>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </section>
</template>
