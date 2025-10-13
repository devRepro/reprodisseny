<!-- pages/categorias/[...slug].vue -->
<script setup lang="ts">
import { computed, onMounted } from "vue";
import CategoryHero from "@/components/category/Hero.vue";

const route = useRoute();
const router = useRouter();

const slugParts = computed<string[]>(() => {
  const s = route.params.slug;
  return Array.isArray(s) ? s : s ? [s] : [];
});
const categorySlug = computed(() => slugParts.value[0] || null);
const categoryPath = computed(() =>
  ["/categorias", ...slugParts.value].join("/").replace(/\/+$/, "")
);

// ✅ Usa SOLO una. Recomiendo queryCollection (respeta schema).
const { data: doc } = await useAsyncData(
  () => `cat:doc:${categoryPath.value}`,
  () => queryCollection("categorias").path(categoryPath.value).first(),
  { server: true }
);

// ❗️NO declares "doc" otra vez más abajo. Quita cualquier duplicado.

// -------- Productos --------
const pageQuery = computed(() => ({
  page: Number(route.query.page ?? 1),
  limit: Number(route.query.limit ?? 24),
  sort: String(route.query.sort ?? "order"),
  direction: String(route.query.direction ?? "ASC"),
  ...(route.query.q ? { q: String(route.query.q) } : {}),
}));

const { data: payload, pending, error } = await useAsyncData(
  () => `cat:products:${categorySlug.value}:${JSON.stringify(pageQuery.value)}`,
  () =>
    categorySlug.value
      ? $fetch(`/api/categorias/${categorySlug.value}/products`, {
          query: pageQuery.value,
        })
      : Promise.resolve({
          items: [],
          page: 1,
          pages: 0,
          total: 0,
          limit: pageQuery.value.limit,
        }),
  { server: true }
);


const sortOption = computed({
  get() {
    return `${pageQuery.value.sort}:${pageQuery.value.direction}`;
  },
  set(value: string) {
    const [sort, direction] = value.split(':');
    router.push({ 
      query: { 
        ...route.query,
        page: 1, // Resetea a la página 1 al cambiar el orden
        sort, 
        direction 
      } 
    });
  }
});

const sortOptions = [
  { label: 'Recomendados', value: 'order:ASC' },
  { label: 'Nombre: A-Z', value: 'title:ASC' },
  { label: 'Nombre: Z-A', value: 'title:DESC' },
];
const productos = computed(() => payload.value?.items ?? []);
const totalPages = computed(() => payload.value?.pages ?? 0);
const currentPage = computed(() => payload.value?.page ?? 1);
function setPage(n: number) {
  const target = Math.min(Math.max(n, 1), totalPages.value || 1);
  router.push({ query: { ...route.query, page: target } });
}

// -------- Imagen producto (debe estar a nivel de módulo) --------
function productImgSrc(p: any): string {
  const img = p?.image;
  return typeof img === "string" ? img : img?.src ?? "/img/placeholders/productos.webp";
}

// -------- Hero / SEO / FAQs (como ya lo tenías) --------
const heroTitle = computed(
  () =>
    doc.value?.title ??
    (categorySlug.value ? categorySlug.value.replace(/-/g, " ") : "Categoría")
);
const heroDesc = computed(() => doc.value?.description ?? "");
const heroImg = computed(() => {
  const img = doc.value?.image;
  return typeof img === "string" ? img : img?.src ?? "/img/placeholders/categoria.webp";
});

const reqUrl = useRequestURL();
const canonical = computed(() => new URL(route.fullPath, `${reqUrl.origin}`).toString());
const seoTitle = computed(() => doc.value?.metaTitle ?? heroTitle.value);
const seoDesc = computed(() =>
  (doc.value?.metaDescription ?? heroDesc.value ?? "Impresión profesional.")
    .toString()
    .slice(0, 160)
);
const robots = computed(() =>
  doc.value?.hidden ? "noindex, nofollow" : "index, follow"
);

useSeoMeta({
  title: seoTitle,
  description: seoDesc,
  ogTitle: seoTitle,
  ogDescription: seoDesc,
  ogType: "website",
  ogUrl: canonical,
  ogImage: heroImg,
  twitterCard: "summary_large_image",
  twitterTitle: seoTitle,
  twitterDescription: seoDesc,
  robots,
});
useHead({ link: [{ rel: "canonical", href: canonical.value }] });

const hasFaqs = computed(
  () => Array.isArray(doc.value?.faqs) && doc.value!.faqs.length > 0
);

onMounted(() => {
  console.log("FAQS EN DOC =>", doc.value?.faqs);
  console.log("productImgSrc exists?", typeof productImgSrc); // debería ser "function"
});
</script>

