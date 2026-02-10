// server/utils/googleF// server/utils/googleFetch.server.ts
import { $fetch, type FetchOptions } from "ofetch"

type BackoffOptions = {
  retries?: number
  baseDelay?: number
  maxDelay?: number
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchWithBackoff<T>(
  url: string,
  opts: FetchOptions = {},
  { retries = 3, baseDelay = 400, maxDelay = 6000 }: BackoffOptions = {}
): Promise<T> {
  let attempt = 0
  let lastErr: any

  while (attempt <= retries) {
    try {
      return await $fetch<T>(url, opts)
    } catch (err: any) {
      const status = err?.response?.status || err?.status || err?.statusCode
      // retry only on rate limit + transient upstream
      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = Math.min(baseDelay * 2 ** attempt, maxDelay) + Math.random() * 250
        await sleep(delay)
        attempt++
        lastErr = err
        continue
      }
      throw err
    }
  }

  throw lastErr
}

  