// composables/usePriceRequests.ts
import { ref } from "vue"
import { useNotify } from "@/composables/useNotify"

export type PriceRequestPayload = {
  website?: string | null // honeypot

  name: string
  email: string
  phone?: string | null
  company?: string | null
  message: string

  categorySlug: string
  product: {
    name: string
    slug?: string | null
    sku?: string | null
    url?: string | null
  }
  extras?: Record<string, unknown>

  consent: boolean
  sourceUrl: string
  utm?: Record<string, any> | null

  initialStatus?: string
}

export function usePriceRequests() {
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const notify = useNotify()

  const sendPriceRequest = async (payload: PriceRequestPayload) => {
    isLoading.value = true
    success.value = false
    error.value = null

    try {
      const p = $fetch("/api/price-requests", {
        method: "POST",
        body: payload,
      })

      const res = await notify.promise(p, {
        loading: "Enviando solicitud…",
        success: "Solicitud enviada",
        error: (e) => e?.data?.statusMessage || e?.message || "Error al enviar",
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

  return { sendPriceRequest, isLoading, error, success }
}
