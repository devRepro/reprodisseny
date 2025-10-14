import { saveTokens } from '~/server/utils/gbp'

export default defineEventHandler(async (event) => {
  const { gbp } = useRuntimeConfig()
  const { code, state } = getQuery(event)

  const token: any = await $fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      code,
      client_id: gbp.clientId,
      client_secret: gbp.clientSecret,
      redirect_uri: gbp.redirectUri,
      grant_type: 'authorization_code'
    }
  })

  await saveTokens({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: Date.now() + (token.expires_in ?? 3600) * 1000
  })

  // vuelve a donde te esperaba el "quick" (o a quick por defecto)
  const back = (typeof state === 'string' && state.startsWith('/')) ? state : '/api/gbp/quick?connected=1'
  return sendRedirect(event, back, 302)
})

