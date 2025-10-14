// server/api/gbp/debug/access-token.get.ts   ← USO TEMPORAL (BORRAR AL FINAL)
// Descubre account/location y te devuelve las líneas para .env.
// Query opcionales:
//   ?account=accounts/123           → fuerza cuenta
//   ?location=locations/456         → fuerza ubicación
//   ?title=Nombre%20Exacto          → filtra por título
//   ?storeCode=BCN-01               → filtra por storeCode
//   ?save=1                         → guarda en storage (setAccountId/setLocationId)

import {
  getValidAccessToken,
  setAccountId,
  setLocationId
} from '~/server/utils/gbp'

function extractActivationUrl(e: any) {
  const links = e?.data?.error?.details?.find?.((d: any) =>
    typeof d?.['@type'] === 'string' && d['@type'].includes('Help')
  )?.links
  return Array.isArray(links) ? links[0]?.url : undefined
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const save = q.save === '1'

  // 1) token
  const token = await getValidAccessToken()
  const headers = { Authorization: `Bearer ${token}` }

  // 2) cuentas (Account Management v1)
  let accountsRes: any
  try {
    accountsRes = await $fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { headers })
  } catch (e: any) {
    const activationUrl = extractActivationUrl(e)
    throw createError({
      statusCode: e?.statusCode || 403,
      statusMessage: e?.data?.error?.message || 'No se pudo listar cuentas',
      data: {
        hint: 'Habilita "My Business Account Management API" en el mismo proyecto del OAuth y vuelve a intentar.',
        activationUrl
      }
    })
  }
  const accounts = accountsRes?.accounts || []
  if (!accounts.length) {
    throw createError({ statusCode: 404, statusMessage: 'No se encontraron cuentas para este usuario.' })
  }
  let accountName =
    (q.account as string) ||
    accounts[0]?.name // "accounts/123..."

  // 3) locations (Business Information v1)
  let locationsRes: any
  try {
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`)
    url.searchParams.set('readMask', 'name,title,storeCode,metadata')
    url.searchParams.set('pageSize', '100')
    locationsRes = await $fetch(url.toString(), { headers })
  } catch (e: any) {
    const activationUrl = extractActivationUrl(e)
    throw createError({
      statusCode: e?.statusCode || 403,
      statusMessage: e?.data?.error?.message || 'No se pudo listar ubicaciones',
      data: {
        hint: 'Habilita "My Business Business Information API" (v1) y verifica permisos/scope (business.manage).',
        activationUrl
      }
    })
  }

  const locations = locationsRes?.locations || []
  if (!locations.length) {
    throw createError({ statusCode: 404, statusMessage: 'No se encontraron ubicaciones en esa cuenta.' })
  }

  // Selección de location: por query (location/title/storeCode) o la primera
  let locationName = (q.location as string) || ''
  if (!locationName) {
    const title = (q.title as string) || ''
    const storeCode = (q.storeCode as string) || ''
    const found = locations.find((l: any) =>
      (title && l.title?.toLowerCase() === title.toLowerCase()) ||
      (storeCode && l.storeCode === storeCode)
    )
    if (found?.name) locationName = found.name
  }
  if (!locationName) locationName = locations[0].name // fallback

  // 4) (opcional) guarda en tu storage de servidor
  if (save) {
    await setAccountId(accountName)
    await setLocationId(locationName)
  }

  // 5) respuesta útil: token preview + líneas para .env + listados
  return {
    // ⚠️ no exponemos el token completo; si lo necesitas, cambia a devolverlo explícito temporalmente
    access_token_preview: token.slice(0, 12) + '…',
    env_lines: [
      `NUXT_GBP_ACCOUNT=${accountName}`,
      `NUXT_GBP_LOCATION=${locationName}`
    ],
    selected: { account: accountName, location: locationName },
    accounts: accounts.map((a: any) => ({
      name: a.name,                // "accounts/123"
      accountName: a.accountName,  // si viene
      type: a.type                 // PERSONAL / LOCATION_GROUP...
    })),
    locations: locations.map((l: any) => ({
      name: l.name, title: l.title, storeCode: l.storeCode
    })),
    note: 'Copia env_lines en tu .env. Si llamas con ?save=1, además se guardan en el storage del servidor.'
  }
})
