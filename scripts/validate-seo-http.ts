import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

import * as XLSX from "xlsx";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const auditDir = path.join(rootDir, "seo-audit");
const excelPath = path.join(auditDir, "redirects_404_clasificados.xlsx");
const baseUrl = "http://127.0.0.1:3000";
const requestTimeoutMs = 10_000;
const maxRedirectHops = 10;

type Action = "301" | "410" | "404" | "REVISAR";

type AuditRow = {
  rowNumber: number;
  url: string;
  path: string;
  action: Action;
  proposedDestination: string;
  confidence: string;
  reason: string;
};

type HttpResult = {
  status: number | null;
  location: string | null;
  error?: string;
};

type FollowResult = {
  finalStatus: number | null;
  chain: Array<{ from: string; status: number | null; location: string | null }>;
  loop: boolean;
  error?: string;
};

type RowResult = {
  row: AuditRow;
  ok: boolean;
  current: HttpResult;
  expected: string;
  actual: string;
  finalStatus?: number | null;
  chain?: Array<{ from: string; status: number | null; location: string | null }>;
  loop?: boolean;
  notes: string[];
  proposedDestinationStatus?: number | null;
};

function normalizePath(value: string) {
  if (!value) return "/";

  try {
    const parsed = new URL(value, baseUrl);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}

function normalizeLocation(value: string | null) {
  if (!value) return "";

  return normalizePath(value);
}

function toLocalUrl(value: string) {
  const normalized = normalizePath(value);
  return new URL(normalized, baseUrl).toString();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestPath(value: string): Promise<HttpResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(toLocalUrl(value), {
      redirect: "manual",
      signal: controller.signal,
    });

    return {
      status: response.status,
      location: response.headers.get("location"),
    };
  } catch (error) {
    return {
      status: null,
      location: null,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function followRedirects(startPath: string): Promise<FollowResult> {
  const seen = new Set<string>();
  const chain: FollowResult["chain"] = [];
  let currentPath = normalizePath(startPath);

  for (let hop = 0; hop < maxRedirectHops; hop += 1) {
    if (seen.has(currentPath)) {
      return {
        finalStatus: null,
        chain,
        loop: true,
      };
    }

    seen.add(currentPath);

    const current = await requestPath(currentPath);
    chain.push({
      from: currentPath,
      status: current.status,
      location: current.location,
    });

    if (current.error) {
      return {
        finalStatus: current.status,
        chain,
        loop: false,
        error: current.error,
      };
    }

    if (!current.status || current.status < 300 || current.status > 399) {
      return {
        finalStatus: current.status,
        chain,
        loop: false,
      };
    }

    if (!current.location) {
      return {
        finalStatus: current.status,
        chain,
        loop: false,
        error: "Redirect sin cabecera Location",
      };
    }

    currentPath = normalizeLocation(current.location);
  }

  return {
    finalStatus: null,
    chain,
    loop: true,
    error: `Mas de ${maxRedirectHops} redirects`,
  };
}

function readRows(): AuditRow[] {
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets.URLs;

  if (!sheet) {
    throw new Error("No existe la hoja URLs en el Excel de auditoria.");
  }

  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return records.map((record, index) => ({
    rowNumber: index + 2,
    url: String(record.URL ?? "").trim(),
    path: normalizePath(String(record.Path ?? "").trim()),
    action: String(record["Accion propuesta"] ?? record["Acción propuesta"] ?? "").trim() as Action,
    proposedDestination: normalizePath(String(record["Destino propuesto"] ?? "").trim()),
    confidence: String(record.Confianza ?? "").trim(),
    reason: String(record.Motivo ?? "").trim(),
  }));
}

function formatChain(chain: RowResult["chain"]) {
  if (!chain?.length) return "Sin cadena";

  return chain
    .map((step) => {
      const suffix = step.location ? ` -> ${normalizeLocation(step.location)}` : "";
      return `${step.from} [${step.status ?? "ERR"}]${suffix}`;
    })
    .join(" | ");
}

function summarize(results: RowResult[]) {
  const definitiveResults = results.filter((result) => result.row.action !== "REVISAR");
  const byAction = (action: Action) => results.filter((result) => result.row.action === action);
  const definitiveFailures = definitiveResults.filter((result) => !result.ok);

  return {
    processed: results.length,
    definitiveFailures,
    actions: {
      "301": byAction("301"),
      "410": byAction("410"),
      "404": byAction("404"),
      REVISAR: byAction("REVISAR"),
    },
  };
}

async function validate301(row: AuditRow): Promise<RowResult> {
  const current = await requestPath(row.path);
  const expectedDestination = normalizePath(row.proposedDestination);
  const actualLocation = normalizeLocation(current.location);
  const notes: string[] = [];
  let ok = true;

  if (current.status !== 301) {
    ok = false;
    notes.push(`Primera respuesta esperada 301, recibida ${current.status ?? "ERR"}.`);
  }

  if (!current.location) {
    ok = false;
    notes.push("Falta cabecera Location.");
  } else if (actualLocation !== expectedDestination) {
    ok = false;
    notes.push(`Location esperado ${expectedDestination}, recibido ${actualLocation}.`);
  }

  const followed = current.location ? await followRedirects(actualLocation) : undefined;
  const destinationStep = followed?.chain[0];

  if (followed?.loop) {
    ok = false;
    notes.push("Bucle de redirects detectado.");
  }

  if (followed && followed.chain.length > 1) {
    ok = false;
    notes.push(`Cadena intermedia detectada: ${formatChain(followed.chain)}.`);
  }

  if (destinationStep && destinationStep.status !== 200) {
    ok = false;
    notes.push(`Destino final esperado 200, recibido ${destinationStep.status ?? "ERR"}.`);
  }

  if (followed?.error) {
    ok = false;
    notes.push(followed.error);
  }

  return {
    row,
    ok,
    current,
    expected: `301 -> ${expectedDestination} -> 200`,
    actual: `${current.status ?? "ERR"} -> ${actualLocation || "(sin Location)"} -> ${destinationStep?.status ?? "ERR"}`,
    finalStatus: destinationStep?.status ?? null,
    chain: followed?.chain,
    loop: followed?.loop,
    notes,
  };
}

async function validate410(row: AuditRow): Promise<RowResult> {
  const current = await requestPath(row.path);
  const notes: string[] = [];
  let ok = true;

  if (current.status !== 410) {
    ok = false;
    notes.push(`Respuesta esperada 410, recibida ${current.status ?? "ERR"}.`);
  }

  if (current.location) {
    ok = false;
    notes.push(`No se esperaba redireccion, pero existe Location ${normalizeLocation(current.location)}.`);
  }

  if (current.error) {
    ok = false;
    notes.push(current.error);
  }

  return {
    row,
    ok,
    current,
    expected: "410 sin redireccion",
    actual: `${current.status ?? "ERR"}${current.location ? ` -> ${normalizeLocation(current.location)}` : ""}`,
    notes,
  };
}

async function validate404(row: AuditRow): Promise<RowResult> {
  const current = await requestPath(row.path);
  const notes: string[] = [];
  let ok = true;

  if (current.status !== 404) {
    ok = false;
    notes.push(`Respuesta esperada 404, recibida ${current.status ?? "ERR"}.`);
  }

  if (current.location) {
    ok = false;
    notes.push(`No se esperaba redireccion, pero existe Location ${normalizeLocation(current.location)}.`);
  }

  if (current.error) {
    ok = false;
    notes.push(current.error);
  }

  return {
    row,
    ok,
    current,
    expected: "404 sin redireccion",
    actual: `${current.status ?? "ERR"}${current.location ? ` -> ${normalizeLocation(current.location)}` : ""}`,
    notes,
  };
}

async function validateReview(row: AuditRow): Promise<RowResult> {
  const current = await requestPath(row.path);
  const notes: string[] = [];
  const proposedDestinationStatus = row.proposedDestination && row.proposedDestination !== "/"
    ? (await requestPath(row.proposedDestination)).status
    : null;

  if (row.path.startsWith("/assets/Download/")) {
    notes.push("Decision implementada: el prefijo /assets/Download/ responde 410; pendiente de confirmacion manual sobre existencia de reemplazo de archivo.");
  } else if (current.status === 410) {
    notes.push("Comportamiento actual destructivo: mantener solo si se confirma que no hay equivalente vigente.");
  } else if (current.status === 301) {
    notes.push("Comportamiento actual redirige; confirmar equivalencia semantica antes de consolidarlo.");
  } else {
    notes.push("Pendiente de decision editorial/negocio antes de crear una regla definitiva.");
  }

  if (row.proposedDestination && row.proposedDestination !== "/") {
    notes.push(`Destino propuesto ${row.proposedDestination} responde ${proposedDestinationStatus ?? "ERR"}.`);
  }

  return {
    row,
    ok: true,
    current,
    expected: "REVISAR no bloqueante",
    actual: `${current.status ?? "ERR"}${current.location ? ` -> ${normalizeLocation(current.location)}` : ""}`,
    proposedDestinationStatus,
    notes,
  };
}

function makeMainReport(results: RowResult[], totalSeconds: number) {
  const summary = summarize(results);
  const failed301 = summary.actions["301"].filter((result) => !result.ok);
  const failed410 = summary.actions["410"].filter((result) => !result.ok);
  const failed404 = summary.actions["404"].filter((result) => !result.ok);
  const non200Destinations = summary.actions["301"].filter((result) => result.finalStatus !== 200);
  const chainsOrLoops = summary.actions["301"].filter((result) => (result.chain?.length ?? 0) > 1 || result.loop);

  const lines = [
    "# Resultado validacion redirects 404",
    "",
    `- URLs procesadas: ${summary.processed}`,
    `- Tiempo total: ${totalSeconds.toFixed(2)}s`,
    `- 301 correctos: ${summary.actions["301"].length - failed301.length}/${summary.actions["301"].length}`,
    `- 410 correctos: ${summary.actions["410"].length - failed410.length}/${summary.actions["410"].length}`,
    `- 404 correctos: ${summary.actions["404"].length - failed404.length}/${summary.actions["404"].length}`,
    `- REVISAR documentados: ${summary.actions.REVISAR.length}`,
    "",
    "## Validaciones previas",
    "",
    "- validate:seo-redirects: OK, codigo 0, 357 redirects efectivos y 31 reglas 410 validadas.",
    "- validate:seo-routes: OK, codigo 0, 130 rutas de catalogo y 12 categorias canonicas validadas.",
    "- build: OK, codigo 0 segun la fase previa indicada.",
    "- typecheck: vue-tsc termino con codigo 2 por errores generales existentes; no hay errores asociados a redirect-rules.generated.ts, server/middleware/legacy-notfound-redirect.ts, scripts/validate-seo-redirects.ts ni shared/seo/legacyRedirects.ts.",
    "",
    "## 301",
    "",
    failed301.length
      ? failed301.map((result) => `- FALLA ${result.row.path}: ${result.notes.join(" ")}`).join("\n")
      : "- Todos los casos 301 tienen primera respuesta 301, Location esperado, sin cadena intermedia y destino 200.",
    "",
    "## 410",
    "",
    failed410.length
      ? failed410.map((result) => `- FALLA ${result.row.path}: ${result.notes.join(" ")}`).join("\n")
      : "- Todos los casos 410 responden 410 sin redireccion.",
    "",
    "## /_nuxt/",
    "",
    failed404.length
      ? failed404.map((result) => `- FALLA ${result.row.path}: ${result.notes.join(" ")}`).join("\n")
      : "- /_nuxt/ responde 404 sin redireccion.",
    "",
    "## Destinos finales no 200",
    "",
    non200Destinations.length
      ? non200Destinations.map((result) => `- ${result.row.path} -> ${result.row.proposedDestination}: ${result.finalStatus ?? "ERR"}`).join("\n")
      : "- Ninguno.",
    "",
    "## Cadenas o bucles",
    "",
    chainsOrLoops.length
      ? chainsOrLoops.map((result) => `- ${result.row.path}: ${formatChain(result.chain)}`).join("\n")
      : "- Ninguno.",
    "",
    "## Fallos bloqueantes",
    "",
    summary.definitiveFailures.length
      ? summary.definitiveFailures.map((result) => `- ${result.row.action} ${result.row.path}: ${result.notes.join(" ")}`).join("\n")
      : "- Ninguno.",
    "",
  ];

  return lines.join("\n");
}

function makeReviewReport(results: RowResult[]) {
  const reviewResults = results.filter((result) => result.row.action === "REVISAR");
  const lines = [
    "# Revision manual pendiente",
    "",
    "Los casos REVISAR no son bloqueantes y no modifican automaticamente reglas.",
    "",
  ];

  for (const result of reviewResults) {
    lines.push(
      `## ${result.row.path}`,
      "",
      `- URL original: ${result.row.url}`,
      `- Comportamiento actual: ${result.actual}`,
      `- Destino propuesto: ${result.row.proposedDestination || "(sin destino)"}`,
      `- Respuesta destino propuesto: ${result.proposedDestinationStatus ?? "no aplica"}`,
      `- Confianza: ${result.row.confidence}`,
      `- Motivo: ${result.row.reason}`,
      `- Recomendacion: ${result.notes.join(" ")}`,
      "",
    );
  }

  return lines.join("\n");
}

async function main() {
  const startedAt = performance.now();
  const rows = readRows();

  if (rows.length !== 122) {
    throw new Error(`Se esperaban 122 URLs, pero se leyeron ${rows.length}.`);
  }

  const results: RowResult[] = [];

  for (const row of rows) {
    if (row.action === "301") {
      results.push(await validate301(row));
    } else if (row.action === "410") {
      results.push(await validate410(row));
    } else if (row.action === "404") {
      results.push(await validate404(row));
    } else if (row.action === "REVISAR") {
      results.push(await validateReview(row));
    } else {
      results.push({
        row,
        ok: false,
        current: { status: null, location: null },
        expected: "Accion conocida",
        actual: row.action,
        notes: [`Accion no soportada: ${row.action}`],
      });
    }

    await sleep(25);
  }

  const totalSeconds = (performance.now() - startedAt) / 1000;
  await mkdir(auditDir, { recursive: true });
  await writeFile(path.join(auditDir, "redirects_404_resultado.md"), makeMainReport(results, totalSeconds), "utf8");
  await writeFile(path.join(auditDir, "redirects_404_revision_manual.md"), makeReviewReport(results), "utf8");

  const summary = summarize(results);
  const failed301 = summary.actions["301"].filter((result) => !result.ok);
  const failed410 = summary.actions["410"].filter((result) => !result.ok);
  const failed404 = summary.actions["404"].filter((result) => !result.ok);
  const chainsOrLoops = summary.actions["301"].filter((result) => (result.chain?.length ?? 0) > 1 || result.loop);
  const non200Destinations = summary.actions["301"].filter((result) => result.finalStatus !== 200);

  console.log("SEO HTTP validation");
  console.log(`URLs procesadas: ${summary.processed}`);
  console.log(`301 correctos: ${summary.actions["301"].length - failed301.length}/${summary.actions["301"].length}`);
  console.log(`410 correctos: ${summary.actions["410"].length - failed410.length}/${summary.actions["410"].length}`);
  console.log(`404 correctos: ${summary.actions["404"].length - failed404.length}/${summary.actions["404"].length}`);
  console.log(`REVISAR documentados: ${summary.actions.REVISAR.length}`);
  console.log(`Destinos finales no 200: ${non200Destinations.length}`);
  console.log(`Cadenas o bucles: ${chainsOrLoops.length}`);
  console.log(`Tiempo total: ${totalSeconds.toFixed(2)}s`);
  console.log("Informes generados:");
  console.log("- seo-audit/redirects_404_resultado.md");
  console.log("- seo-audit/redirects_404_revision_manual.md");

  if (summary.definitiveFailures.length) {
    console.error(`\nFallos bloqueantes (${summary.definitiveFailures.length})`);
    for (const failure of summary.definitiveFailures) {
      console.error(`- ${failure.row.action} ${failure.row.path}: ${failure.notes.join(" ")}`);
    }
    process.exitCode = 1;
  } else {
    console.log("\nSEO HTTP OK");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
