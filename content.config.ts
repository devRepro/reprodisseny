import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    categorias: defineCollection({
      // Incluir todos los archivos dentro de content/categorias/**
      source: 'categorias/**/*.{md,yml,json}', 
      type: 'page',
      schema: z.object({
        title: z.string(),
        slug: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        // El campo "navigation" es generado automáticamente para type 'page'
        // (boolean u objeto, default true)&#8203;:contentReference[oaicite:0]{index=0}
        image: z.string().optional(), 
        navigation: z.boolean().optional(),
        // Cualquier otro campo frontmatter personalizado:
        nav: z.any().optional() ,
        alt: z.string().optional()
      })
    })
    // Podríamos definir otras colecciones para otras partes del contenido si es necesario
  }
})