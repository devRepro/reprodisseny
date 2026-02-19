import { ref } from "vue"
import { useNotify } from "@/composables/useNotify"

export type CreatePriceRequestInput = Record<string, any>

export function usePriceRequests() {
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const notify = useNotify()

  const createPriceRequest = async (
    payload: CreatePriceRequestInput,
    endpoint = "/api/price-requests"
  ) => {
    isLoading.value = true
    success.value = false
    error.value = null

    try {
      const p = $fetch(endpoint, { method: "POST", body: payload })

      const res = await notify.promise(p, {
        loading: "Enviando solicitud…",
        success: (r: any) => r?.message || "Solicitud enviada",
        error: (e: any) => e?.data?.statusMessage || e?.message || "Error al enviar",
      })

      success.value = true
      return res
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || "Error"
      notify.error("No se pudo enviar", error.value)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { createPriceRequest, isLoading, error, success }
}
