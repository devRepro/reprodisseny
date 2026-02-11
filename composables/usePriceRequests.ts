import { ref } from "vue"

type CreatePriceRequestInput = Record<string, any>

export function usePriceRequests() {
  const pending = ref(false)
  const error = ref<unknown>(null)

  async function create(payload: CreatePriceRequestInput) {
    pending.value = true
    error.value = null
    try {
      // Ajusta el endpoint si tu API se llama distinto
      return await $fetch("/api/price-requests", {
        method: "POST",
        body: payload,
      })
    } catch (e) {
      error.value = e
      throw e
    } finally {
      pending.value = false
    }
  }

  return { create, pending, error }
}
