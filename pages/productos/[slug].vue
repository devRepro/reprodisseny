<!-- pages/productos/[slug].vue -->
<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const slug = String(route.params.slug || "");

const { data: product, pending, error } = await useFetch(`/api/cms/product/${slug}`, {
  server: true,
  key: `cms:product:${slug}`,
});

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
}

const p = computed(() => product.value as any);

// ✅ Canonical / redirección a URL canónica (SEO-safe)
if (process.server && route.path !== p.value.path) {
  await navigateTo(p.value.path, { redirectCode: 301 });
}

// JSON-LD (schema)
const jsonLd = computed(() => {
  const schema = p.value?.seo?.schema;
  if (!schema) return null;
  return JSON.stringify({ "@context": "https://schema.org", ...schema });
});

// SEO
useSeoMeta({
  title: p.value?.seo?.metaTitle || p.value?.title,
  description: p.value?.seo?.metaDescription || p.value?.shortDescription || "",
  ogTitle: p.value?.seo?.metaTitle || p.value?.title,
  ogDescription: p.value?.seo?.metaDescription || p.value?.shortDescription || "",
  ogImage: p.value?.seo?.ogImage?.src || p.value?.image?.src || "",
});

useHead(() => ({
  link: p.value?.seo?.canonical
    ? [{ rel: "canonical", href: p.value.seo.canonical }]
    : [],
  script: jsonLd.value
    ? [{ type: "application/ld+json", innerHTML: jsonLd.value }]
    : [],
}));
</script>

<template>
  <main class="bg-background text-foreground">
    <SharedMenuCategories />
    <SharedBreadCrumbs />

    <div v-if="pending" class="flex items-center justify-center h-screen">
      <p class="text-muted-foreground">Cargando producto…</p>
    </div>

    <div v-else-if="error || !p" class="flex items-center justify-center h-screen">
      <p class="text-destructive">Error: Producto no encontrado.</p>
    </div>

    <article v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="grid lg:grid-cols-5 lg:gap-x-12">
        <div class="lg:col-span-3">
          <div class="mb-8">
            <div class="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted border">
              <NuxtImg
                v-if="p.image?.src"
                :src="p.image.src"
                :alt="p.image.alt || p.title"
                class="h-full w-full object-cover"
                :width="p.image.width || 800"
                :height="p.image.height || 600"
                format="webp"
                fetchpriority="high"
              />
            </div>
          </div>

          <div class="mb-8">
            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">
              {{ p.title }}
            </h1>
            <p v-if="p.shortDescription" class="mt-4 text-lg text-muted-foreground">
              {{ p.shortDescription }}
            </p>
          </div>

          <!-- ✅ Body: con SharePoint ya NO hay ContentRenderer -->
          <!-- V1: muestra bodyMd como texto (rápido). -->
          <!-- V2 (recomendado): genera bodyHtml en cms:sync y usa v-html. -->
          <section v-if="p.bodyHtml" class="py-8">
            <div
              class="prose prose-lg max-w-none prose-p:text-muted-foreground prose-h2:font-bold"
              v-html="p.bodyHtml"
            />
          </section>

          <section v-else-if="p.bodyMd" class="py-8">
            <pre class="whitespace-pre-wrap text-muted-foreground">{{ p.bodyMd }}</pre>
          </section>
        </div>

        <div class="lg:col-span-2 mt-10 lg:mt-0">
          <div class="lg:sticky lg:top-24">
            <div class="border rounded-2xl bg-card p-6 shadow-sm">
              <h2 class="text-2xl font-bold mb-1">
                Presupuesto para {{ p.title }}
              </h2>
              <p class="text-muted-foreground mb-6 text-sm">
                Rellena los datos y te contactaremos en minutos.
              </p>

              <ClientOnly>
                <SharedFormsLead
                  :producto="p.title"
                  :extra-fields="p.formFields ?? []"
                  :product-data="p"
                />
                <template #fallback>
                  <div class="w-full h-48 flex items-center justify-center">
                    <p class="text-muted-foreground text-sm">Cargando formulario...</p>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </article>
  </main>
</template>

