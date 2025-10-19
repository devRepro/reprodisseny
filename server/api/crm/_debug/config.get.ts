import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
    const { ms, crm } = useRuntimeConfig(event) as any
    return {
      ms: {
        tenantId: !!ms?.tenantId,
        clientId: !!ms?.clientId,
        clientSecret: ms?.clientSecret ? '***' : false,
        siteId: ms?.siteId || null,
        siteHostname: ms?.siteHostname || null,
        sitePath: ms?.sitePath || null,
        listId: ms?.listId || null
      },
      crm
    }
  })
  