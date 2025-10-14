// server/utils/gbp.ts
import { useStorage, createError, useRuntimeConfig } from '#imports'
import type { GbpReview } from '~/types/gbp'

type Tokens = {
  access_token: string
  refresh_token?: string
  expiry_date: number // epoch ms
  token_type?: string
  scope?: string
}

const TOKENS_KEY = 'gbp:tokens'
const ACCOUNT_KEY = 'gbp:account'
const LOCATION_KEY = 'gbp:location'

export async function saveTokens(t: Tokens) {
  const storage = useStorage('data')
  await storage.setItem(TOKENS_KEY, t)
}
export async function loadTokens(): Promise<Tokens | null> {
  const storage = useStorage('data')
  return (await storage.getItem(TOKENS_KEY)) as Tokens | null
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = await loadTokens()
  if (!tokens) throw createError({ statusCode: 401, statusMessage: 'GBP tokens missing' })
  if (Date.now() < tokens.expiry_date - 60_000) return tokens.access_token

  if (!tokens.refresh_token) {
    throw createError({ statusCode: 401, statusMessage: 'Refresh token missing' })
  }
  const { gbp } = useRuntimeConfig()
  const res: any = await $fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      client_id: gbp.clientId,
      client_secret: gbp.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token
    }
  })
  const next: Tokens = {
    ...tokens,
    access_token: res.access_token,
    expiry_date: Date.now() + (res.expires_in ?? 3600) * 1000
  }
  await saveTokens(next)
  return next.access_token
}

export async function setAccountId(accountName: string) {
  const storage = useStorage('data')
  await storage.setItem(ACCOUNT_KEY, accountName) // "accounts/123"
}
export async function getAccountId(): Promise<string | null> {
  const storage = useStorage('data')
  const { gbp } = useRuntimeConfig()
  return (await storage.getItem(ACCOUNT_KEY)) as string | null || gbp.account || null
}
export async function setLocationId(locationName: string) {
  const storage = useStorage('data')
  await storage.setItem(LOCATION_KEY, locationName) // "locations/456"
}
export async function getLocationId(): Promise<string | null> {
  const storage = useStorage('data')
  const { gbp } = useRuntimeConfig()
  return (await storage.getItem(LOCATION_KEY)) as string | null || gbp.location || null
}

// ayudante: pasar "FIVE" -> 5, etc.
export function ratingToNumber(s?: 'ONE'|'TWO'|'THREE'|'FOUR'|'FIVE'): number {
  return s ? (['ONE','TWO','THREE','FOUR','FIVE'].indexOf(s) + 1) : 0
}
