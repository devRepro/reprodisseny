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
  archivos?: File[]
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
      const hasFiles = Array.isArray(payload.archivos) && payload.archivos.length > 0
      const body: any = hasFiles ? new FormData() : { ...payload }

      if (hasFiles) {
        body.set('producto', payload.producto)
        body.set('nombre', payload.nombre)
        body.set('email', payload.email)
        if (payload.telefono) body.set('telefono', payload.telefono)
        if (payload.empresa) body.set('empresa', payload.empresa)
        if (payload.cantidad != null) body.set('cantidad', String(payload.cantidad))
        if (payload.mensaje) body.set('mensaje', payload.mensaje)
        if (payload.origen) body.set('origen', payload.origen)
        if (payload.utm) body.set('utm', JSON.stringify(payload.utm))
        if (payload.extra) body.set('extra', JSON.stringify(payload.extra))
        payload.archivos!.forEach((f, i) => body.append('archivos', f, f.name || `file-${i}`))
      }

      // 1) Email
      const { data: emailRes, error: emailErr } = await useFetch('/api/send-lead', { method: 'POST', body })
      if (emailErr.value || (emailRes.value as any)?.status === 'error') {
        throw new Error((emailErr.value as any)?.message || (emailRes.value as any)?.message || 'Error enviando el correo')
      }

      // 2) SharePoint
      const { data: spRes, error: spErr } = await useFetch('/api/add-lead', { method: 'POST', body })
      if (spErr.value || (spRes.value as any)?.status === 'error') {
        throw new Error((spErr.value as any)?.message || (spRes.value as any)?.message || 'Error guardando en SharePoint')
      }

      success.value = true
      return { email: emailRes.value, sharepoint: spRes.value }
    } catch (e: any) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { sendLead, isLoading, error, success }
}
