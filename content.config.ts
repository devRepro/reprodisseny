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

        // SEO opcional
        metatitle: z.string().optional(),
        metadescription: z.string().optional(),

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

