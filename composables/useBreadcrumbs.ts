import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useBreadcrumbs() {
  const route = useRoute()
  return {
    crumbs: computed(() => [
      { label: 'Inicio', href: '/' },
      { label: 'Categorías', href: '/categorias' },
      { label: route.params.category as string, href: '' }
    ])
  }
}
