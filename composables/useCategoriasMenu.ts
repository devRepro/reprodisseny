// composables/useCategoriasMenu.ts
import { useCategoriasStore } from '@/stores/categorias'

export const useCategoriasMenu = async () => {
  const store = useCategoriasStore()

  if (!store.loaded) {
    const { useFetchCategorias } = await import('~/composables/useFetchCategorias.server')
    const categorias = await useFetchCategorias()
    store.menu = categorias
    store.loaded = true
  }

  return {
    categorias: computed(() => store.menu)
  }
}
