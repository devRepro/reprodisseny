// server/api/sharepoint/get-site-and-lists.ts
import { defineEventHandler } from 'h3'
import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import 'isomorphic-fetch'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const credential = new ClientSecretCredential(
    config.tenantId,
    config.clientId,
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
    const site = await graphClient.api('/sites/reprodisseny.sharepoint.com:/sites/retyling').get()
    const lists = await graphClient.api(`/sites/${site.id}/lists`).get()

    return {
      status: 'ok',
      siteId: site.id,
      siteUrl: site.webUrl,
      lists: lists.value.map((list: any) => ({
        id: list.id,
        name: list.name,
        displayName: list.displayName
      }))
    }
  } catch (error: any) {
    console.error('❌ Error al obtener siteId o listas:', error.response?.data || error.message)
    return {
      status: 'error',
      message: error.message,
      details: error.response?.data
    }
  }
})
