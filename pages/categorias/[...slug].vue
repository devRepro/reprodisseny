<script setup lang="ts">
import { computed } from "vue";
import type { CategoryDetailPageDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import CategoryHero from "@/components/marketing/category/CategoryHero.vue";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import ContentSectionsRenderer from "@/components/marketing/content/ContentSectionsRenderer.vue";
import FaqAccordion from "@/components/shared/blocks/FaqAccordion.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";
import ContentProcessSteps, {
  type ProcessStepItem,
} from "@/components/marketing/content/ContentProcessSteps.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";

type CategoryHowWeWork = {
  title?: string;
  description?: string;
  steps?: ProcessStepItem[];
};

type GalleryImage = {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number | null;
  height?: number | null;
};

const route = useRoute();
const config = useRuntimeConfig();
const nuxtApp = useNuxtApp();


const PRODUCTS_PER_PAGE = 12;

function parsePageQuery(value: unknown): number {
  const raw = Array.isArray(value)
    ? value[0]
    : value;

  if (
    raw === undefined ||
    raw === null ||
    raw === ""
  ) {
    return 1;
  }

  const normalized = String(raw).trim();

  if (!/^[1-9]\d*$/.test(normalized)) {
    return 0;
  }

  const parsed = Number(normalized);

  return Number.isSafeInteger(parsed)
    ? parsed
    : 0;
}

const currentPage = computed(() =>
  parsePageQuery(route.query.page),
);

if (currentPage.value === 0) {
  throw createError({
    statusCode: 404,
    statusMessage: "Página no encontrada",
  });
}

const pageContainerClass = "container-content";
const pageFlowClass = "space-y-0";
const pageBottomSpacingClass = "pb-8 md:pb-10";
const sectionIntroClass = "max-w-2xl";
const sectionSpacingClass = "mt-10 md:mt-12";
const sectionSpacingCompactClass = "mt-8 md:mt-10";

function safeDecode(value: unknown) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

function normalizeGalleryImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((image) => image && typeof image === "object")
    .map((image) => {
      const source = image as GalleryImage;

      return {
        src: String(source.src || "").trim(),
        alt: String(source.alt || "").trim(),
        caption: String(source.caption || "").trim(),
        width: typeof source.width === "number" ? source.width : null,
        height: typeof source.height === "number" ? source.height : null,
      };
    })
    .filter((image) => image.src);
}

const fallbackProcessSteps: ProcessStepItem[] = [
  {
    label: "01",
    title: "Cuéntanos tu proyecto",
    description:
      "Analizamos el uso, el soporte, el formato y las necesidades del trabajo para orientarte desde el inicio.",
  },
  {
    label: "02",
    title: "Te asesoramos",
    description:
      "Te ayudamos a elegir materiales, medidas, acabados y la solución más adecuada según tu objetivo y presupuesto.",
  },
  {
    label: "03",
    title: "Producción",
    description:
      "Preparamos el trabajo, revisamos los detalles técnicos y producimos con control de calidad para asegurar un buen resultado.",
  },
  {
    label: "04",
    title: "Entrega",
    description:
      "Recibes el pedido listo para instalar, distribuir o utilizar, con acompañamiento durante todo el proceso.",
  },
];

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

