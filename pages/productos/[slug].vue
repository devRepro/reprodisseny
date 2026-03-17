<script setup lang="ts">
  import { computed } from "vue";
  import type { ProductDetailDto } from "~/server/services/cms/catalog.service";
  import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
  import ProductHero from "@/components/marketing/product/Hero.vue";
  import GuideBanner from "@/components/marketing/GuideBanner.vue";
  import ProductDetails from "@/components/marketing/product/Details.vue";
  import ProductFaq from "@/components/marketing/product/Faq.vue";
  
  type ProductFormField = ProductDetailDto["formFields"][number];
  
  type NormalizedFormField = {
    name: string;
    label: string;
    type: string;
    required: boolean;
    options: string[];
  };
  
  type DetailsTab = {
    id: string;
    title: string;
    text: string;
  };
  
  const route = useRoute();
  const config = useRuntimeConfig();
  
  const containerClass = "container-wide";
  const contentNarrowClass = "mx-auto w-full max-w-[880px]";
  
  function safeDecode(value: unknown) {
    try {
      return decodeURIComponent(String(value ?? ""));
    } catch {
      return String(value ?? "");
    }
  }
  
  function normalizeSlug(value: unknown) {
    const raw = Array.isArray(value) ? value.join("/") : value;
    return safeDecode(raw).trim().replace(/^\/+|\/+$/g, "");
  }
  
  function isAssetLike(value: unknown) {
    const s = String(value ?? "").trim();
    return /^(img|_nuxt)\//i.test(s) || /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf)$/i.test(s);
  }
  
  function normalizeField(field: ProductFormField): NormalizedFormField {
    return {
      name: String(field?.name || "").trim(),
      label: String(field?.label || field?.name || "").trim(),
      type: String(field?.type || "text").trim().toLowerCase(),
      required: Boolean(field?.required),
      options: Array.isArray(field?.options)
        ? field.options.map((opt) => String(opt).trim()).filter(Boolean)
        : [],
    };
  }
  
  function isTextareaField(field: NormalizedFormField) {
    return ["textarea", "text-area"].includes(field.type);
  }
  
  function isSelectField(field: NormalizedFormField) {
    return ["select", "dropdown"].includes(field.type);
  }
  
  function isRadioField(field: NormalizedFormField) {
    return field.type === "radio";
  }
  
  function isCheckboxGroupField(field: NormalizedFormField) {
    return field.type === "checkbox" && field.options.length > 0;
  }
  
  function inputTypeOf(field: NormalizedFormField) {
    if (["email", "tel", "number", "date"].includes(field.type)) {
      return field.type;
    }
  
    return "text";
  }
  
  const slug = computed(() => normalizeSlug(route.params.slug));
  
  if (!slug.value || isAssetLike(slug.value)) {
    throw createError({
      statusCode: 404,
      message: `Ruta estática inválida para producto: ${slug.value || "vacía"}`,
    });
  }
  
  const asyncKey = computed(() => `cms:product:${slug.value}`);
  
  const {
    data: productData,
    pending,
    error,
  } = await useAsyncData<ProductDetailDto | null>(
    asyncKey,
    () => $fetch<ProductDetailDto>(`/api/cms/product/${encodeURIComponent(slug.value)}`),
    {
      server: true,
      default: () => null,
      watch: [slug],
    }
  );
  
  if (error.value) {
    throw createError({
      statusCode: (error.value as any)?.statusCode || 404,
      message: "Producto no encontrado",
    });
  }
  
  if (productData.value?.redirectTo && productData.value.redirectTo !== route.path) {
    await navigateTo(productData.value.redirectTo, {
      redirectCode: 301,
      replace: true,
    });
  }
  
  const product = computed(() => productData.value ?? null);
  
  const category = computed(() => {
    if (!product.value?.category) return null;
  
    return {
      slug: product.value.category.slug,
      path: product.value.category.path,
      title: product.value.category.title,
      nav: product.value.category.nav,
    };
  });
  
  const heroProduct = computed(() => {
    if (!product.value) return null;
  
    return {
      slug: product.value.slug,
      path: product.value.path,
      title: product.value.title,
      shortDescription: product.value.shortDescription || product.value.description || "",
      description: product.value.description || "",
      imageSrc: product.value.image?.src || null,
      image: product.value.image
        ? {
            src: product.value.image.src,
            alt: product.value.image.alt,
            width: product.value.image.width ?? null,
            height: product.value.image.height ?? null,
          }
        : null,
      seo: {
        canonical: product.value.seo?.canonical,
        metaTitle: product.value.seo?.title,
        metaDescription: product.value.seo?.description,
      },
    };
  });
  
  const customizationFields = computed<NormalizedFormField[]>(() => {
    return (product.value?.formFields ?? [])
      .map(normalizeField)
      .filter((field) => field.name && field.label);
  });
  
  const detailsTabs = computed<DetailsTab[]>(() => {
    const tabs: DetailsTab[] = [];
  
    if (product.value?.bodyMd) {
      tabs.push({
        id: "descripcion",
        title: "Descripción",
        text: product.value.bodyMd,
      });
    }
  
    return tabs;
  });
  
  const breadcrumbItems = computed(() => product.value?.breadcrumbs ?? []);
  const heroImage = computed(() => product.value?.image?.src || "");
  const hasCustomizationFields = computed(() => customizationFields.value.length > 0);
  const hasDetails = computed(() => detailsTabs.value.length > 0);
  
  /**
   * El catálogo actual no trae FAQs de producto.
   * Dejamos la sección preparada pero no visible hasta que exista dato real.
   */
  const faqs = computed<any[]>(() => []);
  
  const canonicalUrl = computed(() => {
    const base = config.public.siteUrl || "https://reprodisseny.com";
    const path = product.value?.seo?.canonical || product.value?.path || route.path;
    return new URL(path, base).toString();
  });
  
  const hreflangLinks = computed(() =>
    (product.value?.seo?.hreflang || []).map((item) => ({
      rel: "alternate" as const,
      hreflang: item.lang,
      href: item.url,
    }))
  );
  
  const schemaJson = computed(() => {
    const schema = product.value?.seo?.schema;
    return schema ? JSON.stringify(schema) : "";
  });
  
  useHead(() => ({
    link: [{ rel: "canonical", href: canonicalUrl.value }, ...hreflangLinks.value],
    script: schemaJson.value
      ? [
          {
            type: "application/ld+json",
            children: schemaJson.value,
          },
        ]
      : [],
  }));
  
  useSeoMeta({
    title: () =>
      product.value?.seo?.title ||
      (product.value?.title
        ? `${product.value.title} | Reprodisseny`
        : "Producto | Reprodisseny"),
    description: () =>
      product.value?.seo?.description ||
      product.value?.shortDescription ||
      product.value?.description ||
      "Detalles de producto",
    ogTitle: () => product.value?.seo?.title || product.value?.title || "Producto",
    ogDescription: () =>
      product.value?.seo?.description ||
      product.value?.shortDescription ||
      product.value?.description ||
      "Detalles de producto",
    ogImage: () => product.value?.seo?.image || heroImage.value || undefined,
    robots: () => product.value?.seo?.robots || "index,follow",
  });
  </script>
  
  <template>
    <main class="min-h-screen bg-background">
      <nav class="border-b border-border bg-background/60">
        <div :class="containerClass" class="py-4">
          <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
        </div>
      </nav>
  
      <div v-if="pending" class="flex min-h-[40vh] items-center justify-center">
        <div class="animate-pulse font-medium text-muted-foreground">
          Cargando detalles del producto...
        </div>
      </div>
  
      <template v-else-if="product && heroProduct">
        <section :class="containerClass" class="pt-8 md:pt-16">
          <ProductHero :product="heroProduct" :category="category" />
        </section>
  
        <section
          v-if="hasCustomizationFields"
          class="mt-16 md:mt-20"
          aria-labelledby="personalizacion-producto"
        >
          <div :class="containerClass">
            <div :class="contentNarrowClass">
              <div class="rounded-3xl border bg-card p-6 md:p-8">
                <h2 id="personalizacion-producto" class="text-center">
                  Configura tu producto
                </h2>
  
                <p class="mt-3 text-center text-muted-foreground">
                  Estos campos vienen del contrato del catálogo y deben alimentar
                  el formulario real de solicitud.
                </p>
  
                <!-- Temporal: fallback visible para no perder los campos -->
                <!-- Sustituir por tu componente real de formulario dinámico -->
                <div class="mt-8 grid gap-5 md:grid-cols-2">
                  <div
                    v-for="field in customizationFields"
                    :key="field.name"
                    class="space-y-2"
                  >
                    <label :for="field.name" class="block text-sm font-medium">
                      {{ field.label }}
                      <span v-if="field.required" class="text-destructive">*</span>
                    </label>
  
                    <select
                      v-if="isSelectField(field)"
                      :id="field.name"
                      class="w-full rounded-xl border bg-background px-4 py-3"
                    >
                      <option value="">Selecciona una opción</option>
                      <option
                        v-for="option in field.options"
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </option>
                    </select>
  
                    <textarea
                      v-else-if="isTextareaField(field)"
                      :id="field.name"
                      rows="4"
                      class="w-full rounded-xl border bg-background px-4 py-3"
                      :placeholder="field.label"
                    />
  
                    <div
                      v-else-if="isRadioField(field)"
                      class="space-y-2 rounded-xl border bg-background p-4"
                    >
                      <label
                        v-for="option in field.options"
                        :key="option"
                        class="flex items-center gap-3"
                      >
                        <input type="radio" :name="field.name" :value="option" />
                        <span>{{ option }}</span>
                      </label>
                    </div>
  
                    <div
                      v-else-if="isCheckboxGroupField(field)"
                      class="space-y-2 rounded-xl border bg-background p-4"
                    >
                      <label
                        v-for="option in field.options"
                        :key="option"
                        class="flex items-center gap-3"
                      >
                        <input type="checkbox" :name="field.name" :value="option" />
                        <span>{{ option }}</span>
                      </label>
                    </div>
  
                    <input
                      v-else
                      :id="field.name"
                      :type="inputTypeOf(field)"
                      class="w-full rounded-xl border bg-background px-4 py-3"
                      :placeholder="field.label"
                    />
                  </div>
                </div>
  
                <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <NuxtLink
                    :to="{ path: '/pedir-presupuesto', query: { producto: product.slug } }"
                    class="inline-flex rounded-full bg-foreground px-6 py-3 font-semibold text-background transition-opacity hover:opacity-90"
                  >
                    Solicitar presupuesto
                  </NuxtLink>
  
                  <NuxtLink
                    to="/contacto"
                    class="inline-flex rounded-full border px-6 py-3 font-semibold transition-colors hover:bg-muted"
                  >
                    Contactar con un asesor
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        <section class="mt-16 md:mt-24">
          <GuideBanner
            title="¿No estás seguro de las medidas?"
            :cta="{ label: 'Consultar Guía', to: '/como-preparar-archivos' }"
            base-path="/img/ui/banners/como-preparar-archivos"
            :height="240"
            :full-bleed="true"
            :rounded="false"
          />
        </section>
  
        <section
          v-if="hasDetails"
          id="detalles"
          class="mt-20 border-y border-border bg-muted/20 py-20 md:mt-32"
        >
          <div :class="containerClass">
            <div :class="contentNarrowClass">
              <h2 class="mb-10 text-center">Especificaciones técnicas</h2>
              <ProductDetails :tabs="detailsTabs" />
            </div>
          </div>
        </section>
  
        <section v-if="faqs.length" class="py-20">
          <div :class="containerClass">
            <div :class="contentNarrowClass">
              <h2 class="mb-8 text-center">Dudas frecuentes</h2>
              <ProductFaq :faqs="faqs" />
            </div>
          </div>
        </section>
  
        <section class="bg-brand-dark py-16 text-center text-brand-ink-light">
          <div class="container-wide">
            <h2>¿Tienes un proyecto especial?</h2>
            <p class="mx-auto mt-4 max-w-xl text-brand-ink-light/80">
              Si no encuentras lo que buscas en los detalles, contáctanos directamente y lo
              fabricaremos a medida.
            </p>
  
            <NuxtLink
              to="/contacto"
              class="mt-8 inline-flex rounded-full bg-background px-10 py-4 font-semibold text-foreground transition-colors hover:bg-brand-bg-2"
            >
              Contactar con un asesor
            </NuxtLink>
          </div>
        </section>
      </template>
  
      <div v-else class="container-wide py-16">
        <div class="rounded-2xl border bg-card p-8">
          <h1 class="text-2xl font-semibold">Producto no encontrado</h1>
          <p class="mt-3 text-muted-foreground">No hemos podido cargar este producto.</p>
        </div>
      </div>
    </main>
  </template>