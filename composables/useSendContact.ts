import { ref } from "vue"
import { useNotify } from "./useNotify"
import { contactPayloadSchema, CONTACT_SUBMISSION_ERROR } from "../shared/schemas/contact"
import { getConfirmedContactResponse } from "../utils/contactResponse"
import { getPriceRequestErrorMessage } from "../utils/priceRequestError"

export interface ContactPayload {
  nombre: string
  email: string
  telefono?: string | null
  codigoPostal?: string | null
  consulta: string
  consent: boolean
  origen?: string
  utm?: Record<string, string>
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

export function useSendContact() {
  const isLoading = ref(false)
  const success = ref(false)
  const error = ref<string | null>(null)
  const notify = useNotify()

  const sendContact = async (payload: ContactPayload) => {
    if (isLoading.value || success.value) return null

    error.value = null
    if (cleanString(payload.website)) {
      error.value = CONTACT_SUBMISSION_ERROR
      return null
    }

    isLoading.value = true
    success.value = false
    error.value = null

    const body = {
      nombre: cleanString(payload.nombre),
      email: cleanString(payload.email),
      telefono: cleanString(payload.telefono) || null,
      codigoPostal: cleanString(payload.codigoPostal) || null,
      consulta: cleanString(payload.consulta),
      consent: payload.consent,

      origen: cleanString(payload.origen) || "contact-page",
      utm: payload.utm ?? {},
      tracking: payload.tracking ?? null,
      sourceUrl: cleanString(payload.sourceUrl) || getFallbackSourceUrl(),

      website: cleanString(payload.website),
    }

    try {
      const parsed = contactPayloadSchema.safeParse(body)
      if (!parsed.success) {
        error.value = "Revisa los campos de la solicitud antes de enviarla."
        return null
      }

      const request = $fetch<unknown>("/api/cms/contact", {
        method: "POST",
        body: parsed.data,
        retry: 0,
      }).then((value) => {
        const confirmed = getConfirmedContactResponse(value)
        if (!confirmed) throw new Error("Unconfirmed contact response")
        return confirmed
      })

      // The notification handle is not the HTTP promise.
      notify.promise(request, {
        loading: "Enviando solicitud…",
        success: (res) => res.duplicated ? "La consulta ya estaba registrada" : "Mensaje enviado",
        error: (e) => getPriceRequestErrorMessage(e),
      })

      const res = await request
      success.value = true
      return res
    } catch (e: unknown) {
      error.value = getPriceRequestErrorMessage(e)
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
