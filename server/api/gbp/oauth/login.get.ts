// /server/api/gbp/oauth/login.get.ts
import { defineEventHandler, getQuery, sendRedirect } from 'h3'
export default defineEventHandler(async (event) => {
  const { returnTo = '/' } = getQuery(event) as { returnTo?: string }
  const safe =
    typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
      ? returnTo
      : '/'
  return sendRedirect(event, `/api/gbp/oauth/start?returnTo=${encodeURIComponent(safe)}`)
})
