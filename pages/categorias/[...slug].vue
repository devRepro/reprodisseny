<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

// slug seguro para [...slug]
const slug = computed(() =>
  Array.isArray(route.params.slug)
    ? route.params.slug.join("/")
    : String(route.params.slug || "")
);

const query = computed(() => ({
  page: Number(route.query.page ?? 1),
  limit: Number(route.query.limit ?? 24),
  sort: String(route.query.sort ?? "order"),
  direction: String(route.query.direction ?? "ASC"),
  q: String(route.query.q ?? ""),
}));

const key = computed(() => `cat:products:${slug.value}:${JSON.stringify(query.value)}`);

// 👈 OJO: data: payload + await + default
const { data: payload, pending, error } = await useAsyncData(
  key.value,
  () => $fetch(`/api/categorias/${slug.value}/products`, { params: query.value }),
  { default: () => ({ items: [], page: 1, pages: 0, total: 0, limit: 24 }) }
);

// Derivadas seguras
const productos = computed(() => payload.value.items);
const totalPages = computed(() => payload.value.pages);
const currentPage = computed(() => payload.value.page);
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <!-- ===== HERO ===== -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0">
        <img
          src="/img/placeholders/mockup.webp"
          :alt="cat?.alt || ''"
          class="h-full w-full object-cover object-center opacity-70"
          loading="eager"
          fetchpriority="high"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20"
        ></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div class="max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-semibold tracking-tight text-white"></h1>

          <div class="mt-6 flex flex-wrap gap-3">
            <Button class="h-11 px-5" @click="$router.push('/contacto')"
              >Pide presupuesto</Button
            >
            <Button
              variant="outline"
              class="h-11 px-5 border-white/60 text-white hover:bg-white/10"
              @click="$router.push('/plantillas')"
            >
              Descargar plantillas
            </Button>
          </div>
        </div>
      </div>
    </section>

    <Separator class="bg-border/60" />

    <!-- ===== GRID DE PRODUCTOS ===== -->
    <section class="max-w-7xl mx-auto px-6 py-8 md:py-10">
      <div v-if="pending" class="text-muted-foreground">Cargando productos…</div>

      <!-- ✨ CORRECCIÓN: Ahora `error` está definido y este bloque funcionará -->
      <div v-else-if="error" class="text-red-500 bg-red-500/10 p-4 rounded-lg">
        <strong>Error:</strong>
        {{ error.message || "No se pudieron cargar los productos." }}
      </div>

      <div v-else-if="!productos?.length" class="text-sm text-muted-foreground">
        No hay productos en esta categoría.
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <article
          v-for="p in productos"
          :key="p._id || p.path || p.slug"
          class="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
        >
          <a :href="p.path || `/productos/${p.slug}`" class="block">
            <div class="aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                :src="p.image"
                :alt="p.alt || p.title"
                class="h-full w-full object-cover object-center transition-transform group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div class="p-4">
              <h3 class="line-clamp-2 text-base font-medium">{{ p.title }}</h3>
              <p
                v-if="p.description"
                class="mt-1 line-clamp-2 text-sm text-muted-foreground"
              >
                {{ p.description }}
              </p>
              <div class="mt-3 text-sm font-medium text-primary">Ver producto →</div>
            </div>
          </a>
        </article>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center gap-2 justify-center">
        <Button
          variant="outline"
          :disabled="currentPage === 1"
          @click="page = currentPage - 1"
        >
          ← Anterior
        </Button>
        <span class="text-sm text-muted-foreground"
          >Página {{ currentPage }} / {{ totalPages }}</span
        >
        <Button
          variant="outline"
          :disabled="currentPage === totalPages"
          @click="page = currentPage + 1"
        >
          Siguiente →
        </Button>
      </div>
    </section>

    <Separator class="bg-border/60" />

    <!-- ===== COPY SEO (cuerpo del .md) ===== -->
    <section class="max-w-7xl mx-auto px-6 pb-6 md:pb-10">
      <div class="prose prose-invert max-w-none prose-p:leading-relaxed">
        <ContentRenderer v-if="cat && cat.body" :value="cat" />
        <template v-else>
          <h2 class="text-xl md:text-2xl font-semibold tracking-tight">
            Impresión de para empresa
          </h2>
          <p>
            Producción ágil y control de calidad. Materiales certificados y opciones
            sostenibles. Asesoramiento técnico para que tu pieza rinda en uso real.
          </p>
        </template>
      </div>
    </section>
  </main>
</template>
