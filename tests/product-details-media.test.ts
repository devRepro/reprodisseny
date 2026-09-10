import assert from "node:assert/strict";
import test from "node:test";

import catalog from "../cms/catalog.json";
import productDetailsMediaManifest from "../cms/product-details-media.json";
import { buildProductDetailsMediaManifest } from "../scripts/product-details-media-manifest";
import { normalizeCmsMediaSrc } from "../utils/cmsMedia";
import {
  deriveProductDetailsImageSrc,
  hasProductDetailsImage,
  normalizeProductDetailsImageSlug,
  resolveProductDetailsImage,
  resolveProductDetailsImages,
} from "../utils/productDetailsMedia";

const flyersBlobImageSrc =
  "https://webcms.blob.core.windows.net/media/product/publicidad-oficina/publicidad/flyers.webp";

const flyersLegacyDetailsSrc =
  "/media/product/publicidad-oficina/publicidad/details/flyers-personalizados/flyers-personalizados.webp";

const emptyManifest = {
  version: 1,
  source: { storageAccount: "webcms", containerName: "media", prefix: "product/" },
  products: {},
} as const;

function productBySlug(slug: string) {
  return (catalog.products || []).find((product) => product.slug === slug);
}

test("manifest reconoce una imagen detail con categoryPath de un nivel", () => {
  const manifest = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [
      "product/adhesivos/details/hojas-pegatinas-personalizadas/01-detail.webp",
    ],
  });

  assert.deepEqual(Object.keys(manifest.products), ["hojas-pegatinas-personalizadas"]);
  assert.equal(
    manifest.products["hojas-pegatinas-personalizadas"]?.[0]?.mediaPath,
    "/media/product/adhesivos/details/hojas-pegatinas-personalizadas/01-detail.webp"
  );
});

test("manifest reconoce categoryPath de varios niveles", () => {
  const manifest = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [
      "product/gran-formato/material-flexible/details/laminas-solares-para-cristales/01-detail.webp",
    ],
  });

  const entry = manifest.products["laminas-solares-para-cristales"]?.[0];
  assert.equal(entry?.categoryPath, "gran-formato/material-flexible");
  assert.equal(entry?.productSlug, "laminas-solares-para-cristales");
});

test("manifest ordena imagenes por indice numerico", () => {
  const manifest = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [
      "product/adhesivos/details/pegatinas-personalizadas/10-detail.webp",
      "product/adhesivos/details/pegatinas-personalizadas/02-detail.webp",
      "product/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
    ],
  });

  assert.deepEqual(
    manifest.products["pegatinas-personalizadas"]?.map((entry) => entry.filename),
    ["01-detail.webp", "02-detail.webp", "10-detail.webp"]
  );
});

test("manifest ignora archivos no validos", () => {
  const manifest = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [
      "product/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
      "product/adhesivos/details/pegatinas-personalizadas/detail.webp",
      "product/adhesivos/details/pegatinas-personalizadas/01-hero.webp",
      "product/adhesivos/gallery/pegatinas-personalizadas/01-detail.webp",
      "category/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
    ],
  });

  assert.deepEqual(
    manifest.products["pegatinas-personalizadas"]?.map((entry) => entry.filename),
    ["01-detail.webp"]
  );
});

test("manifest no mezcla slugs similares", () => {
  const manifest = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [
      "product/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
      "product/adhesivos/details/pegatinas-personalizadas-premium/01-detail.webp",
    ],
  });

  assert.deepEqual(Object.keys(manifest.products), [
    "pegatinas-personalizadas",
    "pegatinas-personalizadas-premium",
  ]);
});

test("manifest elimina duplicados por blobPath", () => {
  const manifest = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [
      "product/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
      "product/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
    ],
  });

  assert.equal(manifest.products["pegatinas-personalizadas"]?.length, 1);
});

test("manifest es determinista", () => {
  const paths = [
    "product/expositores/details/roll-up-personalizado/01-detail.webp",
    "product/adhesivos/details/hojas-pegatinas-personalizadas/01-detail.webp",
  ];

  const first = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: paths,
  });
  const second = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [...paths].reverse(),
  });

  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("productDetailsMedia explicito tiene prioridad sobre manifest y legacy", () => {
  const image = resolveProductDetailsImage({
    slug: "flyers-personalizados",
    title: "Flyers personalizados",
    image: { src: flyersBlobImageSrc },
    productDetailsMedia: {
      image: {
        src: "/media/custom/product-details.webp",
        alt: "Detalle explicito",
        caption: "Caption explicito",
      },
    },
    detailsImageSrc: "/media/custom/details-legacy.webp",
  });

  assert.equal(image?.src, "/media/custom/product-details.webp");
  assert.equal(image?.alt, "Detalle explicito");
  assert.equal(image?.caption, "Caption explicito");
});

