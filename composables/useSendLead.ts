import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify' // o usa $notify del plugin

export function useSendLead() {
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const notify = useNotify()

  const sendLead = async (payload: any) => {
    isLoading.value = true
    success.value = false
    error.value = null
    try {
      const p = $fetch('/api/crm/leads', { method: 'POST', body: { ...payload, sourceUrl: process.client ? location.href : undefined } })
      const res = await notify.promise(p, {
        loading: 'Enviando solicitud…',
        success: () => 'Solicitud enviada',
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
