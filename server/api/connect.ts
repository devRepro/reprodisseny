// server/api/sharepoint/connect.ts
import { defineEventHandler } from 'h3'
import axios from 'axios'
import qs from 'qs'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const tenantId = config.tenantId
  const clientId = config.clientId
  const clientSecret = config.microsoftGraphClientSecret

  try {
    // 1. Obtener token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    const accessToken = tokenResponse.data.access_token

    // 2. Consultar el sitio "retyling"
    const siteResponse = await axios.get(
      'https://graph.microsoft.com/v1.0/sites/reprodisseny.sharepoint.com:/sites/retyling',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    // 3. Confirmar que puedes acceder al ID de la lista
    const listResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/sites/${siteResponse.data.id}/lists`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    return {
      status: 'ok',
      siteId: siteResponse.data.id,
      siteUrl: siteResponse.data.webUrl,
      lists: listResponse.data.value.map((list: any) => ({
        id: list.id,
        name: list.name,
        displayName: list.displayName
      }))
    }
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message)
    return {
      status: 'error',
      message: error.message,
      details: error.response?.data || error
    }
  }
})
