<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

import { useCategoriaProductos } from '@/composables/useCategoriaProductos';
import SharedGridDisplay from "@/components/shared/grid/Display.vue"; // import explícito evita dudas de auto-import
// ===== Parámetros =====
const route = useRoute();
const router = useRouter();
const slug = computed(() =>
  (Array.isArray(route.params.slug) ? route.params.slug[0] : String(route.params.slug || ""))
);

// ===== Categoría por slug =====
const { data: catData } = await useAsyncData(
  () => `categoria:${slug.value}`,
  async () => {
    // @ts-expect-error auto-import (Nuxt Content)
    const rows = await queryCollection("categorias").where("slug","=",slug.value).limit(1).all();
    return rows?.[0] || null;
  },
  { server: true, default: () => null }
);

const cat = computed(() => catData.value);
const heroTitle = computed(() => cat.value?.title || "Categoría");
const heroDesc  = computed(() => cat.value?.description || "");
const heroImg   = computed(() =>
  cat.value?.image?.startsWith("http") ? cat.value.image : `/img/productos/${cat.value?.image || "categorias-default.jpg"}`
);
const pagePath  = computed(() => cat.value?.path || `/categorias/${slug.value}`);

// ===== Controles (sin librerías) -> URL query =====
const qParams = computed({
  get: () => new URLSearchParams(route.query as any),
  set: (sp: URLSearchParams) => router.replace({ query: Object.fromEntries(sp) })
});
const search = computed({
  get: () => qParams.value.get("q") || "",
  set: (v: string) => { const sp = new URLSearchParams(qParams.value); v ? sp.set("q", v) : sp.delete("q"); qParams.value = sp; }
});
const sort = computed<"order" | "title" | "price">({
  get: () => (qParams.value.get("sort") as any) || "order",
  set: (v) => { const sp = new URLSearchParams(qParams.value); sp.set("sort", v); qParams.value = sp; }
});
const page = computed({
  get: () => Math.max(1, Number(qParams.value.get("page") || 1)),
  set: (n: number) => { const sp = new URLSearchParams(qParams.value); sp.set("page", String(Math.max(1, n))); qParams.value = sp; }
});

// ===== Productos (usa TU composable) =====
// Nota: los composables en /composables se auto-importan en Nuxt, pero puedes importar explícito si lo prefieres. :contentReference[oaicite:1]{index=1}
const { data: payload, pending: loading } = await useCategoriaProductos({
  limit: 24,
  page: page.value,
  sort: sort.value,            // "order" | "title" | "price"
  direction: "ASC",
  includeSubcategory: true,
  q: search                    // el composable filtra en cliente si 'q' tiene valor
});

const productos   = computed(() => payload.value?.items || []);
const totalPages  = computed(() => payload.value?.pages || 0);
const currentPage = computed(() => payload.value?.page || 1);


</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <!-- ===== HERO ===== -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0">
        <img :src="heroImg" :alt="cat?.alt || heroTitle" class="h-full w-full object-cover object-center opacity-70" loading="eager" fetchpriority="high" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div class="max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-semibold tracking-tight text-white">{{ heroTitle }}</h1>
          <p v-if="heroDesc" class="mt-3 text-white/90 text-base md:text-lg">{{ heroDesc }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <Button class="h-11 px-5" @click="$router.push('/contacto')">Pide presupuesto</Button>
            <Button variant="outline" class="h-11 px-5 border-white/60 text-white hover:bg-white/10" @click="$router.push('/plantillas')">
              Descargar plantillas
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CONTROLES ===== 
    <section class="max-w-7xl mx-auto px-6 py-6 md:py-8">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div class="flex-1 flex items-center gap-3">
          <Input v-model="search" placeholder="Buscar en la categoría…" class="h-11" />
          <select v-model="sort" class="h-11 rounded-md border bg-background px-3">
            <option value="order">Relevancia</option>
            <option value="title">A–Z</option>
            <option value="price">Precio</option>
          </select>
        </div>
      </div>
    </section>-->

    <Separator class="bg-border/60" />

    
    <section class="max-w-7xl mx-auto px-6 py-8 md:py-10">
  <div v-if="loading" class="text-muted-foreground">Cargando productos…</div>

  <div v-else-if="error" class="text-red-500">
    Error: {{ error.message || 'No se pudieron cargar los productos.' }}
  </div>

  <div v-else-if="!productos?.length" class="text-sm text-muted-foreground">
    No hay productos en esta categoría.
  </div>

  <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    <article
      v-for="p in productos"
      :key="p.id || p.slug"
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
          <p v-if="p.excerpt || p.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {{ p.excerpt || p.description }}
          </p>
          <div class="mt-3 text-sm font-medium text-primary">Ver producto →</div>
        </div>
      </a>
    </article>
  </div>

  <div v-if="totalPages > 1" class="mt-8 flex items-center gap-2 justify-center">
    <button class="px-3 py-2 rounded border" :disabled="currentPage === 1" @click="page = currentPage - 1">
      ← Anterior
    </button>
    <span class="text-sm">Página {{ currentPage }} / {{ totalPages }}</span>
    <button class="px-3 py-2 rounded border" :disabled="currentPage === totalPages" @click="page = currentPage + 1">
      Siguiente →
    </button>
  </div>
</section>



    <Separator class="bg-border/60" />

    <!-- ===== GRID DE PRODUCTOS (tu Display.vue) ===== -->
    <section class="max-w-7xl mx-auto px-6 py-8 md:py-10">
      <div v-if="loading" class="text-muted-foreground">Cargando productos…</div>
      <div v-else>
        <SharedGridDisplay
          :items="productos"
          :key-fn="(p:any) => p.id || p.slug"
          :title-fn="(p:any) => p.title"
          :link-fn="(p:any) => p.path || `/productos/${p.slug}`"
          :image-fn="(p:any) => p.image"
          :excerpt-fn="(p:any) => p.excerpt || p.description"
        > 
        </SharedGridDisplay>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center gap-2 justify-center">
          <button class="px-3 py-2 rounded border"
                  :disabled="currentPage === 1"
                  @click="page = currentPage - 1">
            ← Anterior
          </button>
          <span class="text-sm">Página {{ currentPage }} / {{ totalPages }}</span>
          <button class="px-3 py-2 rounded border"
                  :disabled="currentPage === totalPages"
                  @click="page = currentPage + 1">
            Siguiente →
          </button>
        </div>
      </div>
    </section>

    <!-- ===== COPY SEO (cuerpo del .md) ===== -->
    <section class="max-w-7xl mx-auto px-6 pb-6 md:pb-10">
      <div class="prose prose-invert max-w-none prose-p:leading-relaxed">
        <ContentRenderer v-if="cat && cat.body" :value="cat" />
        <template v-else>
          <h2 class="text-xl md:text-2xl font-semibold tracking-tight">Impresión de {{ heroTitle }} para empresa</h2>
          <p>Producción ágil y control de calidad. Materiales certificados y opciones sostenibles. Asesoramiento técnico para que tu pieza rinda en uso real.</p>
        </template>
      </div>
    </section>

    <Separator class="bg-border/60" />

    <!-- ===== FAQ ===== 
    <section class="max-w-5xl mx-auto px-6 py-10 md:py-14">
      <h2 class="text-2xl font-semibold tracking-tight mb-4">Preguntas frecuentes</h2>
      <Accordion type="single" collapsible class="w-full">
        <AccordionItem v-for="(item, i) in faqs" :key="i" :value="`faq-${i}`">
          <AccordionTrigger>{{ item.question }}</AccordionTrigger>
          <AccordionContent>{{ item.answer }}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>    -->  
  </main>
</template>