test("productDetailsMedia explicito puede contener varias imagenes", () => {
  const images = resolveProductDetailsImages({
    title: "Producto con detalles",
    productDetailsMedia: {
      images: [
        { src: "/media/custom/detail-1.webp", alt: "Detalle 1" },
        { src: "/media/custom/detail-2.webp", alt: "Detalle 2" },
      ],
    },
  });

  assert.deepEqual(
    images.map((image) => image.src),
    ["/media/custom/detail-1.webp", "/media/custom/detail-2.webp"]
  );
});

test("resolver usa manifest para una imagen", () => {
  const images = resolveProductDetailsImages({
    slug: "hojas-pegatinas-personalizadas",
    title: "Hojas con Pegatinas Personalizadas",
  });

  assert.deepEqual(
    images.map((image) => image.src),
    ["/media/product/adhesivos/details/hojas-pegatinas-personalizadas/01-detail.webp"]
  );
});

test("resolver usa manifest para varias imagenes", () => {
  const manifest = buildProductDetailsMediaManifest({
    storageAccount: "webcms",
    containerName: "media",
    blobPaths: [
      "product/adhesivos/details/pegatinas-personalizadas/02-detail.webp",
      "product/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
    ],
  });

  const images = resolveProductDetailsImages(
    { slug: "pegatinas-personalizadas", title: "Pegatinas personalizadas" },
    manifest
  );

  assert.deepEqual(
    images.map((image) => image.src),
    [
      "/media/product/adhesivos/details/pegatinas-personalizadas/01-detail.webp",
      "/media/product/adhesivos/details/pegatinas-personalizadas/02-detail.webp",
    ]
  );
});

test("normaliza mediaPath del manifest a media.reprodisseny.com", () => {
  const image = resolveProductDetailsImage({ slug: "hojas-pegatinas-personalizadas" });

  assert.equal(
    normalizeCmsMediaSrc(image?.src),
    "https://media.reprodisseny.com/media/product/adhesivos/details/hojas-pegatinas-personalizadas/01-detail.webp"
  );
});
test("resolver no inventa caption visual para imagenes de manifest", () => {
  const image = resolveProductDetailsImage({
    slug: "hojas-pegatinas-personalizadas",
    title: "Hojas con Pegatinas Personalizadas",
  });

  assert.equal(image?.alt, "Detalle de Hojas con Pegatinas Personalizadas");
  assert.equal(image?.caption, undefined);
});

test("legacy allowlist deriva Details desde un ImageSrc real si no hay manifest", () => {
  assert.equal(
    deriveProductDetailsImageSrc({
      slug: "flyers-personalizados",
      imageSrc: flyersBlobImageSrc,
    }),
    flyersLegacyDetailsSrc
  );

  assert.equal(
    resolveProductDetailsImage(
      {
        slug: "flyers-personalizados",
        title: "Flyers personalizados",
        image: { src: flyersBlobImageSrc },
      },
      emptyManifest
    )?.src,
    flyersLegacyDetailsSrc
  );
});

test("imageSrc con dominio media.reprodisseny.com genera una ruta relativa legacy canonica", () => {
  assert.equal(
    deriveProductDetailsImageSrc({
      slug: "flyers-personalizados",
      imageSrc:
        "https://media.reprodisseny.com/media/product/publicidad-oficina/publicidad/flyers.webp",
    }),
    flyersLegacyDetailsSrc
  );
});

test("imageSrc con dominio webcms.blob.core.windows.net genera una ruta relativa legacy canonica", () => {
  assert.equal(
    deriveProductDetailsImageSrc({
      slug: "etiquetas-colgantes",
      imageSrc:
        "https://webcms.blob.core.windows.net/media/product/publicidad-oficina/publicidad/etiquetas-colgantes.webp",
    }),
    "/media/product/publicidad-oficina/publicidad/details/etiquetas-colgantes/etiquetas-colgantes.webp"
  );
});

