// composables/useSeoContent.ts
import { useSchemaOrg } from '@vueuse/schema-org'

import { useRoute } from 'vue-router'

interface ContentData {
  metaTitle?: string
  metaDescription?: string
  title: string
  description?: string
  image?: string
  type?: string
  slug?: string
  path?: string
  schema?: Record<string, any>
  schemaType?: string
}

export function useSeoContent(content: ContentData) {
  const route = useRoute()
  const siteUrl = useRuntimeConfig().public.siteUrl || 'https://reprodisseny.com'

  const fullPath = `${siteUrl}${content.path || route.fullPath}`
  const imagePath = content.image?.startsWith('http')
    ? content.image
    : `${siteUrl}${content.image?.startsWith('/') ? content.image : `/img/${content.type || 'otros'}/${content.image}`}`

  // Inyectar metadatos SEO
  useSeoMeta({
    title: content.metaTitle || content.title,
    description: content.metaDescription || content.description || '',
    ogTitle: content.metaTitle || content.title,
    ogDescription: content.metaDescription || content.description || '',
    ogImage: imagePath,
    ogUrl: fullPath,
    twitterTitle: content.metaTitle || content.title,
    twitterDescription: content.metaDescription || content.description || '',
    twitterImage: imagePath,
    twitterCard: 'summary_large_image',
    canonical: fullPath
  })

  // Inyectar schema.org si está definido
  if (content.schema && content.schemaType) {
    useSchemaOrg([
      {
        '@type': content.schemaType,
        ...content.schema
      }
    ])
  }
}
