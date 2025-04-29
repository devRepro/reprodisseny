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
        brand: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        searchTerms: z.array(z.string()).optional(),
         // ✅ Campos del formulario dinámico
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
    }),
    // --- NUEVA Colección para Documentación ---
    docs: defineCollection({
      source: 'docs/**/*.md',
      type: 'page',
      schema: z.object({
        title: z.string({
          required_error: 'El título (title) es obligatorio en el frontmatter de los documentos.',
          invalid_type_error: 'El título (title) debe ser texto.',
        }),
        description: z.string().optional(),
    
        // 🔧 Añade estos para navegación, búsqueda y .where() con _path
        _path: z.string().optional(),
        path: z.string().optional(),
      })
    })
    
    // --- Puedes añadir más colecciones aquí si es necesario ---

  } // Fin del objeto collections
})
