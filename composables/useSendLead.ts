// composables/useSendLead.ts
import { ref } from 'vue'

export interface LeadPayload {
  producto: string
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  cantidad?: number | string
  mensaje?: string
  origen?: string
  utm?: Record<string, string>
  archivos?: File[]        // ignorado por ahora
  extra?: Record<string, any>
}

export function useSendLead() {
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)

  const sendLead = async (payload: LeadPayload) => {
    isLoading.value = true
    success.value = false
    error.value = null
    try {
      // Enviamos JSON (sin email, sin archivos)
      const { data, error: spErr } = await useFetch('/api/crm/leads', {
        method: 'POST',
        body: {
          ...payload,
          sourceUrl: process.client ? window.location.href : undefined
        }
      })
      if (spErr.value) {
        // Muestra errores de validación o de Graph
        const msg = (spErr.value.data?.statusMessage) || spErr.value.message || 'Error guardando en SharePoint'
        throw new Error(msg)
      }
      success.value = true
      return data.value
    } catch (e: any) {
      error.value = e?.message || 'Error guardando en SharePoint'
    } finally {
      isLoading.value = false
    }
  }

  return { sendLead, isLoading, error, success }
}
