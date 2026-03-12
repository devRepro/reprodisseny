import crypto from "node:crypto"
import { ofetch } from "ofetch"
import { getHeader } from "h3"
import { useRuntimeConfig } from "#imports"

import { SPF } from "~/shared/utils/sharepoint/spfPriceRequests"
import {
  getGraphToken,
  resolveSiteId,
  resolveListId,
} from "~/server/utils/graphClient.server"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

import type {
  AttachmentInput,
  FileKind,
  SharePointAttachmentConfig,
  UploadedAttachment,
} from "~/server/services/priceRequests/sharepointAttachments.server"

import {
  uploadAttachmentToLibrary,
  updateLibraryItemFields,
  deleteLibraryDriveItem,
} from "~/server/services/priceRequests/sharepointAttachments.server"

// ---- Types ----
export type ProductInput = {
  name: string
  slug?: string | null
  sku?: string | null
  url?: string | null
}

export type FormField =
  | {
      name: string
      label?: string
      type: "text" | "textarea"
      required?: boolean
      maxLength?: number
    }
  | {
      name: string
      label?: string
      type: "number"
      required?: boolean
      min?: number
      max?: number
      step?: number
    }
  | {
      name: string
      label?: string
      type: "select"
      required?: boolean
      options: string[]
    }
  | {
      name: string
      label?: string
      type: "checkbox"
      required?: boolean
    }

export type PriceRequestInput = {
  name: string
  email: string
  phone?: string
  company?: string
  message?: string | null

  categorySlug?: string
  product: ProductInput
  extras?: Record<string, unknown>

  consent: boolean
  sourceUrl: string
  utm?: Record<string, any> | null

  initialStatus?: string
  attachment?: AttachmentInput | null
  fileKind?: FileKind
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
  attachment?: { filename?: string; size?: number; mimeType?: string } | null
}) {
  const day = new Date().toISOString().slice(0, 10)
  const normEmail = args.email.trim().toLowerCase()

  const sig = JSON.stringify({
    m: (args.message || "").trim().slice(0, 4000),
    x: args.extras ? stableStringify(args.extras).slice(0, 8000) : "",
    f: args.attachment
      ? `${args.attachment.filename || ""}|${args.attachment.size || 0}|${args.attachment.mimeType || ""}`
      : "",
  })

  const sigHash = crypto.createHash("sha1").update(sig).digest("hex")

  return crypto
    .createHash("sha256")
    .update(
      [day, normEmail, args.categorySlug ?? "", args.productSlug ?? "", sigHash].join("|")
    )
    .digest("hex")
    .slice(0, 32)
}

function sanitizeExtras(extras: Record<string, unknown>, formFields: FormField[]) {
  const allowed = new Map<string, FormField>()
  for (const f of formFields || []) allowed.set(f.name, f)

  const clean: Record<string, string | number | boolean | null> = {}

  for (const [k, v] of Object.entries(extras || {})) {
    const field = allowed.get(k)
    if (!field) continue

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

    const s = String(v ?? "").trim()
    if (!s) continue
    const max =
      "maxLength" in field && typeof field.maxLength === "number"
        ? field.maxLength
        : 200
    clean[k] = s.slice(0, max)
  }

  const missing = (formFields || [])
    .filter((f) => f.required)
    .filter((f) => {
      const v = clean[f.name]
      if (f.type === "checkbox") return v !== true
      return v == null || String(v).trim() === ""
    })

  return { clean, missing: missing.map((m) => m.name) }
}

function safeJsonStringify(obj: any, maxLen = 12000) {
  const s = JSON.stringify(obj)
  if (s.length <= maxLen) return s

  if (obj?.selection && typeof obj.selection === "object") {
    return JSON.stringify({ ...obj, selection: { __trimmed: true } }).slice(0, maxLen)
  }

  return s.slice(0, maxLen)
}

function compactFields(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  )
}

