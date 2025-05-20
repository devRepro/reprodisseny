import { defineStore } from 'pinia'
import type { Categoria } from '@/types'

export const useCategoriasStore = defineStore('categorias', {
  state: () => ({
    menu: [] as Categoria[],
    loaded: false
  }),

  actions: {
    async fetchCategorias() {
      if (this.loaded) return

      try {
        // ✅ Importación dinámica para evitar romper el cliente
        const { useFetchCategorias } = await import('~/composables/useFetchCategorias.server')
        const menu = await useFetchCategorias()

        this.menu = menu
        this.loaded = true
      } catch (err) {
        console.error('❌ Error al cargar categorías:', err)
        this.menu = []
        this.loaded = false
      }
    }
  }
})
