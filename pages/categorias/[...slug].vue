<script setup lang="ts">
import { computed } from "vue";
import type { CategoryDetailPageDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import CategoryHero from "@/components/marketing/category/CategoryHero.vue";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import CategorySections from "@/components/marketing/category/CategorySections.vue";
import FaqAccordion from "@/components/shared/blocks/FaqAccordion.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";

const route = useRoute();
const config = useRuntimeConfig();
const nuxtApp = useNuxtApp();

const pageContainerClass = "container-content";
const pageFlowClass = "space-y-16 md:space-y-20";
const pageBottomSpacingClass = "pb-16 md:pb-24";
const sectionIntroClass = "max-w-3xl";

function safeDecode(value: unknown) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

function isAssetLike(value: unknown) {
  const s = String(value ?? "").trim();

  return (
    /^(img|_nuxt|_ipx)\//i.test(s) ||
    /(?:^|\/)_payload\.json(?:\?.*)?$/i.test(s) ||
    /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf|css|js|map|json|txt|xml|ico)$/i.test(s)
  );
}

function looksLikeProductPath(value: string) {
  return /^productos?\//i.test(String(value || "").trim());
}

function normalizePath(value?: string | null) {
  const v = String(value || "").trim();
  if (!v) return "/";
  return v.replace(/\/+$/, "") || "/";
}

function toAbsoluteUrl(value?: string | null) {
  if (!value) return undefined;

  const base = config.public.siteUrl || "https://reprodisseny.com";

  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
}

const slugParts = computed(() => {
  const raw = route.params.slug;

  return Array.isArray(raw)
    ? raw.map((s) => safeDecode(s).trim()).filter(Boolean)
    : String(safeDecode(raw ?? ""))
        .split(/[\/,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
});

const slug = computed(() => slugParts.value.join("/"));
const apiSlug = computed(() =>
  slugParts.value.map((part) => encodeURIComponent(part)).join("/")
);

if (!slug.value || isAssetLike(slug.value) || looksLikeProductPath(slug.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: "Categoría no encontrada",
    message: `Ruta inválida para categoría: ${slug.value}`,
  });
}

const { data, status, error } = await useAsyncData<CategoryDetailPageDto | null>(
  `cms:category:${slug.value}`,
  () =>
    $fetch(`/api/cms/category/${apiSlug.value}`, {
      query: {
        includeProducts: 1,
        productLimit: 24,
        includeChildren: 1,
        childLimit: 50,
      },
    }),
  {
    server: true,
    watch: [slug],
    default: () => null,
  }
);

if (
  data.value?.redirectTo &&
  normalizePath(data.value.redirectTo) !== normalizePath(route.path)
) {
  await navigateTo(data.value.redirectTo, {
    redirectCode: 301,
    replace: true,
  });
}

const fetchError = computed(() => (error.value as any) || null);
const category = computed(() => data.value as CategoryDetailPageDto | null);

const isPending = computed(() => status.value === "pending");
const showNotFound = computed(() => {
  return !isPending.value && !nuxtApp.isHydrating && !category.value;
});

const children = computed(() =>
  Array.isArray(category.value?.children) ? category.value.children : []
);

const products = computed(() =>
  Array.isArray(category.value?.products) ? category.value.products : []
);

const sections = computed(() =>
  Array.isArray(category.value?.sections) ? category.value.sections.filter(Boolean) : []
);

const faqs = computed(() =>
  Array.isArray(category.value?.faqs) ? category.value.faqs.filter(Boolean) : []
);

const hasSections = computed(() => sections.value.length > 0);
const hasFaqs = computed(() => faqs.value.length > 0);

const breadcrumbItems = computed(() =>
  Array.isArray(category.value?.breadcrumbs) ? category.value.breadcrumbs : []
);

const heroImage = computed(() => category.value?.image?.src || "");

const secondaryCta = computed(() => {
  if (products.value.length) {
    return { label: "Ver productos", to: "#productos" };
  }

  if (children.value.length) {
    return { label: "Explorar subcategorías", to: "#subcategorias" };
  }

  return undefined;
});

const detailsSection = computed(() => {
  return (
    sections.value.find((section) => {
      const token = [section?.key, section?.id, section?.title]
        .map((v) =>
          String(v || "")
            .trim()
            .toLowerCase()
        )
        .join(" ");

      return token.includes("details") || token.includes("detalles");
    }) || null
  );
});

const otherSections = computed(() =>
  sections.value.filter((section) => {
    const token = [section?.key, section?.id, section?.title]
      .map((v) =>
        String(v || "")
          .trim()
          .toLowerCase()
      )
      .join(" ");

    return !token.includes("details") && !token.includes("detalles");
  })
);

const hasOtherSections = computed(() => otherSections.value.length > 0);

const childrenGridClass = computed(() => {
  const count = children.value.length;

  if (count <= 1) return "mx-auto max-w-[420px] grid-cols-1";
  if (count === 2) return "mx-auto max-w-[920px] grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
});

const canonicalUrl = computed(() => {
  return (
    toAbsoluteUrl(category.value?.seo?.canonical || category.value?.path || route.path) ||
    toAbsoluteUrl("/") ||
    "https://reprodisseny.com"
  );
});

const ogImageUrl = computed(() => {
  return toAbsoluteUrl(category.value?.seo?.image || heroImage.value);
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
}));

