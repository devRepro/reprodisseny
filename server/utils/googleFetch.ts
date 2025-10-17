// server/utils/googleFetch.ts
export async function fetchWithBackoff<T>(
    url: string,
    opts: any,
    { retries = 5, baseDelay = 500, maxDelay = 8000 } = {}
  ): Promise<T> {
    let attempt = 0, lastErr: any
    while (attempt <= retries) {
      try {
        return await $fetch<T>(url, opts)
      } catch (err: any) {
        const status = err?.status || err?.statusCode
        if (status === 429 || (status >= 500 && status < 600)) {
          const delay = Math.min(baseDelay * 2 ** attempt, maxDelay) + Math.random() * 250
          await new Promise(r => setTimeout(r, delay))
          attempt++; lastErr = err; continue
        }
        throw err
      }
    }
    throw lastErr
  }
  
  