const { data, status, pending, error } =
  await useAsyncData<CategoryDetailPageDto | null>(
    `cms:category:${slug.value}`,
    () =>
      $fetch(`/api/cms/category/${apiSlug.value}`, {
       query: {
  includeProducts: 0,
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


const children = computed(() =>
  Array.isArray(category.value?.children) ? category.value.children : []
);


const detailGallery = computed<GalleryImage[]>(() => {
  const items = normalizeGalleryImages((category.value as any)?.detailGallery);
  return items.slice(0, 3);
});

const categoryProductsSlug = computed(() =>
  String(
    category.value?.slug ||
      slugParts.value.at(-1) ||
      "",
  ).trim(),
);

const {
  items: products,
  meta: productsMeta,
  pending: productsPending,
  error: productsError,
} = await useCategoriaProductos({
  categorySlug: categoryProductsSlug,
  page: currentPage,
  limit: PRODUCTS_PER_PAGE,
  sort: "order",
  direction: "ASC",
  includeSubcategory: true,
});

if (productsError.value) {
  const productFetchError = productsError.value as {
    statusCode?: number;
    status?: number;
    statusMessage?: string;
    message?: string;
    data?: {
      message?: string;
    };
  };

  throw createError({
    statusCode:
      productFetchError.statusCode ||
      productFetchError.status ||
      404,
    statusMessage:
      productFetchError.statusMessage ||
      "Página no encontrada",
    message:
      productFetchError.data?.message ||
      productFetchError.message ||
      "No se pudieron cargar los productos",
  });
}

const galleryImages = computed<GalleryImage[]>(() => {
  const fromGalleryImages = normalizeGalleryImages(
    (category.value as any)?.galleryImages
  );

  if (fromGalleryImages.length) return fromGalleryImages;

  return detailGallery.value;
});

const keywordPills = computed(() => category.value?.keywordPills ?? []);

const isPending = computed(() => status.value === "pending");

const showNotFound = computed(() => {
  return !isPending.value && !nuxtApp.isHydrating && !category.value;
});

const sections = computed(() =>
  Array.isArray(category.value?.sections)
    ? category.value.sections.filter(Boolean)
    : []
);

const hasSections = computed(() => sections.value.length > 0);

const faqs = computed(() =>
  Array.isArray(category.value?.faqs) ? category.value.faqs.filter(Boolean) : []
);

const hasFaqs = computed(() => faqs.value.length > 0);

const howWeWork = computed<CategoryHowWeWork | null>(() => {
  const value = category.value as
    | (CategoryDetailPageDto & { howWeWork?: CategoryHowWeWork })
    | null;

  return value?.howWeWork ?? null;
});

const processTitle = computed(
  () => howWeWork.value?.title?.trim() || "Cómo trabajamos"
);

const processDescription = computed(
  () =>
    howWeWork.value?.description?.trim() ||
    "Te acompañamos desde la definición del material y la revisión del archivo hasta la producción y la entrega final."
);

const processSteps = computed<ProcessStepItem[]>(() => {
  const items = Array.isArray(howWeWork.value?.steps) ? howWeWork.value.steps : [];
  return items.length ? items : fallbackProcessSteps;
});

const hasProcessSteps = computed(() => processSteps.value.length > 0);

const breadcrumbItems = computed(() =>
  Array.isArray(category.value?.breadcrumbs) ? category.value.breadcrumbs : []
);

const heroImage = computed(() => category.value?.image?.src || "");

const secondaryCta = computed(() => {
  if (productsMeta.value.total > 0) {
    return {
      label: "Ver productos",
      to: "#productos",
    };
  }

  if (children.value.length) {
    return {
      label: "Explorar subcategorías",
      to: "#subcategorias",
    };
  }

  return undefined;
});

const childrenGridClass = computed(() => {
  const count = children.value.length;

  if (count <= 1) return "mx-auto max-w-[420px] grid-cols-1";
  if (count === 2) return "mx-auto max-w-[920px] grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
});

const canonicalUrl = computed(() => {
  const baseUrl =
    toAbsoluteUrl(
      category.value?.seo?.canonical ||
        category.value?.path ||
        route.path,
    ) ||
    toAbsoluteUrl("/") ||
    "https://reprodisseny.com";

  const url = new URL(baseUrl);

  // Eliminamos cualquier query heredada del canonical del CMS.
  url.search = "";

  if (currentPage.value > 1) {
    url.searchParams.set(
      "page",
      String(currentPage.value),
    );
  }

  return url.toString();
});

const seoTitle = computed(() => {
  const baseTitle =
    category.value?.seo?.title ||
    category.value?.title ||
    "Categoría";

  return currentPage.value > 1
    ? `${baseTitle} – Página ${currentPage.value}`
    : baseTitle;
});

const seoDescription = computed(() => {
  const baseDescription =
    category.value?.seo?.description ||
    category.value?.description ||
    "Categoría de productos";

  if (currentPage.value <= 1) {
    return baseDescription;
  }

  return `${baseDescription} Página ${currentPage.value} de ${Math.max(
    productsMeta.value.pages,
    1,
  )}.`;
});

const ogImageUrl = computed(() => {
  return toAbsoluteUrl(category.value?.seo?.image || heroImage.value);
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
}));

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,

  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => ogImageUrl.value,

  robots: () =>
    category.value?.seo?.robots ||
    "index,follow",

  twitterCard: () =>
    ogImageUrl.value
      ? "summary_large_image"
      : "summary",

  twitterTitle: () => seoTitle.value,
  twitterDescription: () =>
    seoDescription.value,
  twitterImage: () => ogImageUrl.value,
});

const categoryLabel = computed(
  () => category.value?.nav || category.value?.title || "esta categoría"
);

const bannerTitle = computed(
  () => `¿Te ayudamos con tu proyecto de ${categoryLabel.value.toLowerCase()}?`
);

const bannerDescription = computed(() => {
  return (
    category.value?.description ||
    "Te orientamos sobre materiales, formatos, acabados y la solución más adecuada según el uso real de la pieza."
  );
});

const detailsMedia = computed(() => {
  const primary = detailGallery.value[0] || galleryImages.value[0];

  const image = primary?.src
    ? {
        src: primary.src,
        alt: primary.alt || category.value?.title || "Imagen de la categoría",
        caption: primary.caption || undefined,
      }
    : null;

  const pills = (keywordPills.value || [])
    .map((item) => {
      const label = String(item?.label || "").trim();
      const to = String(item?.to || "").trim();
      const ariaLabel = String(item?.ariaLabel || "").trim();

      return {
        label,
        to,
        ariaLabel: ariaLabel || `Ver ${label}`,
      };
    })
    .filter((item) => item.label && item.to)
    .slice(0, 6);

  if (!image && !pills.length) return null;

  return {
    image,
    pills,
  };
});

const closingBannerImage = computed(() => {
  const image =
    detailGallery.value[1] ||
    galleryImages.value[1] ||
    detailGallery.value[0] ||
    galleryImages.value[0];

  if (image?.src) {
    return {
      src: image.src,
      alt: image.alt || category.value?.title || "Imagen de la categoría",
    };
  }

  if (heroImage.value) {
    return {
      src: heroImage.value,
      alt: category.value?.title || "Imagen de la categoría",
    };
  }

  return null;
});

const closingBannerPills = computed(() => {
  const related = keywordPills.value
    .map((item) => String(item?.label || "").trim())
    .filter(Boolean)
    .slice(0, 4);

  if (related.length) return related;

  return children.value
    .map((item) => item?.title?.trim())
    .filter(Boolean)
    .slice(0, 4) as string[];
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
      <div class="container-content pt-4 pb-2 md:pt-6 md:pb-3">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>

      <div :class="pageBottomSpacingClass">
        <div :class="pageFlowClass">
          <section aria-label="Presentación de la categoría">
            <CategoryHero
              :category="category"
              :primary-cta="{ label: 'Pedir presupuesto', to: '/contacto' }"
              :secondary-cta="secondaryCta"
            />
          </section>

          <section
            v-if="currentPage === 1 && children.length"
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

          <div
            v-if="productsPending"
            class="container-content py-10 text-center text-muted-foreground"
          >
            Cargando productos...
          </div>

          <CategoryProductsGrid
            v-else
            :products="products"
            eyebrow="Catálogo"
            title="Productos de esta categoría"
            description="Explora opciones, formatos y acabados disponibles."
            :current-page="productsMeta.page"
            :total-pages="productsMeta.pages"
            :total-items="productsMeta.total"
            :base-path="category.path || route.path"
          />

          <ContentSectionShell
            v-if="currentPage === 1 && hasSections"
            theme="muted"
            eyebrow="Soluciones gráficas"
            title="Características, tipos, formatos y acabados"
            description="Consulta la información clave de esta categoría en un formato más claro y fácil de comparar."
          >
            <ContentSectionsRenderer
              :sections="sections"
              variant="category"
              :details-media="detailsMedia"
            />
          </ContentSectionShell>

          <div v-if="currentPage === 1 && hasProcessSteps" :class="sectionSpacingClass">
            <ContentSectionShell
              id="como-trabajamos"
              eyebrow="Cómo realizamos tu pedido"
              :title="processTitle"
              :description="processDescription"
              density="compact"
              intro-spacing="tight"
            >
              <ContentProcessSteps :steps="processSteps" />
            </ContentSectionShell>
          </div>

          <div v-if="currentPage === 1" :class="sectionSpacingCompactClass">
            <GuideBanner
              title="¿Tienes dudas con el archivo, el tamaño o el acabado?"
              description="Consulta la guía rápida para preparar artes finales y evitar incidencias antes de imprimir."
              :cta="{ label: 'Ver guía de archivos', to: '/como-preparar-archivos' }"
            />
          </div>

          <div v-if="currentPage === 1 && hasFaqs" :class="sectionSpacingCompactClass">
            <ContentSectionShell
              eyebrow="Ayuda y dudas comunes"
              title="Preguntas frecuentes"
              description="Respondemos las dudas más habituales sobre materiales, formatos, acabados y criterios de elección."
              density="compact"
              intro-spacing="tight"
            >
              <FaqAccordion :items="faqs" />
            </ContentSectionShell>
          </div>

          <!--<div :class="sectionSpacingCompactClass">
            <SectionSplitBanner
              eyebrow="Asesoramiento"
              :title="bannerTitle"
              :description="bannerDescription"
              :image-src="closingBannerImage?.src || ''"
              :image-alt="closingBannerImage?.alt || bannerTitle"
              :pills="closingBannerPills"
              primary-label="Pedir presupuesto"
              primary-to="/contacto"
              :secondary-label="
                products.length
                  ? 'Ver productos'
                  : children.length
                  ? 'Ver subcategorías'
                  : ''
              "
              :secondary-to="
                products.length ? '#productos' : children.length ? '#subcategorias' : null
              "
              image-position="right"
            />
          </div>-->
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