<template>
  <main class="bg-background text-foreground">
    <SharedMenuCategories />

    <section class="border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 md:gap-12 items-center py-12 md:py-16">
        <div class="text-center lg:text-left">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {{ heroTitle }}
          </h1>
          <p v-if="heroDesc" class="mt-4 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
            {{ heroDesc }}
          </p>
          <div class="mt-8 flex gap-4 justify-center lg:justify-start">
            <Button size="lg" as-child>
              <NuxtLink to="/contacto">Pedir Presupuesto</NuxtLink>
            </Button>
            <Button size="lg" variant="outline" as-child>
              <NuxtLink to="#productos">Ver Productos</NuxtLink>
            </Button>
          </div>
        </div>

        <div class="w-full h-64 lg:h-auto lg:aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
          <NuxtImg
            :src="heroImg"
            :alt="`Imagen representativa de ${heroTitle}`"
            class="w-full h-full object-cover"
            width="800"
            height="600"
            format="webp"
            fetchpriority="high"
          />
        </div>
      </div>
    </section>
    
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm font-medium">
        <li class="flex items-center gap-3 p-4 rounded-lg border bg-card/50">
          <span class="text-xl">🚚</span> <span>Entrega rápida 24-48h</span>
        </li>
        <li class="flex items-center gap-3 p-4 rounded-lg border bg-card/50">
          <span class="text-xl">🎯</span> <span>Asesoramiento experto</span>
        </li>
        <li class="flex items-center gap-3 p-4 rounded-lg border bg-card/50">
          <span class="text-xl">💳</span> <span>Pago 100% seguro</span>
        </li>
        <li class="flex items-center gap-3 p-4 rounded-lg border bg-card/50">
          <span class="text-xl">🌱</span> <span>Materiales sostenibles</span>
        </li>
      </ul>
    </section>

    <section id="productos" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
  <h2 class="text-3xl font-bold tracking-tight">
    Productos de {{ heroTitle }}
  </h2>
  
  <div v-if="productos.length > 0" class="flex items-center gap-2">
    <label for="sort-select" class="text-sm font-medium text-muted-foreground">Ordenar por:</label>
    <Select v-model="sortOption">
      <SelectTrigger id="sort-select" class="w-[180px]">
        <SelectValue placeholder="Seleccionar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
  </div>
        </div>
      
      <div v-if="pending" class="text-center py-12 text-muted-foreground">Cargando productos…</div>
      <div v-else-if="error" class="bg-destructive/10 text-destructive p-4 rounded-lg">
        <strong>Error:</strong> {{ error?.message || "No se pudieron cargar los productos." }}
      </div>
      <div v-else-if="productos.length === 0" class="text-center py-12 text-muted-foreground">
        No se encontraron productos en esta categoría.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <article
          v-for="p in productos"
          :key="p._id || p.path"
          class="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <NuxtLink :to="p.path || `/productos/${p.slug || p._id}`" class="block">
            <div class="aspect-[4/3] w-full overflow-hidden bg-muted">
              <NuxtImg
                :src="productImgSrc(p)"
                :alt="p.alt || p.title || 'Producto'"
                sizes="100vw sm:50vw md:33vw lg:25vw"
                width="600"
                height="450"
                format="webp"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-base leading-snug truncate">{{ p.title }}</h3>
              <p v-if="p.description" class="mt-1 text-sm text-muted-foreground line-clamp-2">{{ p.description }}</p>
              <div class="mt-4">
                <span class="text-sm font-semibold text-primary">Ver producto &rarr;</span>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <nav v-if="totalPages > 1" class="mt-12 flex justify-center" aria-label="Paginación">
        <ul class="flex items-center -space-x-px h-10 text-base">
          <li>
            <button @click="setPage(currentPage - 1)" :disabled="currentPage === 1" class="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-muted-foreground bg-card border border-border rounded-s-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
              &larr; Anterior
            </button>
          </li>
          <li>
            <span class="flex items-center justify-center px-4 h-10 leading-tight text-muted-foreground bg-card border-y border-border">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
          </li>
          <li>
            <button @click="setPage(currentPage + 1)" :disabled="currentPage === totalPages" class="flex items-center justify-center px-4 h-10 leading-tight text-muted-foreground bg-card border border-border rounded-e-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
              Siguiente &rarr;
            </button>
          </li>
        </ul>
      </nav>
    </section>
    
    <section class="bg-muted/50 border-t">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 class="text-3xl font-bold tracking-tight">¿No encuentras lo que buscas?</h2>
        <p class="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Nuestro equipo de expertos está listo para asesorarte y encontrar la solución de impresión perfecta para tu proyecto.
        </p>
        <div class="mt-8">
          <Button size="lg" as-child>
            <NuxtLink to="/contacto">Contactar Ahora</NuxtLink>
          </Button>
        </div>
      </div>
    </section>

    <section v-if="hasFaqs" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold tracking-tight">Preguntas Frecuentes</h2>
      </div>
      <ClientOnly>
        <SharedFaqAccordion :items="doc?.faqs || []" />
      </ClientOnly>
    </section>
  </main>
</template>