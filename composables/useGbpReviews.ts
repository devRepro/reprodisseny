// composables/useGbpReviews.ts
export function useGbpReviews() {
  const data = ref<{ averageRating?: number; total?: number; items: any[] } | null>(null)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    pending.value = true
    try {
      data.value = await $fetch('/api/gbp/reviews')
    } catch (e: any) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  onMounted(load)
  return { data, pending, error, refresh: load }
}

