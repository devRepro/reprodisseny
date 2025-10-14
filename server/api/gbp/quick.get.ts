// server/api/gbp/quick.get.ts
// Uso: abre /api/gbp/quick en el navegador.
// - Si no hay tokens → redirige a Google para login.
// - Si hay tokens → lista cuentas + locations, elige una, y muestra texto plano con líneas para .env.
//   Filtros opcionales por query:
//     ?account=accounts/123
//     ?location=locations/456
//     ?title=Nombre%20Exacto
//     ?storeCode=BCN-01
//     ?save=1  → guarda en storage para que /api/gbp/reviews ya funcione

import {
    getValidAccessToken,
    setAccountId,
    setLocationId
  } from '~/server/utils/gbp'
  
  export default defineEventHandler(async (event) => {
    // 1) intenta tener token; si falta, manda a login
    let token: string
    try {
      token = await getValidAccessToken()
    } catch {
      // no hay tokens → login
      const { gbp } = useRuntimeConfig()
      const params = new URLSearchParams({
        client_id: gbp.clientId,
        redirect_uri: gbp.redirectUri,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
        scope: 'https://www.googleapis.com/auth/business.manage',
        // tras login, vuelve aquí
        state: '/api/gbp/quick?connected=1'
      })
      return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302)
    }
  
    const q = getQuery(event)
    const save = q.save === '1'
    const headers = { Authorization: `Bearer ${token}` }
  
    // 2) lista cuentas (Account Management v1)
    let accountsRes: any
    try {
      accountsRes = await $fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { headers })
    } catch (e: any) {
      setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
      return [
        '❌ No se pudo listar cuentas (My Business Account Management API).',
        e?.data?.error?.message || String(e),
        '',
        'Activa la API en el mismo proyecto de tu OAuth:',
        'https://console.developers.google.com/apis/api/mybusinessaccountmanagement.googleapis.com',
      ].join('\n')
    }
    const accounts = accountsRes?.accounts || []
    if (!accounts.length) {
      setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
      return 'No se encontraron cuentas para este usuario.'
    }
    let accountName =
      (q.account as string) ||
      accounts[0].name // "accounts/123"
  
    // 3) lista locations (Business Information v1)
    let locationsRes: any
    try {
      const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`)
      url.searchParams.set('readMask', 'name,title,storeCode,metadata')
      url.searchParams.set('pageSize', '100')
      locationsRes = await $fetch(url.toString(), { headers })
    } catch (e: any) {
      setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
      return [
        '❌ No se pudo listar ubicaciones (Business Information API v1).',
        e?.data?.error?.message || String(e),
        '',
        'Activa la API en el mismo proyecto de tu OAuth:',
        'https://console.developers.google.com/apis/api/mybusinessbusinessinformation.googleapis.com',
      ].join('\n')
    }
    const locations = locationsRes?.locations || []
    if (!locations.length) {
      setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
      return 'No se encontraron ubicaciones en esa cuenta.'
    }
  
    // 4) permite filtrar por query o coge la primera
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
  
    // 5) guarda si te interesa
    if (save) {
      await setAccountId(accountName)
      await setLocationId(locationName)
    }
  
    // 6) imprime TEXTO PLANO listo para copiar/pegar
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  
    const lines = [
      '# COPIA Y PEGA EN TU .env',
      `NUXT_GBP_ACCOUNT=${accountName}`,
      `NUXT_GBP_LOCATION=${locationName}`,
      '',
      'Cuentas disponibles:',
      ...accounts.map((a: any) => `- ${a.name}${a.accountName ? ` (${a.accountName})` : ''}${a.type ? ` [${a.type}]` : ''}`),
      '',
      'Ubicaciones disponibles:',
      ...locations.map((l: any) => `- ${l.name}${l.title ? ` (${l.title})` : ''}${l.storeCode ? ` [${l.storeCode}]` : ''}`),
      '',
      'Sugerencias:',
      '• Añade ?save=1 para guardarlos en el servidor y que /api/gbp/reviews funcione ya.',
      '• Filtros: ?account=accounts/123  ?location=locations/456  ?title=Nombre  ?storeCode=BCN-01'
    ]
    return lines.join('\n')
  })
  