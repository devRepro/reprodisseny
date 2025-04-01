import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    categorias: defineCollection({
      source: 'categorias/**/*.{md,yml,json}',
      type: 'page',
      schema: z.object({
        // SEO y estructura básica
        title: z.string(),
        slug: z.string().optional(),
        category: z.string().optional(),
        description: z.string(),
        image: z.string().optional(),
        alt: z.string().optional(),
        type: z.string().optional(),

        // Navegación y organización
        navigation: z.boolean().optional(),
        nav: z.any().optional(),
        categoria: z.string().optional(),

        // SEO opcional avanzado
        metatitle: z.string().optional(),
        metadescription: z.string().optional(),

        // Schema.org estructurado
        schema: z.record(z.any()).optional(),

        // 🔜 Campos para ecommerce (opcional por ahora)
        sku: z.string().optional(),
        price: z.number().optional(),
        priceCurrency: z.string().optional(),
        inStock: z.boolean().optional(),
        brand: z.string().optional()
      })
    })
  }
})
