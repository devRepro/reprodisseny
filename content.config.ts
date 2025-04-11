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
        category: z.string().optional(), // categoría madre si aplica
        description: z.string(),
        image: z.string().optional(),
        alt: z.string().optional(),
        type: z.enum(['categoria', 'subcategoria', 'producto']).optional(),

        // Navegación y organización
        navigation: z.boolean().optional(),
        nav: z.any().optional(),
        categoria: z.string().optional(),
        parent: z.string().optional(), // 💡 NUEVO: para saber la categoría madre

        // SEO opcional avanzado
        metatitle: z.string().optional(),
        metadescription: z.string().optional(),

        // Schema.org estructurado
        schema: z.record(z.any()).optional(),

        // Campos para ecommerce
        sku: z.string().optional(),
        price: z.number().optional(),
        priceCurrency: z.string().optional(),
        inStock: z.boolean().optional(),
        brand: z.string().optional(),

        // Campos del formulario dinámico
        formFields: z.array(
          z.object({
            label: z.string(),
            name: z.string(),
            type: z.enum(['text', 'number', 'select']),
            required: z.boolean(),
            options: z.array(z.string()).optional()
          })
        ).optional()
      })
    })
  }
})
