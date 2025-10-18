// server/api/gbp/locations.get.ts
import { getCookie, getHeader, createError } from 'h3'

type UiLocation = { id: string; title: string; placeId?: string }

export default defineCachedEventHandler(async (event) => {
  const accessToken = getCookie(event, 'gbp_access_token')
  if (!accessToken) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const config = useRuntimeConfig()
  const headers = { Authorization: `Bearer ${accessToken}` }

  // 0) Bypass total si tienes la sede fija en .env
  const envLocation = (config.public?.gbpPlaceId && config.gbpLocation) ? config.gbpLocation : config.gbpLocation
  const envPlaceId  = (config.public?.gbpPlaceId || config.gbpPlaceId) as string | undefined
  if (envLocation) {
    return { locations: [{ id: envLocation, title: 'Mi negocio', placeId: envPlaceId }] as UiLocation[] }
  }

  // 0.b) Kill-switch para dev: desactiva el listado mientras resuelves IDs
  if (config.gbpDisableList) {
    return { locations: [] as UiLocation[] }
  }

  // 1) Construye URL con quotaUser y pageSize pequeño
  const ip = getHeader(event, 'x-forwarded-for') || ''
  const quotaUser = encodeURIComponent(ip || getCookie(event, 'gbp_session') || 'anon')
  const url = 'https://mybusinessbusinessinformation.googleapis.com/v1/accounts/-/locations'
    + `?readMask=name,displayName,placeId&pageSize=25&quotaUser=${quotaUser}`

  // 2) Llama con backoff y captura 429 para degradar
  try {
    const res = await $fetch<{ locations?: { name: string; displayName?: string; placeId?: string }[] }>(url, { headers })
    let locations: UiLocation[] = (res.locations ?? []).map(l => ({
      id: l.name, title: l.displayName ?? '', placeId: l.placeId
    }))
    // (Opcional) filtra si definiste placeId público
    if (envPlaceId && locations.length) {
      const m = locations.find(l => l.placeId === envPlaceId)
      if (m) locations = [m]
    }
    return { locations }
  } catch (err: any) {
    const status = err?.status || err?.statusCode
    if (status === 429) {
      // Degrada sin romper la app (mejor mensaje en UI)
      return { locations: [] as UiLocation[] }
    }
    throw err
  }
}, {
  maxAge: 60 * 15,
  swr: true,
  varies: ['cookie']
})

