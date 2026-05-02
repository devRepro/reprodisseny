import dotenv from "dotenv";

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import xlsx from "xlsx";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";

dotenv.config();
dotenv.config({ path: ".env.imports" });

const s = (v) => String(v ?? "").trim();

const TENANT_ID = s(process.env.TENANT_ID || process.env.AZURE_TENANT_ID);
const CLIENT_ID = s(process.env.CLIENT_ID || process.env.AZURE_CLIENT_ID);
const CLIENT_SECRET = s(process.env.CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET);

const SHAREPOINT_SITE_ID = s(
  process.env.SHAREPOINT_SITE_ID ||
  process.env.CMS_SITE_ID ||
  process.env.GRAPH_CMS_SITE_ID
);

const SHAREPOINT_HOSTNAME = s(
  process.env.CMS_SITE_HOSTNAME || process.env.SHAREPOINT_HOSTNAME
);

const SHAREPOINT_SITE_PATH = s(
  process.env.CMS_SITE_PATH || process.env.SHAREPOINT_SITE_PATH
);

const SP_LIST_PRODUCTS_ID = s(
  process.env.SP_LIST_PRODUCTS_ID ||
  process.env.NUXT_SHAREPOINT_CMS_PRODUCTS_LIST_ID
);

const XLSX_PATH = s(process.env.XLSX_PATH || "./categorias_productos_template.xlsx");
const XLSX_SHEET = s(process.env.XLSX_SHEET || "Formularios dinamicos");

const SP_SLUG_FIELD = s(process.env.SP_SLUG_FIELD || "ProductSlug");
const SP_FORMFIELDS_FIELD = s(process.env.SP_FORMFIELDS_FIELD || "FormFieldsJson");

const DRY_RUN = s(process.env.DRY_RUN || "0");
const NORMALIZE_FIELD_NAMES = s(process.env.NORMALIZE_FIELD_NAMES || "0");

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !SP_LIST_PRODUCTS_ID) {
  console.error(
    [
      "Missing env vars:",
      "- TENANT_ID or AZURE_TENANT_ID",
      "- CLIENT_ID or AZURE_CLIENT_ID",
      "- CLIENT_SECRET or AZURE_CLIENT_SECRET",
      "- SP_LIST_PRODUCTS_ID or NUXT_SHAREPOINT_CMS_PRODUCTS_LIST_ID",
    ].join("\n")
  );
  process.exit(1);
}

if (!SHAREPOINT_SITE_ID && (!SHAREPOINT_HOSTNAME || !SHAREPOINT_SITE_PATH)) {
  console.error(
    [
      "Missing SharePoint site config.",
      "Define either:",
      "- SHAREPOINT_SITE_ID",
      "or:",
      "- SHAREPOINT_HOSTNAME + SHAREPOINT_SITE_PATH",
    ].join("\n")
  );
  process.exit(1);
}

function graphClient() {
  const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
  const scope = "https://graph.microsoft.com/.default";

  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken(scope);
        done(null, token.token);
      } catch (e) {
        done(e, null);
      }
    },
  });
}

let resolvedSiteId = null;

async function resolveSiteId(client) {
  if (SHAREPOINT_SITE_ID) return SHAREPOINT_SITE_ID;
  if (resolvedSiteId) return resolvedSiteId;

  const sitePath = SHAREPOINT_SITE_PATH.startsWith("/")
    ? SHAREPOINT_SITE_PATH
    : `/${SHAREPOINT_SITE_PATH}`;

  const site = await client.api(`/sites/${SHAREPOINT_HOSTNAME}:${sitePath}`).get();

  if (!site?.id) {
    throw new Error(
      `No se pudo resolver el siteId para ${SHAREPOINT_HOSTNAME}:${sitePath}`
    );
  }

  resolvedSiteId = site.id;
  return resolvedSiteId;
}

function toBool(v) {
  if (typeof v === "boolean") return v;

  const t = s(v).toLowerCase();

  return (
    t === "true" ||
    t === "1" ||
    t === "sí" ||
    t === "si" ||
    t === "yes"
  );
}

function parseOptions(v) {
  const raw = s(v);
  if (!raw) return null;

  const parts = raw
    .split(/[,|]/g)
    .map((x) => s(x))
    .filter(Boolean);

  return parts.length ? parts : null;
}

