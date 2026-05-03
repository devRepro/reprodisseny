<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight } from "lucide-vue-next";

type CategoryCard = {
  slug?: string;
  title?: string;
  nav?: string;
  description?: string;
  shortDescription?: string;
  path?: string;
  image?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  } | null;
};

const pageContainerClass = "container-content";

const { data: categoriesResponse, pending, error } = await useAsyncData(
  "categorias-page-grid",
  () =>
    $fetch<any>("/api/home/categorias", {
      query: { limit: 24 },
    }),
  {
    server: true,
    lazy: false,
    default: () => [],
  }
);

const categories = computed<CategoryCard[]>(() => {
  const value = categoriesResponse.value as any;

  if (Array.isArray(value)) return value.filter(Boolean);
  if (Array.isArray(value?.categories)) return value.categories.filter(Boolean);
  if (Array.isArray(value?.items)) return value.items.filter(Boolean);
  if (Array.isArray(value?.data)) return value.data.filter(Boolean);

  return [];
});

function categoryTitle(category: CategoryCard) {
  return category.nav || category.title || "Categoría";
}

function categoryDescription(category: CategoryCard) {
  return (
    category.shortDescription ||
    category.description ||
    "Consulta productos, formatos y soluciones disponibles para esta familia."
  );
}

function categoryHref(category: CategoryCard) {
  if (category.path) return category.path;
  if (category.slug) return `/categorias/${category.slug}`;
  return "/categorias";
}

useSeoMeta({
  title: "Categorías de impresión | Reprodisseny",
  description:
    "Explora nuestras familias de producto: adhesivos, gran formato, expositores, publicaciones, eventos, publicidad y oficina, hostelería y restauración.",
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <section :class="[pageContainerClass, 'pt-12 pb-8 md:pt-16 md:pb-10']">
      <div class="max-w-3xl">
        <p
          class="mb-5 text-body-s font-semibold uppercase tracking-[0.22em] text-primary"
        >
          Categorías
        </p>

        <h1 class="font-h1 text-balance text-foreground">
          Explora nuestras familias de producto
        </h1>

        <p class="mt-5 max-w-2xl text-body leading-8 text-muted-foreground">
          Accede a las principales líneas de soluciones y navega por familias para
          encontrar el formato, soporte o servicio más adecuado para tu proyecto.
        </p>
      </div>
    </section>

    <section :class="[pageContainerClass, 'pb-14 md:pb-20']">
      <div v-if="pending" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 6"
          :key="i"
          class="h-[260px] animate-pulse rounded-[28px] border border-border/70 bg-muted/40"
        />
      </div>

      <div
        v-else-if="error"
        class="rounded-[28px] border border-red-100 bg-red-50 px-6 py-8 text-red-700"
      >
        No se han podido cargar las categorías.
      </div>

      <div
        v-else-if="categories.length === 0"
        class="rounded-[28px] border border-border/70 bg-card px-6 py-8 text-muted-foreground"
      >
        No hay categorías disponibles en este momento.
      </div>

      <div v-else>
        <div class="mb-8 max-w-3xl">
          <h2 class="font-h2 text-balance text-foreground">Familias de producto</h2>

          <p class="mt-4 text-body leading-7 text-muted-foreground">
            Elige una categoría para ver productos, formatos y soluciones relacionadas.
          </p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="category in categories"
            :key="category.slug || category.path || categoryTitle(category)"
            :to="categoryHref(category)"
            class="group overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <div class="aspect-[16/9] bg-muted">
              <img
                v-if="category.image?.src"
                :src="category.image.src"
                :alt="category.image.alt || categoryTitle(category)"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>

            <div class="p-5 md:p-6">
              <h3 class="font-h3 text-balance text-foreground">
                {{ categoryTitle(category) }}
              </h3>

              <p class="mt-3 line-clamp-3 text-body-s leading-6 text-muted-foreground">
                {{ categoryDescription(category) }}
              </p>

              <div
                class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Ver categoría
                <ArrowRight
                  class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section :class="[pageContainerClass, 'pt-2 pb-14 md:pt-4 md:pb-20']">
      <div
        class="rounded-[28px] border border-border/70 bg-card px-6 py-8 md:px-8 md:py-10"
      >
        <p
          class="mb-4 text-body-s font-semibold uppercase tracking-[0.22em] text-primary"
        >
          Catálogo completo
        </p>

        <h2 class="font-h2 text-balance text-foreground">
          ¿Prefieres buscar directamente entre todos los productos?
        </h2>

        <p class="mt-4 max-w-2xl text-body leading-7 text-muted-foreground">
          También puedes consultar el catálogo completo y encontrar productos concretos
          por nombre, familia o tipo de aplicación.
        </p>

        <NuxtLink
          to="/productos"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Ver todos los productos
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
