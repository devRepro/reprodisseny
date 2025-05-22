// composables/useCategoriasMenu.ts
import { useCategoriasStore } from '@/stores/categorias'
import { useFetchCategorias } from './useFetchCategorias.server'

export function useCategoriasMenu() {
  const store = useCategoriasStore()
  // Solo carga una vez
  const { data: categorias } = useAsyncData('categorias-menu', () => useFetchCategorias())

  watchEffect(() => {
    if (!store.loaded && categorias.value) {
      store.menu = categorias.value
      store.loaded = true
    }
  })

  return {
    categorias: computed(() => store.menu)
  }
}
