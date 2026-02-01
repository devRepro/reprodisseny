import crypto from "node:crypto"
import { ofetch } from "ofetch"
import { getHeader } from "h3"

import { SPF } from "~/shared/utils/sharepoint/spfPriceRequests"
import { getGraphToken, resolveSiteId, resolveListId } from "~/server/utils/graphClient.server"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

// ---- Types (keep light) ----
export type ProductInput = {
  name: string
  slug?: string | null
  sku?: string | null
  url?: string | null
}

export type FormField =
  | { name: string; label?: string; type: "text" | "textarea"; required?: boolean; maxLength?: number }
  | { name: string; label?: string; type: "number"; required?: boolean; min?: number; max?: number; step?: number }
  | { name: string; label?: string; type: "select"; required?: boolean; options: string[] }
  | { name: string; label?: string; type: "checkbox"; required?: boolean }

export type PriceRequestInput = {
  name: string
  email: string
  phone?: string
  company?: string
  message: string

  categorySlug?: string
  product: ProductInput
  extras?: Record<string, unknown>

  consent: boolean
  sourceUrl: string
  utm?: Record<string, any> | null

  // must match a valid Choice value in your list
  initialStatus?: string
}

// ---- Helpers ----
function stableStringify(obj: any) {
  const keys = Object.keys(obj || {}).sort()
  const out: Record<string, any> = {}
  for (const k of keys) out[k] = obj[k]
  return JSON.stringify(out)
}

function computeRequestKey(args: {
  email: string
  categorySlug?: string
  productSlug?: string | null
  message: string
  extras?: Record<string, any>
}) {
  const day = new Date().toISOString().slice(0, 10)
  const normEmail = args.email.trim().toLowerCase()
  const sig = JSON.stringify({
    m: (args.message || "").trim().slice(0, 4000),
    x: args.extras ? stableStringify(args.extras).slice(0, 8000) : "",
  })
  const sigHash = crypto.createHash("sha1").update(sig).digest("hex")

  return crypto
    .createHash("sha256")
    .update([day, normEmail, args.categorySlug ?? "", args.productSlug ?? "", sigHash].join("|"))
    .digest("hex")
    .slice(0, 32)
}

/**
 * Server-side sanitize of extras based on product.formFields.
 * Keeps only allowed keys + casts types + enforces required.
 */
function sanitizeExtras(extras: Record<string, unknown>, formFields: FormField[]) {
  const allowed = new Map<string, FormField>()
  for (const f of formFields || []) allowed.set(f.name, f)

  const clean: Record<string, string | number | boolean | null> = {}

  for (const [k, v] of Object.entries(extras || {})) {
    const field = allowed.get(k)
    if (!field) continue // drop unknown keys

    if (field.type === "checkbox") {
      clean[k] = Boolean(v)
      continue
    }

    if (field.type === "number") {
      const n = typeof v === "number" ? v : Number(String(v).replace(",", "."))
      if (!Number.isFinite(n)) continue
      if (typeof field.min === "number" && n < field.min) continue
      if (typeof field.max === "number" && n > field.max) continue
      clean[k] = n
      continue
    }

    if (field.type === "select") {
      const s = String(v ?? "").trim()
      if (!s) continue
      if (!field.options.includes(s)) continue
      clean[k] = s
      continue
    }

    // text / textarea
    const s = String(v ?? "").trim()
    if (!s) continue
    const max = "maxLength" in field && typeof field.maxLength === "number" ? field.maxLength : 200
    clean[k] = s.slice(0, max)
  }

  // required check
  const missing = (formFields || []).filter((f) => f.required).filter((f) => {
    const v = clean[f.name]
    if (f.type === "checkbox") return v !== true // required checkbox must be true
    return v == null || String(v).trim() === ""
  })

  return { clean, missing: missing.map((m) => m.name) }
}

function safeJsonStringify(obj: any, maxLen = 12000) {
  const s = JSON.stringify(obj)
  if (s.length <= maxLen) return s
  // If too long, trim selection
  if (obj?.selection && typeof obj.selection === "object") {
    return JSON.stringify({ ...obj, selection: { __trimmed: true } }).slice(0, maxLen)
  }
  return s.slice(0, maxLen)
}

// ---- Main ----
export async function createPriceRequest(event: any, input: PriceRequestInput) {
  // Load product definition to validate extras server-side
  const { products } = await getCmsCatalog()
  const productSlug = (input.product.slug ?? "").trim() || null

  const productDef = productSlug
    ? (products || []).find((p: any) => String(p.slug) === productSlug)
    : null

  const formFields: FormField[] = (productDef?.formFields || []) as FormField[]

  const extrasRaw = (input.extras || {}) as Record<string, unknown>
  const { clean: extrasClean, missing } = sanitizeExtras(extrasRaw, formFields)

  if (formFields.length > 0 && missing.length > 0) {
    // user-visible message should be Catalan
    const msg = `Falten camps obligatoris: ${missing.join(", ")}`
    const err: any = new Error(msg)
    err.statusCode = 400
    throw err
  }

  const categorySlug = (input.categorySlug ?? "").trim()
  const requestKey = computeRequestKey({
    email: input.email,
    categorySlug: categorySlug || undefined,
    productSlug,
    message: input.message || input.product.name,
    extras: extrasClean,
  })

  // Graph
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const listId = await resolveListId(event)

  // 1) Idempotency check (RequestKey)
  const checkUrl =
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}` +
    `/lists/${encodeURIComponent(listId)}/items` +
    `?$top=1&$expand=fields($select=Title,RequestKey)` +
    `&$filter=fields/RequestKey eq '${requestKey}'`

  const existing = await ofetch(checkUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)

  const ex = (existing as any)?.value?.[0]
  if (ex?.id) {
    return { ok: true as const, duplicated: true as const, itemId: String(ex.id), requestKey }
  }

  // 2) Compose productJson snapshot for SharePoint
  const productJson = {
    name: input.product.name,
    slug: productSlug,
    sku: input.product.sku ?? null,
    url: input.product.url ?? null,
    selection: extrasClean, // ✅ dynamic fields go here
    context: {
      sourceUrl: input.sourceUrl || getHeader(event, "referer") || "",
      categorySlug: categorySlug || null,
      productSlug,
      utm: input.utm ?? null,
    },
  }

  const fields: Record<string, any> = {}

  // Keep Title as contact name (matches your current list usage)
  fields["Title"] = input.name

  // Legacy fields (dashboard-compatible)
  fields[SPF.EMAIL] = input.email
  fields[SPF.PHONE] = input.phone ?? ""
  fields[SPF.COMPANY] = input.company ?? ""
  fields[SPF.COMMENT] = input.message
  fields[SPF.PRODUCT] = safeJsonStringify(productJson)

  // Initial status (must be a valid Choice value)
  fields[SPF.STATUS] = input.initialStatus || "Afegit CRM"

  // New columns (you confirmed internal names)
  fields["RequestKey"] = requestKey
  fields["Consent"] = Boolean(input.consent)
  fields["SourceUrl"] = input.sourceUrl
  fields["CategorySlug"] = categorySlug || ""
  fields["ProductSlug"] = productSlug || ""
  fields["UtmJson"] = input.utm ? JSON.stringify(input.utm) : ""

  // 3) Create item
  const createUrl =
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}` +
    `/lists/${encodeURIComponent(listId)}/items`

  const created = await ofetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: { fields },
  })

  return { ok: true as const, duplicated: false as const, itemId: String((created as any)?.id ?? ""), requestKey }
}