test("slug vacio no devuelve URL valida", () => {
  assert.equal(
    deriveProductDetailsImageSrc({ slug: "", imageSrc: flyersBlobImageSrc }),
    ""
  );
  assert.equal(
    deriveProductDetailsImageSrc({ slug: "   ", imageSrc: flyersBlobImageSrc }),
    ""
  );
  assert.equal(normalizeProductDetailsImageSlug(""), "");
});

test("slug malicioso o con path traversal no genera una ruta valida", () => {
  for (const slug of [
    "../flyers-personalizados",
    "product/details/flyers-personalizados",
    "flyers-personalizados?x=1",
    "https://example.com/flyers-personalizados",
    "flyers-personalizados#hash",
    "flyers\\personalizados",
  ]) {
    assert.equal(
      deriveProductDetailsImageSrc({ slug, imageSrc: flyersBlobImageSrc }),
      "",
      slug
    );
  }
});

test("producto no incluido en manifest no genera Details", () => {
  assert.equal(
    deriveProductDetailsImageSrc({
      slug: "lona-publicitaria",
      imageSrc:
        "https://webcms.blob.core.windows.net/media/product/gran-formato/material-flexible/lona-publicitaria.webp",
    }),
    ""
  );
  assert.equal(hasProductDetailsImage("lona-publicitaria"), false);
});

test("legacy explicito se mantiene cuando no hay manifest", () => {
  const image = resolveProductDetailsImage(
    {
      slug: "producto-sin-manifest",
      title: "Producto sin manifest",
      detailsImageSrc: "/media/custom/details.webp",
    },
    emptyManifest
  );

  assert.equal(image?.src, "/media/custom/details.webp");
  assert.equal(image?.alt, "Detalle de Producto sin manifest");
});

test("no utiliza galleryImages[0] como fallback de Details", () => {
  const product = {
    slug: "producto-sin-imagen-details",
    title: "Producto sin imagen Details",
    galleryImages: [
      {
        src: "/media/product/gallery.webp",
        alt: "Galeria",
      },
    ],
  };

  assert.equal(resolveProductDetailsImage(product), null);
  assert.deepEqual(product.galleryImages, [
    {
      src: "/media/product/gallery.webp",
      alt: "Galeria",
    },
  ]);
});

test("no utiliza la imagen principal como contenido Details", () => {
  const product = {
    slug: "producto-sin-imagen-details",
    title: "Producto sin imagen Details",
    imageSrc: "/media/product/publicidad-oficina/publicidad/flyers.webp",
    image: {
      src: "/media/product/publicidad-oficina/publicidad/flyers.webp",
      alt: "Hero",
    },
  };

  assert.equal(resolveProductDetailsImage(product), null);
  assert.equal(
    product.image.src,
    "/media/product/publicidad-oficina/publicidad/flyers.webp"
  );
});

test("catalogo real tiene productSlug unico", () => {
  const counts = new Map<string, number>();
  for (const product of catalog.products || []) {
    counts.set(product.slug, (counts.get(product.slug) || 0) + 1);
  }

  assert.deepEqual(
    [...counts.entries()].filter(([, count]) => count > 1),
    []
  );
});

test("productos reales con details resuelven desde manifest", () => {
  const expected = new Map([
    [
      "hojas-pegatinas-personalizadas",
      "/media/product/adhesivos/details/hojas-pegatinas-personalizadas/01-detail.webp",
    ],
    [
      "roll-up-personalizado",
      "/media/product/expositores/details/roll-up-personalizado/01-detail.webp",
    ],
    [
      "laminas-solares-para-cristales",
      "/media/product/gran-formato/material-flexible/details/laminas-solares-para-cristales/01-detail.webp",
    ],
  ]);

  for (const [slug, src] of expected) {
    const product = productBySlug(slug);
    assert.ok(product, slug);
    assert.equal(resolveProductDetailsImage(product)?.src, src, slug);
  }
});

test("producto real sin details devuelve lista vacia", () => {
  const product = productBySlug("arbol-navidad-corporativo");
  assert.ok(product);
  assert.deepEqual(resolveProductDetailsImages(product), []);
});

test("manifest real contiene 38 imagenes y 38 productos", () => {
  const products = Object.keys(productDetailsMediaManifest.products || {});
  const images = Object.values(productDetailsMediaManifest.products || {}).flat();

  assert.equal(products.length, 38);
  assert.equal(images.length, 38);
});
