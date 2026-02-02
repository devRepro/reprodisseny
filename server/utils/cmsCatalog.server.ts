// server/utils/cmsCatalog.server.ts
import { readFile } from "node:fs/promises"
import { join } from "node:path"

type CmsCatalog = {
  categories?: any[]
  products?: any[]
  // si tienes más keys, añádelas
}

let cache: CmsCatalog | null = null
let cacheAt = 0

const DEV_TTL_MS = 5_000 // 5s en dev (ajusta)
const PROD_TTL_MS = 60_000 // 60s en prod (o infinito si lo prefieres)

export async function getCmsCatalog(): Promise<CmsCatalog> {
  const isDev = process.env.NODE_ENV !== "production"
  const ttl = isDev ? DEV_TTL_MS : PROD_TTL_MS

  if (cache && Date.now() - cacheAt < ttl) return cache

  try {
    const raw = await readFile(join(process.cwd(), "cms", "catalog.json"), "utf8")
    cache = JSON.parse(raw)
    cacheAt = Date.now()
    return cache
  } catch (e: any) {
    // Mensaje claro si el archivo no existe o está mal formado
    const msg = e?.code === "ENOENT"
      ? "No existe cms/catalog.json. ¿Has ejecutado el script de sync?"
      : `Error leyendo cms/catalog.json: ${e?.message || String(e)}`
    throw new Error(msg)
  }
}

// útil en dev si quieres recargar al vuelo
export function clearCmsCatalogCache() {
  cache = null
  cacheAt = 0
}

