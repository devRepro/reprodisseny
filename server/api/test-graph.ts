// server/api/test-graph.ts
import { defineEventHandler } from 'h3'
import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import 'isomorphic-fetch'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const credential = new ClientSecretCredential(
    config.public.tenantId,
    config.public.clientId,
    config.microsoftGraphClientSecret
  )

  const graphClient = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default')
        return token.token
      }
    }
  })

  try {
    // Ejemplo: obtener nombre del sitio raíz de SharePoint
    const siteInfo = await graphClient.api('/sites/root').get()
    return {
      status: 'ok',
      site: {
        id: siteInfo.id,
        name: siteInfo.name,
        webUrl: siteInfo.webUrl
      }
    }
  } catch (error) {
    console.error('❌ Error en llamada Graph:', error)
    return { status: 'error', message: 'No se pudo conectar a Microsoft Graph', error }
  }
})
