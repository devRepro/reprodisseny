// server/api/gbp/locations.get.ts
import { getCookie, createError } from 'h3'
import { fetchWithBackoff } from '~/server/utils/googleFetch'

type UiLocation = { id: string; title: string; placeId?: string }

export default defineCachedEventHandler(async (event) => {
  const accessToken = getCookie(event, 'gbp_access_token')
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }
  const headers = { Authorization: `Bearer ${accessToken}` }
  const config = useRuntimeConfig()

  // 0) Atajo total: forzar una ubicación desde .env (recomendado en producción)
  // .env -> NUXT_GBP_LOCATION="accounts/XXX/locations/YYY"
  // opcional: NUXT_PUBLIC_GBP_PLACE_ID="ChIJA_sYIVi9pBIRfR_wJhifP-o"
  const envLocation = (config.public?.gbpLocation || config.gbpLocation) as string | undefined
  const envPlaceId  = (config.public?.gbpPlaceId  || config.gbpPlaceId)  as string | undefined
  if (envLocation) {
    return {
      locations: [{ id: envLocation, title: 'Mi negocio', placeId: envPlaceId }] as UiLocation[]
    }
  }

  // 1) SIN accounts.list: usamos el comodín "-" para listar todas las ubicaciones del usuario
  // Doc: GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/-/locations
  //      con readMask requerido (por ejemplo: name,displayName,placeId)
  const url = 'https://mybusinessbusinessinformation.googleapis.com/v1/accounts/-/locations' +
              '?readMask=name,displayName,placeId&pageSize=100'

  const res = await fetchWithBackoff<{ locations?: { name: string; displayName?: string; placeId?: string }[] }>(
    url,
    { headers }
  )

  let locations: UiLocation[] = (res.locations ?? []).map(l => ({
    id: l.name,
    title: l.displayName ?? '',
    placeId: l.placeId
  }))

  // 2) (Opcional) si definiste un placeId en .env pública, filtramos aquí
  if (!locations.length) return { locations }
  if (envPlaceId) {
    const match = locations.find(l => l.placeId === envPlaceId)
    if (match) locations = [match]
  }

  return { locations }
}, {
  // cachea el endpoint para evitar picos por HMR / navegación
  maxAge: 60 * 15, // 15 min
  swr: true,
  varies: ['cookie']
})

