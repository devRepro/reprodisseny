import { ref, watch, type Ref } from 'vue'
import Fuse from 'fuse.js'
import type { Categoria, Producto } from '@/types'

export function useContentSearch(search: Ref<string>) {
  const results = ref<{ categorias: Categoria[]; productos: Producto[] }>({
    categorias: [],
    productos: []
  })

  const loading = ref(false)
  let debounceTimeout: ReturnType<typeof setTimeout>

  watch(search, (val) => {
    const searchTerm = val?.toLowerCase()?.trim() ?? ''

    if (debounceTimeout) clearTimeout(debounceTimeout)
    loading.value = true

    debounceTimeout = setTimeout(async () => {
      try {
        const all = await queryCollection('categorias').all()

        const categoriasRaw = all.filter((item: any) => item.type === 'categoria')
        const productosRaw = all.filter((item: any) => item.type === 'producto')

        const fuseCategorias = new Fuse(categoriasRaw, {
          keys: ['title', 'description'],
          includeScore: true,
          threshold: 0.4
        })

        const fuseProductos = new Fuse(productosRaw, {
          keys: ['title', 'description', 'category'],
          includeScore: true,
          threshold: 0.4
        })

        const categorias = searchTerm
          ? fuseCategorias.search(searchTerm).map((r) => ({ ...r.item, type: 'categoria' as const }))
          : []

        const productos = searchTerm
          ? fuseProductos.search(searchTerm).map((r) => ({ ...r.item, type: 'producto' as const }))
          : []

        results.value = { categorias, productos }
      } catch (err) {
        console.error('[useContentSearch] Error:', err)
      } finally {
        loading.value = false
      }
    }, 200)
  }, { immediate: true })

  return { results, loading }
}
