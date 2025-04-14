import { ref, watch, type Ref } from 'vue'
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

    // Mostrar resultados antiguos mientras escribe
    if (searchTerm.length < 2) {
      results.value = { categorias: [], productos: [] }
      return
    }

    loading.value = true

    debounceTimeout = setTimeout(async () => {
      try {
        const all = await queryCollection('categorias').all()

        // Crear mapa: slug -> title de categoría
        const categoriasMap = new Map<string, string>()
        all.forEach((item: any) => {
          if (item.type === 'categoria' && item.slug && item.title) {
            categoriasMap.set(item.slug, item.title.toLowerCase())
          }
        })

        const categorias = all.filter(
          (item: any) =>
            item.type === 'categoria' &&
            item.slug &&
            (
              item.title?.toLowerCase().includes(searchTerm) ||
              item.description?.toLowerCase().includes(searchTerm)
            )
        )

        const productos = all.filter((item: any) => {
          if (item.type !== 'producto' || !item.slug) return false
          const catTitle = categoriasMap.get(item.category) || ''
          return (
            item.title?.toLowerCase().includes(searchTerm) ||
            item.description?.toLowerCase().includes(searchTerm) ||
            item.category?.toLowerCase().includes(searchTerm) ||
            catTitle.includes(searchTerm)
          )
        })

        results.value = {
          categorias: categorias.map((item) => ({ ...item, type: 'categoria' as const })),
          productos: productos.map((item) => ({ ...item, type: 'producto' as const }))
        }
        
      } catch (err) {
        console.error('[useContentSearch] Error:', err)
      } finally {
        loading.value = false
      }
    }, 200) // puedes ajustar el tiempo de espera aquí
  }, { immediate: true })

  return { results, loading }
}
