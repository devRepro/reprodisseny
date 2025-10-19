// server/utils/specials.ts
export type SpecialConditions = Record<string, unknown>

function isEmpty(v: unknown) {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
}

export function normalizeSpecials(obj?: SpecialConditions) {
  if (!obj || typeof obj !== 'object') return { json: '{}', summary: '' }

  const cleaned: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (isEmpty(v)) continue
    if (typeof v === 'string') cleaned[k] = v.trim()
    else cleaned[k] = v
  }

  // ordena claves por nombre para estabilidad
  const ordered = Object.fromEntries(Object.entries(cleaned).sort(([a], [b]) => a.localeCompare(b)))

  // resumen: Clave: valor
  const summary = Object.entries(ordered)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join('\n')

  return {
    json: JSON.stringify(ordered),
    summary
  }
}
