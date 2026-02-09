import "dotenv/config"
import dotenv from "dotenv"
dotenv.config({ path: ".env.imports" })

import xlsx from "xlsx"
import { Client } from "@microsoft/microsoft-graph-client"
import "isomorphic-fetch"
import { ClientSecretCredential } from "@azure/identity"

const {
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  SHAREPOINT_SITE_ID,
  SP_LIST_PRODUCTS_ID,

  XLSX_PATH = "./categorias_productos_template.xlsx",
  XLSX_SHEET = "Formularios dinamicos",

  // nombres internos en SharePoint
  SP_SLUG_FIELD = "slug",
  SP_FORMFIELDS_FIELD = "formFields",

  DRY_RUN = "0",
  NORMALIZE_FIELD_NAMES = "0",
} = process.env

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !SHAREPOINT_SITE_ID || !SP_LIST_PRODUCTS_ID) {
  console.error("Missing env vars: TENANT_ID, CLIENT_ID, CLIENT_SECRET, SHAREPOINT_SITE_ID, SP_LIST_PRODUCTS_ID")
  process.exit(1)
}

function graphClient() {
  const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET)
  const scope = "https://graph.microsoft.com/.default"
  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken(scope)
        done(null, token.token)
      } catch (e) {
        done(e, null)
      }
    },
  })
}

const s = (v) => String(v ?? "").trim()

function toBool(v) {
  if (typeof v === "boolean") return v
  const t = s(v).toLowerCase()
  return t === "true" || t === "1" || t === "sí" || t === "si" || t === "yes"
}

function parseOptions(v) {
  const raw = s(v)
  if (!raw) return null
  // En tu Excel vienen separadas por coma. Soportamos también '|'
  const parts = raw.split(/[,|]/g).map((x) => s(x)).filter(Boolean)
  return parts.length ? parts : null
}

function normalizeName(name) {
  const n = s(name)
  if (NORMALIZE_FIELD_NAMES !== "1") return n
  // quita tildes/diacríticos y espacios raros
  return n
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
}

function normalizeField(row) {
  const label = s(row.label)
  const name = normalizeName(row.name)
  const type = s(row.type) || "text"
  const required = toBool(row.required)
  const options = parseOptions(row.options)

  const out = { label, name, type, required }
  if (options && type === "select") out.options = options
  return out
}

/** Lee Excel y agrupa: slug -> fields[] */
function loadFieldsBySlug() {
  const wb = xlsx.readFile(XLSX_PATH)
  const sheet = wb.Sheets[XLSX_SHEET]
  if (!sheet) throw new Error(`No existe la hoja '${XLSX_SHEET}' en ${XLSX_PATH}`)

  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" })
  const map = new Map()

  for (const r of rows) {
    const slug = s(r.slug)
    if (!slug) continue

    const label = s(r.label)
    const name = s(r.name)
    if (!label || !name) continue

    const f = normalizeField(r)
    const arr = map.get(slug) || []
    arr.push(f)
    map.set(slug, arr)
  }

  return map
}

/** Descarga todos los items del listado y monta slug -> itemId */
async function loadProductItemIndex(client) {
  const index = new Map()

  // OData expand fields + select solo slug
  let url = `/sites/${SHAREPOINT_SITE_ID}/lists/${SP_LIST_PRODUCTS_ID}/items?$expand=fields($select=${SP_SLUG_FIELD})&$top=200`

  while (url) {
    const res = await client.api(url).get()
    for (const it of res.value || []) {
      const slug = s(it?.fields?.[SP_SLUG_FIELD])
      if (slug) index.set(slug, it.id)
    }
    url = res["@odata.nextLink"] ? res["@odata.nextLink"].replace("https://graph.microsoft.com/v1.0", "") : null
  }

  return index
}

async function patchFormFields(client, itemId, json) {
  if (DRY_RUN === "1") return
  await client
    .api(`/sites/${SHAREPOINT_SITE_ID}/lists/${SP_LIST_PRODUCTS_ID}/items/${itemId}/fields`)
    .patch({ [SP_FORMFIELDS_FIELD]: json })
}

async function main() {
  const fieldsBySlug = loadFieldsBySlug()
  console.log(`Excel: ${fieldsBySlug.size} productos con campos`)

  const client = graphClient()
  const itemIndex = await loadProductItemIndex(client)
  console.log(`SharePoint: ${itemIndex.size} productos indexados por slug`)

  let ok = 0, missing = 0

  for (const [slug, fields] of fieldsBySlug.entries()) {
    const itemId = itemIndex.get(slug)
    if (!itemId) {
      console.warn(`⚠️  No existe item en SharePoint para slug='${slug}'`)
      missing++
      continue
    }

    const json = JSON.stringify(fields)
    await patchFormFields(client, itemId, json)

    ok++
    if (ok <= 5) console.log(`✅ ${slug} -> ${fields.length} fields`) // preview
  }

  console.log(`Done. Updated=${ok} Missing=${missing} DRY_RUN=${DRY_RUN}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
