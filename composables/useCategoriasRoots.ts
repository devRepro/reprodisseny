// composables/useCategoriasRoots.ts
import type { CategoriasPayload, CategoriaNodeNav } from '@/types'

function normalizeRoots(tree: CategoriaNodeNav[] = []): CategoriaNodeNav[] {
  // si el primer nodo es el contenedor "/categorias", usa sus hijos
  const first = tree[0]
  if (first?.path === '/categorias' && Array.isArray(first.children)) {
    return first.children
  }
  return tree
}

export function useCategoriasRoots() {
  return useAsyncData<{ items: CategoriaNodeNav[] }>(
    'categorias-roots',
    async () => {
      const data = await $fetch<CategoriasPayload>('/api/categorias') // { tree, indexById }
      return { items: normalizeRoots(data.tree) }
    },
    { server: true, dedupe: 'defer', default: () => ({ items: [] }) }
  )
}