function normalizeName(name) {
  const n = s(name);
  if (NORMALIZE_FIELD_NAMES !== "1") return n;

  return n
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function normalizeField(row) {
  const label = s(row.label);
  const name = normalizeName(row.name);
  const type = s(row.type) || "text";
  const required = toBool(row.required);
  const options = parseOptions(row.options);

  const out = {
    label,
    name,
    type,
    required,
  };

  if (options && type === "select") {
    out.options = options;
  }

  return out;
}

/**
 * Lee Excel y agrupa:
 * slug -> fields[]
 */
function loadFieldsBySlug() {
  const workbookPath = resolve(process.cwd(), XLSX_PATH);

  if (!existsSync(workbookPath)) {
    throw new Error(`No existe el archivo Excel: ${workbookPath}`);
  }

  const stat = statSync(workbookPath);
  if (!stat.isFile()) {
    throw new Error(`La ruta no es un archivo Excel válido: ${workbookPath}`);
  }

  const buffer = readFileSync(workbookPath);
  const wb = xlsx.read(buffer, { type: "buffer" });

  const sheet = wb.Sheets[XLSX_SHEET];

  if (!sheet) {
    throw new Error(
      [
        `No existe la hoja '${XLSX_SHEET}' en ${workbookPath}.`,
        `Hojas disponibles: ${wb.SheetNames.join(", ") || "(ninguna)"}`,
      ].join("\n")
    );
  }

  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  const map = new Map();

  for (const r of rows) {
    const slug = s(r.slug);
    if (!slug) continue;

    const label = s(r.label);
    const name = s(r.name);

    if (!label || !name) continue;

    const field = normalizeField(r);
    const arr = map.get(slug) || [];

    arr.push(field);
    map.set(slug, arr);
  }

  return map;
}

/**
 * Descarga todos los productos del listado y monta:
 * slug -> itemId
 */
function normalizeSlug(value) {
  return s(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getLastPathSegment(value) {
  const path = s(value).split("?")[0].replace(/\/+$/g, "");
  if (!path) return "";
  return path.split("/").filter(Boolean).pop() || "";
}

function readProductSlugAliases(fields) {
  const aliases = [
    fields?.[SP_SLUG_FIELD],
    fields?.ProductSlug,
    fields?.slug,
    fields?.Slug,
    getLastPathSegment(fields?.Path),
  ]
    .map((value) => normalizeSlug(value))
    .filter(Boolean);

  return Array.from(new Set(aliases));
}

/**
 * Descarga todos los productos del listado y monta:
 * normalizedSlug -> itemId
 */
async function loadProductItemIndex(client) {
  const index = new Map();
  const siteId = await resolveSiteId(client);

  let url =
    `/sites/${siteId}/lists/${SP_LIST_PRODUCTS_ID}/items` +
    `?$expand=fields` +
    `&$top=999`;

  while (url) {
    const res = await client.api(url).get();

    for (const item of res.value || []) {
      const fields = item?.fields || {};
      const aliases = readProductSlugAliases(fields);

      for (const alias of aliases) {
        if (!index.has(alias)) {
          index.set(alias, item.id);
        }
      }
    }

    url = res["@odata.nextLink"]
      ? res["@odata.nextLink"].replace("https://graph.microsoft.com/v1.0", "")
      : null;
  }

  return index;
}
async function patchFormFields(client, itemId, json) {
  if (DRY_RUN === "1") return;

  const siteId = await resolveSiteId(client);

  await client
    .api(`/sites/${siteId}/lists/${SP_LIST_PRODUCTS_ID}/items/${itemId}/fields`)
    .patch({
      [SP_FORMFIELDS_FIELD]: json,
    });
}

async function main() {
  console.log("Config:");
  console.log(`- XLSX_PATH=${XLSX_PATH}`);
  console.log(`- XLSX_SHEET=${XLSX_SHEET}`);
  console.log(`- SP_LIST_PRODUCTS_ID=${SP_LIST_PRODUCTS_ID}`);
  console.log(`- SP_SLUG_FIELD=${SP_SLUG_FIELD}`);
  console.log(`- SP_FORMFIELDS_FIELD=${SP_FORMFIELDS_FIELD}`);
  console.log(`- DRY_RUN=${DRY_RUN}`);

  const fieldsBySlug = loadFieldsBySlug();
  console.log(`Excel: ${fieldsBySlug.size} productos con campos`);

  const client = graphClient();
  const siteId = await resolveSiteId(client);

  console.log(`SharePoint siteId: ${siteId}`);

  const itemIndex = await loadProductItemIndex(client);
  console.log(`SharePoint: ${itemIndex.size} productos indexados por slug`);

  let ok = 0;
  let missing = 0;

  for (const [slug, fields] of fieldsBySlug.entries()) {
    const itemId = itemIndex.get(normalizeSlug(slug));

    if (!itemId) {
      console.warn(`⚠️  No existe item en SharePoint para slug='${slug}'`);
      missing++;
      continue;
    }

    const json = JSON.stringify(fields);

    await patchFormFields(client, itemId, json);

    ok++;

    if (ok <= 5) {
      console.log(`✅ ${slug} -> ${fields.length} fields`);
    }
  }

  console.log(`Done. Updated=${ok} Missing=${missing} DRY_RUN=${DRY_RUN}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});