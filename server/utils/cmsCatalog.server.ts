import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cache: any = null;

export async function getCmsCatalog() {
  if (cache) return cache;
  const raw = await readFile(join(process.cwd(), "cms", "catalog.json"), "utf8");
  cache = JSON.parse(raw);
  return cache;
}

// útil en dev si quieres recargar al vuelo
export function clearCmsCatalogCache() {
  cache = null;
}


