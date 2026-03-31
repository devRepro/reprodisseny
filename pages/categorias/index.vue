<script setup lang="ts">
import { computed } from "vue";
import { useSeoMeta, useHead } from "#imports";

import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";
import CategoryChildrenGrid from "@/components/marketing/category/CategoryChildrenGrid.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid";

const {
  categories,
  pending,
  error,
} = await useHomeCategoriesGrid(24);

const canonical = computed(() => "https://reprodisseny.com/categorias");

useSeoMeta({
  title: "Categorías de producto | Reprodisseny",
  description:
    "Explora nuestras principales categorías de producto y encuentra la solución que mejor encaja con tu proyecto de impresión, comunicación visual o producción gráfica.",
  ogTitle: "Categorías de producto | Reprodisseny",
  ogDescription:
    "Explora nuestras principales categorías de producto y encuentra la solución que mejor encaja con tu proyecto.",
  robots: "index,follow",
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonical.value }],
}));
</script>

<template>
  <main class="min-h-screen bg-background">
    <div v-if="pending" class="container-content py-16 md:py-20">
      <div
        class="flex min-h-[30vh] items-center justify-center rounded-[28px] border border-border/70 bg-card/70"
      >
        <div class="animate-pulse text-body text-muted-foreground">
          Cargando categorías...
        </div>
      </div>
    </div>

    <template v-else>
      <div class="pb-16 md:pb-24">
        <div class="space-y-16 md:space-y-20">
          <ContentSectionShell
            eyebrow="Categorías"
            title="Explora nuestras familias de producto"
            description="Accede a las principales líneas de soluciones y navega por familias para encontrar el formato, soporte o servicio más adecuado para tu proyecto."
          >
            <CategoryChildrenGrid
              :children="categories"
              eyebrow=""
              title=""
              description=""
              container-class=""
            />
          </ContentSectionShell>

          <section v-if="error" class="container-content">
            <div class="rounded-[28px] border border-border/70 bg-card p-8 shadow-sm">
              <h2 class="text-[28px] font-semibold leading-[1.2] text-foreground">
                No pudimos cargar las categorías
              </h2>
              <p class="mt-3 max-w-[60ch] text-body text-foreground/72">
                Ha ocurrido un problema al consultar las familias de producto.
              </p>
            </div>
          </section>

          <ContentSectionShell
            eyebrow="Catálogo completo"
            title="¿Prefieres buscar directamente entre todos los productos?"
            description="Accede al catálogo completo con búsqueda, filtros y ordenación para comparar opciones rápidamente."
          >
            <NuxtLink
              to="/productos"
              class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
            >
              Ver catálogo de productos
            </NuxtLink>
          </ContentSectionShell>

          <section aria-label="Guía de preparación de archivos">
            <GuideBanner
              title="¿No estás seguro de qué solución necesitas?"
              :cta="{ label: 'Hablar con un asesor', to: '/contacto' }"
              base-path="/img/ui/banners/como-preparar-archivos"
              :height="240"
              :full-bleed="true"
              :rounded="false"
            />
          </section>
        </div>
      </div>
    </template>
  </main>
</template>