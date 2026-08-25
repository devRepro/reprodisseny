<script setup lang="ts">
import { computed } from "vue";
import type { CategoryDetailPageDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import CategoryHero from "@/components/marketing/category/CategoryHero.vue";
import CategoryChildrenGrid from "@/components/marketing/category/CategoryChildrenGrid.vue";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import ContentSectionsRenderer from "@/components/marketing/content/ContentSectionsRenderer.vue";
import FaqAccordion from "@/components/shared/blocks/FaqAccordion.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";
import ContentProcessSteps, {
  type ProcessStepItem,
} from "@/components/marketing/content/ContentProcessSteps.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import {
  buildCategoryPageSchema,
  type CategorySchemaItem,
} from "~/utils/seo/buildCategoryPageSchema";
import {
  buildCatalogCanonicalUrl,
  hasOnlyCatalogPaginationQuery,
  parseCatalogPageQuery,
} from "~/utils/seo/catalogUrls";

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

function isCategorySchemaItem(
  item: CategorySchemaItem | null,
): item is CategorySchemaItem {
  return item !== null;
}

const route = useRoute();
const config = useRuntimeConfig();
const nuxtApp = useNuxtApp();


const PRODUCTS_PER_PAGE = 12;

const currentPage = computed(() =>
  parseCatalogPageQuery(route.query.page),
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

const relatedProducts = computed(() =>
  Array.isArray(category.value?.relatedProducts)
    ? category.value.relatedProducts
    : []
);

const editorialHighlightPaths = new Set([
  "/categorias/gran-formato",
  "/categorias/publicidad-oficina",
]);

const showEditorialHighlights = computed(() =>
  editorialHighlightPaths.has(normalizePath(category.value?.path))
);

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

const canonicalUrl = computed(() => {
  const baseUrl =
    toAbsoluteUrl(
      category.value?.seo?.canonical ||
        category.value?.path ||
        route.path,
    ) ||
    toAbsoluteUrl("/") ||
    "https://reprodisseny.com";

  return buildCatalogCanonicalUrl({
    siteUrl: String(config.public.siteUrl || "https://reprodisseny.com"),
    path: baseUrl,
    page: currentPage.value,
  });
});

const hasNonPaginationQuery = computed(() =>
  !hasOnlyCatalogPaginationQuery(route.query)
);

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

const schemaSiteUrl = computed(() =>
  String(config.public.siteUrl || "https://reprodisseny.com").replace(/\/+$/, "")
);

const schemaBreadcrumbs = computed(() => {
  const rawItems = Array.isArray(breadcrumbItems.value)
    ? breadcrumbItems.value
    : [];

  const items = rawItems
    .map((item: any, index: number) => {
      const name = String(item?.label || "").trim();

      const rawUrl =
        item?.to ||
        (index === rawItems.length - 1
          ? canonicalUrl.value
          : "");

      return {
        name,
        url: toAbsoluteUrl(rawUrl) || "",
      };
    })
    .filter((item) => item.name && item.url);

  const homeUrl = toAbsoluteUrl("/") || `${schemaSiteUrl.value}/`;

  if (
    items[0]?.url !== homeUrl &&
    items[0]?.name.toLowerCase() !== "inicio"
  ) {
    items.unshift({
      name: "Inicio",
      url: homeUrl,
    });
  }

  return items;
});

const schemaItems = computed<CategorySchemaItem[]>(() =>
  products.value
    .map((product: any): CategorySchemaItem | null => {
      const name = String(
        product?.title ||
          product?.name ||
          product?.nav ||
          ""
      ).trim();

      const rawPath = String(
        product?.path ||
          product?.url ||
          (product?.slug
            ? `/productos/${product.slug}`
            : "")
      ).trim();

      const url = toAbsoluteUrl(rawPath);

      const image = toAbsoluteUrl(
        product?.image?.src ||
          product?.mainImage?.src ||
          ""
      );

      if (!name || !url) return null;

      return {
        name,
        url,
        ...(image ? { image } : {}),
      };
    })
    .filter(isCategorySchemaItem)
);

const categoryPageSchema = computed(() =>
  buildCategoryPageSchema({
    siteUrl: schemaSiteUrl.value,
    canonicalUrl: canonicalUrl.value,
    title: seoTitle.value,
    description: seoDescription.value,
    image: ogImageUrl.value,
    breadcrumbs: schemaBreadcrumbs.value,
    items: schemaItems.value,
    positionOffset:
      (currentPage.value - 1) * PRODUCTS_PER_PAGE,
    inLanguage: "es-ES",
  })
);

const categoryPageSchemaJson = computed(() =>
  categoryPageSchema.value
    ? JSON.stringify(categoryPageSchema.value)
    : ""
);

useHead(() => ({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl.value,
    },
  ],
  script: categoryPageSchemaJson.value
    ? [
        {
          id: "category-page-jsonld",
          type: "application/ld+json",
          textContent: categoryPageSchemaJson.value,
        },
      ]
    : [],
}));

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,

  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => ogImageUrl.value,

  robots: () =>
    hasNonPaginationQuery.value
      ? "noindex,follow"
      : category.value?.seo?.robots ||
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

  if (!image) return null;

  return {
    image,
    pills: [],
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
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" :json-ld="false" />
      </div>

      <div :class="pageBottomSpacingClass">
        <div :class="pageFlowClass">
          <section aria-label="Presentación de la categoría">
            <CategoryHero
              :category="category"
              :primary-cta="{ label: 'Pedir presupuesto', to: '/pedir-presupuesto' }"
              :secondary-cta="secondaryCta"
            />
          </section>

          <CategoryChildrenGrid
            v-if="currentPage === 1 && children.length"
            :children="children"
            eyebrow="Líneas de producto"
            title="Explora nuestras soluciones"
            description="Elige la familia que mejor encaja con tu proyecto para ver sus productos y opciones."
          />

          <CategoryProductsGrid
            v-if="currentPage === 1 && showEditorialHighlights && relatedProducts.length"
            id="soluciones-destacadas"
            variant="featured"
            :products="relatedProducts"
            eyebrow="Selección destacada"
            title="Soluciones destacadas"
            description="Una selección breve de productos relevantes para acceder directamente a sus opciones."
            container-class="container-content py-6 md:py-8"
          />

          <div
            v-if="productsPending"
            class="container-content py-10 text-center text-muted-foreground"
          >
            Cargando productos...
          </div>

          <CategoryProductsGrid
            v-else
            :products="products"
            eyebrow="Catálogo completo"
            title="Todos los productos"
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
            title="Detalles y opciones de la categoría"
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

          <CategoryProductsGrid
            v-if="currentPage === 1 && !showEditorialHighlights && relatedProducts.length"
            id="productos-relacionados"
            :products="relatedProducts"
            eyebrow="Productos relacionados"
            title="También te puede interesar"
            description="Descubre productos y soluciones relacionados con esta categoría."
            container-class="container-content py-8 md:py-10"
          />

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
