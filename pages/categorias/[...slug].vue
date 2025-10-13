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
  <main class="min-h-screen bg-background text-foreground">
    <!-- HERO SIEMPRE (usa fallbacks si doc aún no está) -->
    <SharedMenuCategories />
    <section class="max-w-7xl mx-auto px-6 py-8 md:py-10">
      <CategoryHero
        :title="heroTitle"
        :description="heroDesc"
        :image="heroImg"
        image-base="categorias"
        cta-text="Pedir presupuesto"
        cta-link="/contacto"
      />
    </section>

    <div class="h-px bg-border/60" />

    <!-- USPs para campañas -->
    <section class="max-w-7xl mx-auto px-6 py-6">
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <li class="p-4 rounded-xl border bg-card">🚚 Entrega 24-48h</li>
        <li class="p-4 rounded-xl border bg-card">🎯 Asesoramiento experto</li>
        <li class="p-4 rounded-xl border bg-card">💳 Pago seguro</li>
        <li class="p-4 rounded-xl border bg-card">🌱 Materiales sostenibles</li>
      </ul>
    </section>

    <!-- GRID PRODUCTOS -->
    <section class="max-w-7xl mx-auto px-6 py-8 md:py-10">
      <h2 class="sr-only">Productos de {{ heroTitle }}</h2>

      <div v-if="pending" class="text-muted-foreground">Cargando productos…</div>

      <div v-else-if="error" class="text-red-500 bg-red-500/10 p-4 rounded-lg">
        <strong>Error:</strong>
        {{ error?.message || "No se pudieron cargar los productos." }}
      </div>

      <div v-else-if="productos.length === 0" class="text-sm text-muted-foreground">
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
          <NuxtLink :to="p.path || `/productos/${p.slug || p._id}`" class="block">
            <div class="aspect-[4/3] w-full overflow-hidden bg-muted">
              <NuxtImg
                :src="productImgSrc(p)"
                :alt="p.alt || p.title || 'Producto'"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                width="600"
                height="450"
                format="webp"
                loading="lazy"
                class="h-full w-full object-cover object-center transition-transform group-hover:scale-[1.03]"
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
          </NuxtLink>
        </article>
      </div>

      <!-- Paginación -->
      <nav
        v-if="totalPages > 1"
        class="mt-8 flex items-center gap-2 justify-center"
        aria-label="Paginación"
      >
        <button
          class="px-3 py-2 border rounded-md"
          :disabled="currentPage === 1"
          @click="setPage(currentPage - 1)"
        >
          ← Anterior
        </button>
        <span class="text-sm text-muted-foreground"
          >Página {{ currentPage }} / {{ totalPages }}</span
        >
        <button
          class="px-3 py-2 border rounded-md"
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
        >
          Siguiente →
        </button>
      </nav>
    </section>

    <!-- CTA final -->
    <section class="bg-primary/5 border-t border-b">
      <div
        class="max-w-7xl mx-auto px-6 py-10 md:flex md:items-center md:justify-between gap-6"
      >
        <div>
          <h2 class="text-2xl font-semibold">¿Necesitas ayuda con tu proyecto?</h2>
          <p class="text-muted-foreground mt-1">
            Te asesoramos sin compromiso en minutos.
          </p>
        </div>
        <NuxtLink
          to="/contacto"
          class="mt-4 md:mt-0 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Pedir presupuesto
        </NuxtLink>
      </div>
    </section>

    <section v-if="hasFaqs" class="max-w-4xl mx-auto px-6 pb-12">
      <h2 class="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
      <!-- Si te da guerra SSR/Hydration por el UI accordion, envuélvelo en <ClientOnly> -->
      <!-- <ClientOnly> -->
      <SharedFaqAccordion :items="doc?.faqs || []" />
      <!-- </ClientOnly> -->
    </section>
  </main>
</template>
