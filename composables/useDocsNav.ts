import type { NavItem } from '@nuxt/content/dist/runtime/types'

export const useDocsNav = () => {
  return useAsyncData<NavItem[]>('docs-navigation', async () => {
    const tree = await queryCollectionNavigation('docs', ['title', 'path'])
    return tree?.[0]?.children || []
  })
}
