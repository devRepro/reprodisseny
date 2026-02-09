import dotenv from "dotenv"
dotenv.config({ path: ".env.imports" })

import { Client } from "@microsoft/microsoft-graph-client"
import "isomorphic-fetch"
import { ClientSecretCredential } from "@azure/identity"

const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, SHAREPOINT_SITE_ID, SP_LIST_PRODUCTS_ID } = process.env

function graphClient() {
  const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET)
  return Client.init({
    authProvider: async (done) => {
      const token = await credential.getToken("https://graph.microsoft.com/.default")
      done(null, token.token)
    },
  })
}

const client = graphClient()

const res = await client
  .api(`/sites/${SHAREPOINT_SITE_ID}/lists/${SP_LIST_PRODUCTS_ID}/items`)
  .expand("fields")
  .top(5)
  .get()

console.log("Items devueltos:", res.value?.length || 0)

if (res.value?.length) {
  const it = res.value[0]
  console.log("Primer item id:", it.id)
  console.log("Claves fields:", Object.keys(it.fields || {}).slice(0, 50))
  console.log("fields (preview):", it.fields)
}
