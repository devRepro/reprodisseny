import { ref } from "vue"
import { useNotify } from "@/composables/useNotify"

export interface ContactPayload {
  nombre: string
  email: string
  telefono?: string | null
  codigoPostal?: string | null
  consulta: string
  consent: boolean
  origen?: string
  utm?: Record<string, string> | null
  tracking?: Record<string, unknown> | null
  sourceUrl?: string | null
  website?: string | null // honeypot
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getFallbackSourceUrl() {
  if (!import.meta.client) return ""

  return window.location.href
}

function getErrorMessage(error: any) {
  return (
    error?.data?.message ||
    error?.data?.statusMessage ||
    error?.statusMessage ||
    error?.message ||
    "Error al enviar"
  )
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

    const body = {
      nombre: cleanString(payload.nombre),
      email: cleanString(payload.email),
      telefono: cleanString(payload.telefono) || null,
      codigoPostal: cleanString(payload.codigoPostal) || null,
      consulta: cleanString(payload.consulta),
      consent: Boolean(payload.consent),

      origen: cleanString(payload.origen) || "contact-page",
      utm: payload.utm ?? {},
      tracking: payload.tracking ?? null,
      sourceUrl: cleanString(payload.sourceUrl) || getFallbackSourceUrl(),

      website: cleanString(payload.website),
    }

    try {
      const request = $fetch("/api/cms/contact", {
        method: "POST",
        body,
      })

      const res = await notify.promise(request, {
        loading: "Enviando solicitud…",
        success: "Mensaje enviado",
        error: (e) => getErrorMessage(e),
      })

      success.value = true
      return res
    } catch (e: any) {
      const message = getErrorMessage(e)

      error.value = message
      notify.error("No se pudo enviar", message)

      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    sendContact,
    isLoading,
    error,
    success,
  }
}
