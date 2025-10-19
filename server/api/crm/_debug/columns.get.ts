import { ofetch } from 'ofetch'
import { getGraphToken, resolveSiteId, resolveListId } from '~/server/utils/graph'

export default defineEventHandler(async (event) => {
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const listId = await resolveListId(event)

  const url = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists/${encodeURIComponent(listId)}/columns?$select=name,displayName,hidden,readOnly`
  const res = await ofetch<any>(url, { headers: { Authorization: `Bearer ${token}` } })
  return {
    siteId, listId,
    columns: (res?.value ?? []).map((c: any) => ({
      name: c.name, displayName: c.displayName, hidden: c.hidden, readOnly: c.readOnly
    }))
  }
})
