// composables/useCategoriaBySlug.ts
import type { Categoria } from '@/types'
 

export const useCategoriaBySlug = (slug: string) => {
  return useAsyncData<Categoria | null>(`categoria-${slug}`, async () => {
    // haces la query
    const snapshot = await queryCollection('categorias')
      .where('slug', '==', slug)
      .first()
    if (!snapshot) return null
    // extraes los datos y añades el id si lo necesitas
    return { id: snapshot.id, ...(snapshot.data() as Omit<Categoria, 'id'>) }
  })
}

