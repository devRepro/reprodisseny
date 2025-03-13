import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md'
    }),
    categorias: defineCollection({
      type: 'page',
      source:'categorias/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
        slug: z.string(),
        image: z.string().optional(), // Imagen opcional
        draft: z.boolean().default(false), // Indica si está en borrador o no
        tags: z.array(z.string()).optional() // Lista de etiquetas opcionales
      })
    }),
  }
})



image: ""
draft: false
tags: ["branding", "publicidad", "visual"]