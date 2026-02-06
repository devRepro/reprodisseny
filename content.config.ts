// content.config.ts
import { defineContentConfig, defineCollection } from "@nuxt/content"
import { z } from "zod"
import path from "node:path"

/** ---- Helpers comunes ---- */
const ImgObj = z.object({
  src: z.string(),
  width: z.number().default(1200),
  height: z.number().default(800),
  alt: z.string().optional(),
})

// String u objeto; transforma string → objeto con tamaños por defecto (NO añade base path)
const Img = z.union([z.string(), ImgObj]).transform(v =>
  typeof v === 'string' ? ({ src: v, width: 1200, height: 800 }) : v
)

const GalleryItem = z.union([z.string(), ImgObj])
const Hreflang = z.object({ lang: z.string(), url: z.string() })
const FaqItem = z.object({ question: z.string(), answer: z.string() })
const Breadcrumb = z.object({ name: z.string(), url: z.string() })
const Cta = z.object({ text: z.string(), link: z.string() })

export default defineContentConfig({
  collections: {
    categorias: defineCollection({
      type: "page",
      source: {
        cwd: path.resolve("cms"), // ✅ AQUÍ: lee desde /cms
        include: "categorias/**/*.{md,yml,yaml,json}",
        prefix: "/categorias",
        exclude: ["**/.*"],
      },
      schema: z.object({
        type: z.enum(["categoria", "subcategoria"]).default("categoria"),
        title: z.string(),
        slug: z.string().optional(),
        description: z.string().optional(),
        image: Img.optional(),
        alt: z.string().optional(),

        nav: z.string().optional(),
        order: z.number().default(0),
        parent: z.string().optional(),
        hidden: z.boolean().default(false),
        featured: z.boolean().default(false),

        galleryImages: z.array(GalleryItem).default([]),
        breadcrumbs: z.array(Breadcrumb).default([]),
        cta: Cta.optional(),

        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        canonical: z.string().optional(),
        hreflang: z.array(Hreflang).optional(),
        keywords: z.array(z.string()).default([]),
        searchTerms: z.array(z.string()).default([]),

        faqs: z.array(FaqItem).default([]),

        schema: z.record(z.any()).optional(),
      }),
      indexes: [
        { columns: ['hidden'] },
        { columns: ['order'] },
        { columns: ['parent'] },
        { columns: ['featured'] },
        { columns: ['hidden', 'order'] },
      ],
    }),

    productos: defineCollection({
      type: "page",
      source: {
        cwd: path.resolve("cms"), // ✅ AQUÍ TAMBIÉN
        include: "productos/**/*.{md,yml,yaml,json}",
        prefix: "/productos",
        exclude: ["**/.*"],
      },
      schema: z.object({
        type: z.literal("producto"),
        slug: z.string().optional(),
        categorySlug: z.string(),
        subcategorySlug: z.string().optional(),

        title: z.string(),
        description: z.string().optional(),
        image: Img.optional(),
        alt: z.string().optional(),

        galleryImages: z.array(GalleryItem).default([]),

        sku: z.string().optional(),
        mpn: z.string().optional(),
        gtin13: z.string().optional(),
        brand: z.string().default("Repro Disseny"),
        price: z.number().default(0),
        priceCurrency: z.string().default("EUR"),
        inStock: z.boolean().default(true),
        hidden: z.boolean().default(false),

        ratingValue: z.number().min(0).max(5).default(0),
        reviewCount: z.number().int().default(0),

        attributes: z.array(z.object({ name: z.string(), value: z.string() })).default([]),
        variants: z
          .array(
            z.object({
              sku: z.string().optional(),
              title: z.string().optional(),
              price: z.number().optional(),
              attributes: z
                .array(z.object({ name: z.string(), value: z.string() }))
                .optional(),
            })
          )
          .default([]),

        formFields: z.array(z.record(z.any())).default([]),
        order: z.number().default(0),

        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        canonical: z.string().optional(),
        hreflang: z.array(Hreflang).optional(),
        keywords: z.array(z.string()).default([]),
        searchTerms: z.array(z.string()).default([]),

        schema: z.record(z.any()).optional(),
      }),
      indexes: [
        { columns: ['categorySlug'] },
        { columns: ['hidden'] },
        { columns: ['inStock'] },
        { columns: ['order'] },
        { columns: ['categorySlug', 'order'] },
      ],
    }),
  },
})
