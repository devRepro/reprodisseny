import { ref } from 'vue'
import { useProductosByCategoria } from '@/composables/useProductosByCategoria'

export function useProductSection(slug: string) {
  const activeTab = ref<'top'|'new'|'popular'>('top')
  const { data: allProducts } = useProductosByCategoria(slug)

  const productsByTab = computed(() => {
    if (!allProducts.value) return []
    switch (activeTab.value) {
      case 'new':     return allProducts.value.filter(p => p.tags?.includes('new'))
      case 'popular': return allProducts.value.filter(p => p.tags?.includes('popular'))
      default:        return allProducts.value.filter(p => p.tags?.includes('top'))
    }
  })

  return { activeTab, setActiveTab: (v)=> activeTab.value = v, productsByTab }
}
