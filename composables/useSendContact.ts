import { ref } from "vue"
import { useNotify } from "@/composables/useNotify"

export interface ContactPayload {
  nombre: string
  email: string
  telefono?: string | null
  consulta: string
  consent: boolean
  origen?: string
  utm?: Record<string, any>
  website?: string // honeypot
}

export function useSendContact() {
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const notify = useNotify()

  const sendContact = async (payload: ContactPayload) => {
    isLoading.value = true
    success.value = false
    error.value = null

    try {
      const p = $fetch("/api/cms/contact", {
        method: "POST",
        body: {
          ...payload,
          sourceUrl: process.client ? location.href : undefined,
        },
      })

      const res = await notify.promise(p, {
        loading: "Enviando solicitud…",
        success: "Mensaje enviado",
        error: (e) => e?.data?.statusMessage || e?.message || "Error al enviar",
      })

      success.value = true
      return res
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || "Error"
      notify.error("No se pudo enviar", error.value)
    } finally {
      isLoading.value = false
    }
  }

  return { sendContact, isLoading, error, success }
}
