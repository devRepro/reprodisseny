// ~/server/services/priceRequestService.ts
import { getGraphClient } from '~/server/utils/graphClient.server'
import { getSharePointConfig } from '~/server/utils/sharepointConfig'
import {
  getListColumns,
  buildDict,
  pick,
  FIELD_ALIASES,
} from '~/server/utils/spFieldMap'

export interface PublicPriceRequestInput {
  productTitle: string
  productSlug?: string
  productUrl?: string

  name: string
  email: string
  phone?: string
  company?: string

  message?: string
  extraFields?: Record<string, string | number | null | undefined>
}

/**
 * Crea una petición de precio en la lista de SharePoint
 * usando los alias de spFieldMap (no dependemos de nombres internos feos).
 */
export async function createPriceRequestFromPublicWeb(
  event: any,
  input: PublicPriceRequestInput
) {
  const { siteId, priceRequestsListId } = getSharePointConfig()
  if (!priceRequestsListId) {
    throw new Error('No hay priceRequestsListId en getSharePointConfig()')
  }

  const client = await getGraphClient(event, { mode: 'app' })

  // 1) Detectar columnas de la lista y construir diccionario
  const { columns } = await getListColumns(event)
  const dict = buildDict(columns)

  // 2) Resolver internal names por alias
  const titleField =
    pick(dict, ...FIELD_ALIASES.title) ?? 'Title' // fallback seguro
  const emailField =
    pick(dict, ...FIELD_ALIASES.email) ?? 'Email'
  const productField =
    pick(dict, ...FIELD_ALIASES.product) ?? 'Product'
  const fechaField = pick(dict, ...FIELD_ALIASES.fecha)
  const jsonField = pick(dict, ...FIELD_ALIASES.json)
  const resumenField = pick(dict, ...FIELD_ALIASES.resumen)

  const nowIso = new Date().toISOString()

  // 3) Montamos campos base
  const fields: Record<string, any> = {
    [titleField]: input.name,
    [emailField]: input.email,
    [productField]: input.productTitle,
  }

  if (fechaField) {
    fields[fechaField] = nowIso
  }

  // Resumen corto (comentario libre + algo de contexto)
  if (resumenField) {
    fields[resumenField] =
      input.message ||
      `Solicitud desde web para: ${input.productTitle}`
  }

  // 4) Si tienes columna JSON, guardamos TODO el payload ahí
  if (jsonField) {
    fields[jsonField] = JSON.stringify(
      {
        productTitle: input.productTitle,
        productSlug: input.productSlug,
        productUrl: input.productUrl,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        message: input.message,
        extras: input.extraFields ?? {},
        source: 'web-productos',
        receivedAt: nowIso,
      },
      null,
      2
    )
  }

  // 5) Crear item en la lista
  const res = await client
    .api(`/sites/${siteId}/lists/${priceRequestsListId}/items`)
    .post({ fields })

  return res
}
