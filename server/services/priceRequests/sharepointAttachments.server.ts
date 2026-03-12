import { ofetch } from "ofetch"

export type FileKind = "design" | "brief" | "proof" | "final" | "other"

export type AttachmentInput = {
  filename: string
  mimeType: string
  buffer: Buffer
  size: number
}

export type SharePointAttachmentConfig = {
  siteId: string
  driveId: string
  libraryListId: string
  baseFolder: string
  maxFileBytes: number
  allowedMimeTypes: string[]
}

export type UploadAttachmentParams = {
  token: string
  config: SharePointAttachmentConfig
  requestKey: string
  productSlug: string | null
  fileKind: FileKind
  file: AttachmentInput
}

export type UploadedDriveItem = {
  id: string
  name: string
  size: number
  webUrl: string
}

export type UploadedAttachment = {
  driveItemId: string
  libraryItemId: string
  name: string
  size: number
  mimeType: string
  webUrl: string
  fileKind: FileKind
  requestKey: string
  productSlug: string | null
}

export type GetLibraryListItemIdParams = {
  token: string
  driveId: string
  driveItemId: string
}

export type UpdateLibraryItemFieldsParams = {
  token: string
  siteId: string
  libraryListId: string
  itemId: string
  fields: Record<string, any>
}

export type DeleteLibraryDriveItemParams = {
  token: string
  driveId: string
  driveItemId: string
}

export function sanitizeFilename(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-() ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180)
}

export function sanitizePathSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-() ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
}

export function encodePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

export async function uploadAttachmentToLibrary(
  params: UploadAttachmentParams
): Promise<UploadedAttachment> {
  const { token, config, requestKey, productSlug, fileKind, file } = params

  if (!config.driveId) {
    const err: any = new Error("Falta el driveId de la biblioteca")
    err.statusCode = 500
    throw err
  }

  if (!config.siteId) {
    const err: any = new Error("Falta el siteId de la biblioteca")
    err.statusCode = 500
    throw err
  }

  if (!config.libraryListId) {
    const err: any = new Error("Falta el libraryListId de la biblioteca")
    err.statusCode = 500
    throw err
  }

  if (file.size > config.maxFileBytes) {
    const err: any = new Error("Archivo demasiado grande")
    err.statusCode = 400
    throw err
  }

  if (
    Array.isArray(config.allowedMimeTypes) &&
    config.allowedMimeTypes.length > 0 &&
    !config.allowedMimeTypes.includes(file.mimeType)
  ) {
    const err: any = new Error(`Tipo de archivo no permitido: ${file.mimeType}`)
    err.statusCode = 400
    throw err
  }

  const safeName = sanitizeFilename(file.filename)
  const safeProductSlug = sanitizePathSegment(productSlug || "no-product")
  const safeBaseFolder = sanitizePathSegment(config.baseFolder || "price-requests")
  const finalName = `${requestKey}-${fileKind}-${safeName}`

  const folderPath = [safeBaseFolder, safeProductSlug, requestKey].join("/")

  const uploadUrl =
    `https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(config.driveId)}` +
    `/root:/${encodePath(`${folderPath}/${finalName}`)}:/content`

  const uploaded = await ofetch<UploadedDriveItem>(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.mimeType,
    },
    body: file.buffer,
  })

  const libraryItemId = await getLibraryListItemId({
    token,
    driveId: config.driveId,
    driveItemId: uploaded.id,
  })

  return {
    driveItemId: uploaded.id,
    libraryItemId,
    name: uploaded.name,
    size: uploaded.size,
    mimeType: file.mimeType,
    webUrl: uploaded.webUrl,
    fileKind,
    requestKey,
    productSlug,
  }
}

export async function getLibraryListItemId(
  params: GetLibraryListItemIdParams
): Promise<string> {
  if (!params.driveId || !params.driveItemId) {
    const err: any = new Error("Faltan datos para resolver el listItem del documento")
    err.statusCode = 500
    throw err
  }

  const url =
    `https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(params.driveId)}` +
    `/items/${encodeURIComponent(params.driveItemId)}/listItem`

  for (let i = 0; i < 3; i++) {
    try {
      const item = await ofetch<{ id?: string }>(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
      })

      if (item?.id) {
        return String(item.id)
      }
    } catch {
      // retry corto
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  const err: any = new Error("No se pudo resolver el listItem del documento subido")
  err.statusCode = 500
  throw err
}

export async function updateLibraryItemFields(
  params: UpdateLibraryItemFieldsParams
): Promise<void> {
  if (!params.siteId || !params.libraryListId || !params.itemId) {
    const err: any = new Error("Faltan datos para actualizar metadata de la biblioteca")
    err.statusCode = 500
    throw err
  }

  const url =
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(params.siteId)}` +
    `/lists/${encodeURIComponent(params.libraryListId)}` +
    `/items/${encodeURIComponent(params.itemId)}/fields`

  await ofetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${params.token}`,
      "Content-Type": "application/json",
    },
    body: params.fields,
  })
}

export async function deleteLibraryDriveItem(
  params: DeleteLibraryDriveItemParams
): Promise<void> {
  if (!params.driveId || !params.driveItemId) {
    return
  }

  const url =
    `https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(params.driveId)}` +
    `/items/${encodeURIComponent(params.driveItemId)}`

  await ofetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  }).catch(() => null)
}