useSeoMeta({
  title: () =>
    category.value?.seo?.title ||
    (category.value?.title
      ? `${category.value.title} | Reprodisseny`
      : "Categoría | Reprodisseny"),

  description: () =>
    category.value?.seo?.description ||
    category.value?.description ||
    "Categoría de productos",

  ogTitle: () => category.value?.seo?.title || category.value?.title || "Categoría",

  ogDescription: () =>
    category.value?.seo?.description ||
    category.value?.description ||
    "Categoría de productos",

  ogUrl: () => canonicalUrl.value,
  ogImage: () => ogImageUrl.value,
  robots: () => category.value?.seo?.robots || "index,follow",

  twitterCard: () => (ogImageUrl.value ? "summary_large_image" : "summary"),
  twitterTitle: () => category.value?.seo?.title || category.value?.title || "Categoría",
  twitterDescription: () =>
    category.value?.seo?.description ||
    category.value?.description ||
    "Categoría de productos",
  twitterImage: () => ogImageUrl.value,
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <div v-if="isPending && !category" class="container-content py-16 md:py-20">
      <div
        class="flex min-h-[30vh] items-center justify-center rounded-[28px] border border-border/70 bg-card/70"
      >
        <div class="animate-pulse text-body text-muted-foreground">
          Cargando categoría...
        </div>
      </div>
    </div>

    <div v-else-if="category">
      <div class="container-content pt-4 pb-4 md:pt-6 md:pb-6">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>

      <div :class="pageBottomSpacingClass">
        <div :class="pageFlowClass">
          <section :class="pageContainerClass" aria-label="Presentación de la categoría">
            <CategoryHero
              :category="category"
              :primary-cta="{ label: 'Pedir presupuesto', to: '/contacto' }"
              :secondary-cta="secondaryCta"
            />
          </section>

          <section
            v-if="children.length"
            id="subcategorias"
            :class="pageContainerClass"
            aria-label="Subcategorías"
          >
            <div class="space-y-8 md:space-y-10">
              <div :class="sectionIntroClass">
                <ContentSectionIntro
                  eyebrow="Subcategorías"
                  title="Explora esta línea de soluciones"
                  description="Accede directamente a las subcategorías relacionadas con esta área."
                />
              </div>

              <div :class="['grid auto-rows-fr gap-6', childrenGridClass]">
                <NuxtLink
                  v-for="child in children"
                  :key="child.slug || child.path"
                  :to="child.path"
                  class="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                >
                  <div class="aspect-[16/10] overflow-hidden bg-muted/25">
                    <img
                      v-if="child.image?.src"
                      :src="child.image.src"
                      :alt="child.image.alt || child.title || 'Subcategoría'"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div v-else class="h-full w-full bg-muted/40" />
                  </div>

                  <div class="flex flex-1 flex-col px-5 py-5">
                    <h3 class="text-[20px] font-semibold leading-[1.25] text-foreground">
                      {{ child.title }}
                    </h3>

                    <p
                      v-if="child.description"
                      class="mt-3 line-clamp-3 text-body-s leading-[1.6] text-foreground/72"
                    >
                      {{ child.description }}
                    </p>

                    <span
                      class="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-border bg-background px-4 py-2.5 text-body-s-bold text-foreground transition group-hover:border-primary/25 group-hover:text-primary"
                    >
                      Ver subcategoría
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </section>

          <CategoryProductsGrid
            :products="products"
            eyebrow="Productos relacionados"
            title="Productos de esta categoría"
            description="Explora formatos y soluciones relacionadas."
          />

          <ContentDetailsSection
            v-if="detailsSection"
            :section="detailsSection"
            eyebrow="Información de la categoría"
          />

          <ContentSectionShell
            v-if="hasOtherSections"
            eyebrow="Información de la categoría"
            title="Formatos, acabados y aplicaciones"
            description="Consulta los aspectos clave para comparar soluciones, materiales y opciones disponibles."
          >
            <CategorySections
              :sections="otherSections"
              :show-section-nav="otherSections.length > 1"
            />
          </ContentSectionShell>
          <ContentSectionShell
            v-if="hasFaqs"
            eyebrow="Ayuda y dudas comunes"
            title="Preguntas frecuentes"
            description="Respondemos las dudas más habituales sobre materiales, formatos, acabados y criterios de elección."
          >
            <FaqAccordion :items="faqs" />
          </ContentSectionShell>

          <section aria-label="Guía de preparación de archivos">
            <GuideBanner
              title="¿No estás seguro de las medidas?"
              :cta="{ label: 'Consultar guía', to: '/como-preparar-archivos' }"
              base-path="/img/ui/banners/como-preparar-archivos"
              :height="240"
              :full-bleed="true"
              :rounded="false"
            />
          </section>

          <ContentSectionShell
            eyebrow="Asesoramiento personalizado"
            title="¿Necesitas ayuda para elegir la mejor opción?"
            description="Te ayudamos a comparar materiales, formatos, acabados y aplicaciones para encontrar la solución más adecuada para tu proyecto."
          >
            <NuxtLink
              to="/contacto"
              class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
            >
              Contactar con un asesor
            </NuxtLink>
          </ContentSectionShell>
        </div>
      </div>
    </div>

    <div v-else-if="showNotFound" class="container-content py-16 md:py-20">
      <div class="rounded-[28px] border border-border/70 bg-card p-8 shadow-sm">
        <h1 class="text-[28px] font-semibold leading-[1.2] text-foreground">
          Categoría no encontrada
        </h1>
        <p class="mt-3 max-w-[60ch] text-body text-foreground/72">
          No hemos podido cargar esta categoría.
        </p>
        <p v-if="fetchError" class="mt-3 text-body-s text-destructive/80">
          {{
            fetchError?.data?.message ||
            fetchError?.message ||
            "El endpoint devolvió error."
          }}
        </p>
      </div>
    </div>
  </main>
</template>
