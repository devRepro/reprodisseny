// server/utils/rateLimit.server.ts
import { useStorage } from "#imports"
import crypto from "node:crypto"

/**
 * Hash de IP (para no guardar IPs en claro).
 */
export function ipHash(ip: string) {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24)
}

/**
 * Rate limit simple por ventana fija:
 * - key: identificador (p.ej. "price-req:<iphash>")
 * - limit: número máximo de requests dentro de la ventana
 * - windowSec: duración de la ventana en segundos
 *
 * Usa storage "cache" de Nitro (memoria/kv según runtime).
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const store = useStorage("cache")
  const now = Date.now()
  const bucket = Math.floor(now / (windowSec * 1000))
  const k = `rl:${key}:${bucket}`

  const v = (await store.getItem<number>(k)) ?? 0
  if (v >= limit) {
    return { ok: false as const, remaining: 0 }
  }

  await store.setItem(k, v + 1, { ttl: windowSec })
  return { ok: true as const, remaining: Math.max(0, limit - (v + 1)) }
}
