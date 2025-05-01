// composables/useSendLead.ts

import { ref } from 'vue'
import { $fetch, FetchError } from 'ofetch'

interface SendLeadResponse {
  success: boolean
  message?: string
}

export const useSendLead = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  const sendLead = async (payload: Record<string, any>) => {
    isLoading.value = true
    error.value = null
    success.value = false

    try {
      const res = await $fetch<SendLeadResponse>('/api/send-lead', {
        method: 'POST',
        body: payload
      })

      if (res.success) {
        success.value = true
      } else {
        error.value = res.message || 'El servidor indicó un error'
      }
    } catch (err) {
      if (err instanceof FetchError) {
        error.value = err.data?.message || 'Error inesperado del servidor'
      } else {
        error.value = (err as Error).message || 'Error desconocido'
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    sendLead,
    isLoading,
    error,
    success
  }
}
