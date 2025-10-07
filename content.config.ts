// content.config.ts — Nuxt Content v3
import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    // --- Colección de CATEGORÍAS ---
    categorias: defineCollection({
      type: 'page',
      source: {
        include: 'categorias/**/*.{md,yml,yaml,json}',
        // Prefijo URL automático: /categorias/...
        prefix: '/categorias',
        // Opcional: ignora dotfiles (.DS_Store, .gitkeep, etc.)
        exclude: ['**/.*']
      },
      schema: z.object({
        // Básicos
        title: z.string(),
        slug: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        alt: z.string().optional(),

        // Navegación / menú
        nav: z.string().optional(),
        order: z.number().optional(),
        parent: z.string().optional(),
        hidden: z.boolean().optional(),
        featured: z.boolean().optional(),
        type: z.enum(['categoria', 'subcategoria']).optional(),


        // SEO opcional
        metatitle: z.string().optional(),
        metadescription: z.string().optional(),

        // Schema.org opcional
        schema: z.record(z.any()).optional()
      })
    }),

    // --- Colección de PRODUCTOS ---
    productos: defineCollection({
      type: 'page',
      source: {
        include: 'productos/**/*.md',
        // Prefijo URL automático: /productos/...
        prefix: '/productos',
        exclude: ['**/.*']
      },
      schema: z.object({
        // Identificación
        type: z.literal('producto'),
        slug: z.string().optional(),            // si no se define, se infiere del filename
        categorySlug: z.string(),               // ← relación con la categoría (obligatorio)
        subcategorySlug: z.string().optional(),   
        // Básicos
        title: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),           // usa rutas públicas (/public)
        alt: z.string().optional(),

        // Comercio
        sku: z.string().optional(),
        price: z.number().optional(),
        priceCurrency: z.string().default('EUR'),
        brand: z.string().default('Repro Disseny'),
        inStock: z.boolean().default(true),

        // Media
        galleryImages: z.array(z.string()).optional(),

        // Opiniones
        ratingValue: z.number().min(0).max(5).default(0),
        reviewCount: z.number().int().default(0),

        // Orden opcional para listados
        order: z.number().default(0),

        // SEO opcional
        metatitle: z.string().optional(),
        metadescription: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        searchTerms: z.array(z.string()).optional(),

        // Schema.org opcional
        schema: z.record(z.any()).optional()
      })
    }),

    // --- Colección de DOCS (ejemplo) ---
    docs: defineCollection({
      type: 'page',
      source: {
        include: 'docs/**/*.md',
        exclude: ['**/.*']
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        // Campos útiles en consultas
        _path: z.string().optional(),
        path: z.string().optional()
      })
    })
  }
})
