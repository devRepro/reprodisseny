// stores/categorias.ts
import { defineStore } from 'pinia'

import type { Categoria, Subcategoria, Producto } from '@/types'

export const useCategoriasStore = defineStore('categorias', {
  state: () => ({
    menu: [] as Categoria[],
    loaded: false
  }),

  actions: {
    async fetchCategorias() {
      if (this.loaded) return

      try {
        const raw = await queryCollection('categorias')
          .where('type', '=', 'categoria')
          .all()

        const sorted = raw.sort((a, b) =>
          a.nav?.localeCompare(b.nav ?? '') ?? 0
        )

        this.menu = sorted.map((cat: Categoria) => ({
          ...cat,
          children: (cat as Categoria)?.children?.map((sub: Subcategoria) => ({
            ...sub,
            children: (sub as Subcategoria)?.children?.map((p: Producto) => ({
              ...p
            })) || []
          })) || []
        }))

        this.loaded = true
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error)
        this.menu = []
        this.loaded = false
      }
    }
  }
})
