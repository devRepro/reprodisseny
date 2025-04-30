import { defineStore } from 'pinia'

export const useCategoriasStore = defineStore('categorias', {
  state: () => ({
    menu: [] as any[],
    loaded: false
  }),
  actions: {
    async fetchCategorias() {
      if (this.loaded) return
      const raw = await queryCollection('categorias')
        .where('type', '=', 'categoria')
        .get()

      this.menu = raw.map((cat: any) => ({
        ...cat,
        children: cat.children?.map((c: any) => ({
          ...c,
          children: c.children || []
        })) || []
      }))
      this.loaded = true
    }
  }
})