// ---- Main ----
export async function createPriceRequest(event: any, input: PriceRequestInput) {
  const config = useRuntimeConfig()

  const { products } = await getCmsCatalog()
  const productSlug = (input.product.slug ?? "").trim() || null

  const productDef = productSlug
    ? (products || []).find((p: any) => String(p.slug) === productSlug)
    : null

  const formFields: FormField[] = (productDef?.formFields || []) as FormField[]

  const extrasRaw = (input.extras || {}) as Record<string, unknown>
  const { clean: extrasClean, missing } = sanitizeExtras(extrasRaw, formFields)

  if (formFields.length > 0 && missing.length > 0) {
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
    attachment: input.attachment
      ? {
          filename: input.attachment.filename,
          size: input.attachment.size,
          mimeType: input.attachment.mimeType,
        }
      : null,
  })

  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event, "crm")
  const listId = await resolveListId(event, "crm")

  const requestKeyField = config.crm?.requestKeyField || SPF.REQUEST_KEY || "RequestKey"
  const hasAttachmentField =
    config.crm?.hasAttachmentField || SPF.HAS_ATTACHMENT || "HasAttachment"
  const primaryFileDriveItemIdField =
    config.crm?.primaryFileDriveItemIdField ||
    SPF.PRIMARY_FILE_DRIVE_ITEM_ID ||
    "PrimaryFileDriveItemId"
  const primaryFileWebUrlField =
    config.crm?.primaryFileWebUrlField ||
    SPF.PRIMARY_FILE_WEB_URL ||
    "PrimaryFileWebUrl"
  const primaryFileNameField =
    config.crm?.primaryFileNameField ||
    SPF.PRIMARY_FILE_NAME ||
    "PrimaryFileName"
  const primaryFileMimeTypeField =
    config.crm?.primaryFileMimeTypeField ||
    SPF.PRIMARY_FILE_MIME_TYPE ||
    "PrimaryFileMimeType"
  const primaryFileSizeField =
    config.crm?.primaryFileSizeField ||
    SPF.PRIMARY_FILE_SIZE ||
    "PrimaryFileSize"

  const attachmentConfig: SharePointAttachmentConfig = {
    siteId,
    driveId: config.sharepoint?.crm?.attachments?.libraryDriveId || "",
    libraryListId: config.sharepoint?.crm?.attachments?.libraryListId || "",
    baseFolder: config.sharepoint?.crm?.attachments?.baseFolder || "price-requests",
    maxFileBytes: Number(
      config.sharepoint?.crm?.attachments?.maxFileBytes || 26214400
    ),
    allowedMimeTypes: Array.isArray(
      config.sharepoint?.crm?.attachments?.allowedMimeTypes
    )
      ? config.sharepoint.crm.attachments.allowedMimeTypes
      : [],
  }

  // 1) Idempotency check (RequestKey)
  const checkUrl =
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}` +
    `/lists/${encodeURIComponent(listId)}/items` +
    `?$top=1&$expand=fields($select=Title,${requestKeyField})` +
    `&$filter=fields/${requestKeyField} eq '${requestKey}'`

  const existing = await ofetch(checkUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)

  const ex = (existing as any)?.value?.[0]
  if (ex?.id) {
    return {
      ok: true as const,
      duplicated: true as const,
      itemId: String(ex.id),
      requestKey,
    }
  }

  let uploadedFile: UploadedAttachment | null = null

  try {
    // 2) Upload attachment (optional)
    if (input.attachment) {
      uploadedFile = await uploadAttachmentToLibrary({
        token,
        config: attachmentConfig,
        requestKey,
        productSlug,
        fileKind: input.fileKind || "design",
        file: input.attachment,
      })
    }

    // 3) Compose product snapshot
    const productJson = {
      name: input.product.name,
      slug: productSlug,
      sku: input.product.sku ?? null,
      url: input.product.url ?? null,
      selection: extrasClean,
      context: {
        sourceUrl: input.sourceUrl || getHeader(event, "referer") || "",
        categorySlug: categorySlug || null,
        productSlug,
        utm: input.utm ?? null,
      },
      attachments: uploadedFile
        ? [
            {
              kind: uploadedFile.fileKind,
              driveItemId: uploadedFile.driveItemId,
              name: uploadedFile.name,
              mimeType: uploadedFile.mimeType,
              size: uploadedFile.size,
              webUrl: uploadedFile.webUrl,
            },
          ]
        : [],
    }

    // 4) Compose SharePoint fields
    const rawFields: Record<string, any> = {
      Title: input.name,
      [SPF.EMAIL]: input.email,
      [SPF.PHONE]: input.phone ?? "",
      [SPF.COMPANY]: input.company ?? "",
      [SPF.COMMENT]: input.message ?? "",
      [SPF.PRODUCT]: safeJsonStringify(productJson),
      [SPF.STATUS]: input.initialStatus || "Nova",

      [requestKeyField]: requestKey,
      [SPF.CONSENT || "Consent"]: Boolean(input.consent),
      [SPF.CATEGORY_SLUG || "CategorySlug"]: categorySlug || "",
      [SPF.PRODUCT_SLUG || "ProductSlug"]: productSlug || "",
      [SPF.UTM_JSON || "UtmJson"]: input.utm ? JSON.stringify(input.utm) : "",
      [SPF.SOURCE_URL || "SourceUrl"]: input.sourceUrl,

      [hasAttachmentField]: Boolean(uploadedFile),
      [primaryFileDriveItemIdField]: uploadedFile?.driveItemId || "",
      [primaryFileWebUrlField]: uploadedFile?.webUrl || "",
      [primaryFileNameField]: uploadedFile?.name || "",
      [primaryFileMimeTypeField]: uploadedFile?.mimeType || "",
      [primaryFileSizeField]: uploadedFile?.size || 0,
    }

    const fields = compactFields(rawFields)

    // 5) Create item in requests list
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

    const createdItemId = String((created as any)?.id ?? "")

    // 6) Update metadata of uploaded document
    if (uploadedFile?.libraryItemId) {
      await updateLibraryItemFields({
        token,
        siteId,
        libraryListId: attachmentConfig.libraryListId,
        itemId: uploadedFile.libraryItemId,
        fields: {
          RequestKey: requestKey,
          FileKind: uploadedFile.fileKind,
          SourceListItemId: Number(createdItemId),
          ProductSlug: productSlug || "",
        },
      })
    }

    return {
      ok: true as const,
      duplicated: false as const,
      itemId: createdItemId,
      requestKey,
      file: uploadedFile
        ? {
            driveItemId: uploadedFile.driveItemId,
            webUrl: uploadedFile.webUrl,
            name: uploadedFile.name,
          }
        : null,
    }
  } catch (err: any) {
    if (uploadedFile?.driveItemId) {
      await deleteLibraryDriveItem({
        token,
        driveId: attachmentConfig.driveId,
        driveItemId: uploadedFile.driveItemId,
      })
    }

    console.error("PRICE REQUEST SERVICE ERROR", {
      message: err?.message,
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.data,
      responseText: err?.response?._data,
    })

    throw err
  }
}