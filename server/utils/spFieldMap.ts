// server/utils/spFieldMap.ts
import { ofetch } from 'ofetch'
import type { H3Event } from 'h3'
import { getGraphToken, resolveSiteId, resolveListId } from '~/server/utils/graph'

const columnsCache = new Map<string, Array<{ name: string; displayName: string }>>()

const norm = (s: string) =>
  s.toLowerCase()
   .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // sin acentos
   .replace(/\s+/g, '')                              // sin espacios
   .replace(/[^a-z0-9_]/g, '')                       // limpio

/** Descarga y cachea columnas de la lista => [{ name, displayName }] */
export async function getListColumns(event?: H3Event) {
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const listId = await resolveListId(event)
  const cacheKey = `${siteId}:${listId}`

  if (!columnsCache.has(cacheKey)) {
    const url = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}` +
                `/lists/${encodeURIComponent(listId)}/columns?$select=name,displayName`
    const { value } = await ofetch<{ value: Array<{ name: string; displayName: string }> }>(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    columnsCache.set(cacheKey, value || [])
  }
  return { siteId, listId, columns: columnsCache.get(cacheKey)! }
}

/** Construye diccionario normalizado -> internalName */
export function buildDict(columns: Array<{ name: string; displayName: string }>) {
  const dict = new Map<string, string>()
  for (const c of columns) {
    dict.set(norm(c.name), c.name)
    if (c.displayName) dict.set(norm(c.displayName), c.name)
  }
  return dict
}

/** Busca un internalName probando varias etiquetas/sinónimos */
export function pick(dict: Map<string, string>, ...labels: string[]) {
  for (const l of labels) {
    const hit = dict.get(norm(l))
    if (hit) return hit
  }
  return null
}

export const FIELD_ALIASES = {
    title: ['Title', 'Título', 'Títol', 'Nombre'],
    email: ['Email', 'E-mail', 'Correo electrónico', 'Correu electrònic'],
    product: ['Producto', 'Product', 'Servei', 'Servicio'],
    fecha: ['FechaSolicitud', 'Fecha', 'Data', 'RequestedAt'],
    json: ['CondicionesJSON', 'Payload', 'Especificaciones', 'SpecsJSON', 'Datos JSON'],
    resumen: ['CondicionesResumen', 'Resumen', 'Notes', 'Observaciones']
  }