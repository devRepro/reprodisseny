import { defineEventHandler } from 'h3'
import axios from 'axios'
import qs from 'qs'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const {
    tenantId,
    clientId,
    microsoftGraphClientSecret,
    sharepointSiteId,
    sharepointListId
  } = config

  try {
    // Paso 1: obtener token
    const tokenRes = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: microsoftGraphClientSecret,
        scope: 'https://graph.microsoft.com/.default'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const accessToken = tokenRes.data.access_token

    // Paso 2: verificar la lista
    const listUrl = `https://graph.microsoft.com/v1.0/sites/${sharepointSiteId}/lists/${sharepointListId}`;
    const listResponse = await axios.get(listUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('List response:', listResponse.data);

    return {
      status: 'ok',
      message: 'Lista encontrada',
      listId: listResponse.data.id
    }
  } catch (error: any) {
    console.error('❌ Error al obtener la lista de SharePoint:', error.response?.data || error)
    return {
      status: 'error',
      message: error?.response?.data?.message || 'Error al obtener la lista de SharePoint',
      details: error?.response?.data
    }
  }
})
