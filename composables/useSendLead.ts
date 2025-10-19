// composables/useSendLead.ts
import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
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
  // NUEVO:
  productData?: any        // frontmatter completo del producto
  // tus campos dinámicos (color, texto, etc.) vendrán como extras en el payload
}

export function useSendLead() {
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const notify = useNotify()

  const sendLead = async (payload: LeadPayload & Record<string, any>) => {
    isLoading.value = true
    success.value = false
    error.value = null
    try {
      // normaliza cantidad si viene string
      if (payload.cantidad != null && typeof payload.cantidad === 'string') {
        const n = Number(payload.cantidad); if (!Number.isNaN(n)) (payload as any).cantidad = n
      }

      const p = $fetch('/api/crm/leads', {
        method: 'POST',
        body: { ...payload, sourceUrl: process.client ? location.href : undefined }
      })

      const res = await notify.promise(p, {
        loading: 'Enviando solicitud…',
        success: 'Solicitud enviada',
        error:   (e) => e?.data?.statusMessage || e?.message || 'Error al enviar'
      })
      success.value = true
      return res
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Error'
      notify.error('No se pudo enviar', error.value)
    } finally {
      isLoading.value = false
    }
  }
  return { sendLead, isLoading, error, success }
}
