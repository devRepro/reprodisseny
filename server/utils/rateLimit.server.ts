// ~/server/utils/rateLimit.server.ts
import { createHash } from "node:crypto"
import type { H3Event } from "h3"
import { getRequestHeader, setResponseHeader } from "h3"

type Bucket = {
  count: number
  resetAt: number // epoch ms
}

const store = new Map<string, Bucket>()

const CLEANUP_EVERY_MS = 30_000
let lastCleanup = 0

function now() {
  return Date.now()
}

function cleanupExpired(ts: number) {
  if (ts - lastCleanup < CLEANUP_EVERY_MS) return
  lastCleanup = ts
  for (const [k, v] of store.entries()) {
    if (v.resetAt <= ts) store.delete(k)
  }
}

function firstFromXff(xff: string) {
  // "client, proxy1, proxy2"
  return xff.split(",")[0]?.trim() || ""
}

/**
 * Obtiene la IP del cliente intentando cabeceras típicas de proxy/CDN.
 * Útil en Vercel/Azure/Cloudflare/etc.
 */
export function getClientIp(event: H3Event, trustProxy = true): string {
  if (trustProxy) {
    const cf = getRequestHeader(event, "cf-connecting-ip")
    if (cf) return String(cf).trim()

    const realIp = getRequestHeader(event, "x-real-ip")
    if (realIp) return String(realIp).trim()

    const xff = getRequestHeader(event, "x-forwarded-for")
    if (xff) {
      const ip = firstFromXff(String(xff))
      if (ip) return ip
    }
  }

  // fallback socket
  return String(event.node.req.socket?.remoteAddress || "").trim()
}

/**
 * Hash corto para no guardar IPs "en claro" en memoria/logs.
 * No es seguridad fuerte; es solo minimización de datos.
 */
export function ipHash(ip: string): string {
  const s = String(ip || "").trim().toLowerCase()
  return createHash("sha256").update(s).digest("hex").slice(0, 32)
}

export type RateLimitResult = {
  ok: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfterSec: number
}

/**
 * Rate limit en memoria.
 * @param key clave del bucket (ej: `price-req:${ipHash(ip)}`)
 * @param limit máximo de requests permitidas
 * @param windowSeconds ventana en segundos (ej: 600 = 10 min)
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const ts = now()
  cleanupExpired(ts)

  const windowMs = Math.max(1, Number(windowSeconds) * 1000)
  const safeLimit = Math.max(1, Number(limit))

  const bucketKey = String(key || "unknown").slice(0, 200)

  const existing = store.get(bucketKey)
  if (!existing || existing.resetAt <= ts) {
    const resetAt = ts + windowMs
    const next: Bucket = { count: 1, resetAt }
    store.set(bucketKey, next)

    return {
      ok: true,
      limit: safeLimit,
      remaining: Math.max(0, safeLimit - next.count),
      resetAt,
      retryAfterSec: 0,
    }
  }

  existing.count += 1

  const ok = existing.count <= safeLimit
  const remaining = Math.max(0, safeLimit - existing.count)
  const retryAfterSec = ok ? 0 : Math.max(0, Math.ceil((existing.resetAt - ts) / 1000))

  return {
    ok,
    limit: safeLimit,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSec,
  }
}

/**
 * Variante opcional: aplica rate limit y setea headers (informativo).
 * Si lo quieres usar, llámala desde el handler y decide tú si tiras 429.
 */
export async function rateLimitWithHeaders(
  event: H3Event,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const res = await rateLimit(key, limit, windowSeconds)

  // Headers "amables" para debug/observabilidad (no rompe nada si no se usan)
  setResponseHeader(event, "RateLimit-Limit", String(res.limit))
  setResponseHeader(event, "RateLimit-Remaining", String(res.remaining))
  setResponseHeader(
    event,
    "RateLimit-Reset",
    String(Math.max(0, Math.ceil((res.resetAt - now()) / 1000)))
  )
  if (!res.ok) setResponseHeader(event, "Retry-After", String(res.retryAfterSec))

  return res
}
