import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    categorias: defineCollection({
      source: 'categorias/**/*.{md,yml,json}',
      type: 'page',
      schema: z.object({
        title: z.string(),
        slug: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        navigation: z.boolean().optional(),
        nav: z.string().optional()
      })
    })
  }
})
