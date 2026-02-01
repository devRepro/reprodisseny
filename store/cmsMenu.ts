export const useCmsMenuStore = defineStore("cmsMenu", () => {
    const items = ref<any[] | null>(null)
    const loadedAt = ref(0)
  
    async function ensureLoaded() {
      if (items.value) return
      const res = await $fetch("/api/cms/categories")
      items.value = (res as any)?.items ?? res
      loadedAt.value = Date.now()
    }
  
    return { items, loadedAt, ensureLoaded }
  })
  