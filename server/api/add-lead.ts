import { defineEventHandler, readBody } from 'h3'
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

  const body = await readBody(event)

  if (!body?.nombre || !body?.email || !body?.producto) {
    return {
      status: 'error',
      message: 'Faltan campos obligatorios'
    }
  }

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

    if (!listResponse.data) {
      throw new Error('La lista especificada no se encontró');
    }

    // Paso 3: enviar lead a SharePoint
    const lead = {
      Title: body.producto || 'Solicitud sin título',
      Nombre: body.nombre,
      Email: body.email,
      Telefono: body.telefono || '',
      Empresa: body.empresa || '',
      Cantidad: body.cantidad || '',
      Comentario: body.comentario || ''
    }

    const response = await axios.post(
      `${listUrl}/items?expand=fields`,
      { fields: lead },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      status: 'ok',
      message: 'Lead guardado correctamente',
      itemId: response.data.id
    }
  } catch (error: any) {
    console.error('❌ Error al guardar lead en SharePoint:', error.response?.data || error)
    return {
      status: 'error',
      message: error?.response?.data?.message || 'Error al guardar en SharePoint',
      details: error?.response?.data
    }
  }
})
