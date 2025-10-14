// server/api/gbp/discover.get.ts
import {
    getValidAccessToken,
    setAccountId,
    setLocationId
  } from '~/server/utils/gbp'
  
  export default defineEventHandler(async (event) => {
    const accessToken = await getValidAccessToken()
    const headers = { Authorization: `Bearer ${accessToken}` }
  
    // 1) LISTAR CUENTAS
    const accountsRes: any = await $fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers }
    )
    const accounts = accountsRes?.accounts ?? []
  
    // Permite forzar una cuenta vía query (?account=accounts/123)
    const q = getQuery(event)
    let accountName = (q.account as string) || accounts[0]?.name // "accounts/123..."
    if (!accountName) {
      throw createError({ statusCode: 404, statusMessage: 'No se encontraron cuentas para este usuario.' })
    }
  
    // 2) LISTAR LOCATIONS DE ESA CUENTA
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`)
    url.searchParams.set('readMask', 'name,title,storeCode,metadata')
    url.searchParams.set('pageSize', '100')
  
    const locationsRes: any = await $fetch(url.toString(), { headers })
    const locations = locationsRes?.locations ?? []
  
    // Selección por query si quieres (opcional)
    // ?location=locations/987           (name completo)
    // ?title=Mi%20Negocio               (por título exacto)
    // ?storeCode=BCN-01                 (si usas storeCode)
    let locationName = (q.location as string) || ''
    if (!locationName) {
      const title = (q.title as string) || ''
      const storeCode = (q.storeCode as string) || ''
      const found = locations.find((l: any) =>
        (title && l.title?.toLowerCase() === title.toLowerCase()) ||
        (storeCode && l.storeCode === storeCode)
      )
      if (found?.name) locationName = found.name // "locations/987..."
    }
    if (!locationName && locations.length === 1) {
      locationName = locations[0].name
    }
  
    // 3) GUARDAR EN STORAGE SI TENEMOS AMBOS
    if (accountName && locationName) {
      await setAccountId(accountName)
      await setLocationId(locationName)
    }
  
    // 4) RESPUESTA ÚTIL (incluye listas por si quieres elegir manualmente)
    return {
      selected: {
        account: accountName || null,
        location: locationName || null
      },
      accounts: accounts.map((a: any) => ({
        name: a.name,                // "accounts/123"
        accountName: a.accountName,  // nombre legible si viene
        type: a.type                 // PERSONAL/LOCATION_GROUP...
      })),
      locations: locations.map((l: any) => ({
        name: l.name,         // "locations/987"
        title: l.title,
        storeCode: l.storeCode,
        metadata: l.metadata  // por si quieres ver estado de verificación, etc.
      }))
    }
  })
  