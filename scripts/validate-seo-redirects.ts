import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { redirectRouteRules } from "../redirect-rules.generated";
import {
  LEGACY_GONE_PATHS,
  LEGACY_GONE_PREFIXES,
  LEGACY_NOT_FOUND_PATHS,
  MANUAL_LEGACY_REDIRECTS,
} from "../shared/seo/legacyRedirects";

type RedirectRule = {
  redirect?: {
    to?: string;
    statusCode?: number;
  };
};

type RedirectEntry = {
  from: string;
  to: string;
  statusCode: number;
  source: "generated" | "manual";
};

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const permanentRedirectStatusCodes = new Set([301, 308]);

function normalizeConfiguredPath(value: unknown, options: { keepTrailingSlash?: boolean } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const withoutFragment = raw.split("#")[0] ?? "";
  const withoutQuery = withoutFragment.split("?")[0] ?? "";
  const withForwardSlashes = withoutQuery.replace(/\\/g, "/");
  const collapsedSlashes = withForwardSlashes.replace(/\/{2,}/g, "/");
  const withLeadingSlash = collapsedSlashes.startsWith("/")
    ? collapsedSlashes
    : `/${collapsedSlashes}`;

  if (options.keepTrailingSlash) {
    return withLeadingSlash || "/";
  }

  return withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;
}

function isExternalDestination(value: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function isUnsafeDestination(value: string) {
  return value.startsWith("//") || isExternalDestination(value);
}

function isGonePath(pathname: string) {
  return (
    LEGACY_GONE_PATHS.includes(pathname as (typeof LEGACY_GONE_PATHS)[number]) ||
    LEGACY_GONE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

async function readJson(relativePath: string) {
  const source = await readFile(path.join(rootDir, relativePath), "utf8");
  return JSON.parse(source) as unknown;
}

function collectGeneratedRedirects() {
  return Object.entries(redirectRouteRules as Record<string, RedirectRule>)
    .map(([from, rule]): RedirectEntry | null => {
      const to = rule.redirect?.to;

      if (!to) {
        return null;
      }

      return {
        from,
        to,
        statusCode: rule.redirect?.statusCode ?? 301,
        source: "generated",
      };
    })
    .filter((entry): entry is RedirectEntry => entry !== null);
}

function collectManualRedirects() {
  return Object.entries(MANUAL_LEGACY_REDIRECTS).map(([from, to]) => ({
    from,
    to,
    statusCode: 301,
    source: "manual" as const,
  }));
}

function buildEffectiveRedirects(entries: RedirectEntry[]) {
  const effective = new Map<string, RedirectEntry>();

  for (const entry of entries) {
    effective.set(entry.from, entry);
  }

  return effective;
}

function validateConfiguredPath(
  label: string,
  value: string,
  errors: string[],
  options: { keepTrailingSlash?: boolean } = {},
) {
  const normalized = normalizeConfiguredPath(value, options);

  if (!value.trim()) {
    errors.push(`${label}: path vacio`);
    return;
  }

  if (value !== normalized) {
    errors.push(`${label}: path sin normalizar "${value}" deberia ser "${normalized}"`);
  }
}

function findRedirectChains(effectiveRedirects: Map<string, RedirectEntry>) {
  const chains: string[] = [];

  for (const entry of effectiveRedirects.values()) {
    if (!effectiveRedirects.has(entry.to)) continue;

    const chain = [entry.from, entry.to];
    let current = effectiveRedirects.get(entry.to);
    const seen = new Set(chain);

    while (current && effectiveRedirects.has(current.to) && !seen.has(current.to)) {
      chain.push(current.to);
      seen.add(current.to);
      current = effectiveRedirects.get(current.to);
    }

    chains.push(chain.join(" -> "));
  }

  return [...new Set(chains)].sort();
}

function findRedirectLoops(effectiveRedirects: Map<string, RedirectEntry>) {
  const loops = new Set<string>();

  for (const origin of effectiveRedirects.keys()) {
    const seen = new Map<string, number>();
    const pathStack: string[] = [];
    let current: string | undefined = origin;

    while (current && effectiveRedirects.has(current)) {
      if (seen.has(current)) {
        const startIndex = seen.get(current) ?? 0;
        loops.add([...pathStack.slice(startIndex), current].join(" -> "));
        break;
      }

      seen.set(current, pathStack.length);
      pathStack.push(current);
      current = effectiveRedirects.get(current)?.to;
    }
  }

  return [...loops].sort();
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

const routesJson = await readJson("cms/routes.json");
const cmsRoutes = new Set(
  (Array.isArray(routesJson) ? routesJson : [])
    .map((route) => normalizeConfiguredPath(route))
    .filter(Boolean),
);

const generatedRedirects = collectGeneratedRedirects();
const manualRedirects = collectManualRedirects();
const allRedirects = [...generatedRedirects, ...manualRedirects];
const effectiveRedirects = buildEffectiveRedirects(allRedirects);
const errors: string[] = [];
const warnings: string[] = [];

for (const entry of generatedRedirects) {
  if (!entry.from.endsWith("/printestimate")) continue;

  const basePath = entry.from.slice(0, -"/printestimate".length);
  const baseRedirect = effectiveRedirects.get(basePath);

  if (!baseRedirect) {
    errors.push(`${entry.source} redirect ${entry.from}: falta la URL base equivalente ${basePath}`);
  }
}

for (const manualRedirect of manualRedirects) {
  if (generatedRedirects.some((entry) => entry.from === manualRedirect.from)) {
    errors.push(`redirect manual duplicado en generated: ${manualRedirect.from}`);
  }
}

for (const entry of allRedirects) {
  validateConfiguredPath(`${entry.source} redirect origen`, entry.from, errors);
  validateConfiguredPath(`${entry.source} redirect destino`, entry.to, errors);

  if (isUnsafeDestination(entry.to)) {
    errors.push(`${entry.source} redirect ${entry.from}: destino externo o inseguro "${entry.to}"`);
  }

  if (entry.from === entry.to) {
    errors.push(`${entry.source} redirect ${entry.from}: origen igual al destino`);
  }

  if (!permanentRedirectStatusCodes.has(entry.statusCode)) {
    errors.push(
      `${entry.source} redirect ${entry.from}: codigo ${entry.statusCode} no es permanente`,
    );
  }

  if (isGonePath(entry.from)) {
    errors.push(`${entry.source} redirect ${entry.from}: tambien esta configurado como 410`);
  }

  if (isGonePath(entry.to)) {
    errors.push(`${entry.source} redirect ${entry.from}: destino ${entry.to} esta configurado como 410`);
  }

  if (
    (entry.to.startsWith("/productos/") || entry.to.startsWith("/categorias/")) &&
    !cmsRoutes.has(entry.to)
  ) {
    errors.push(`${entry.source} redirect ${entry.from}: destino inexistente en cms/routes.json (${entry.to})`);
  }
}

for (const gonePath of LEGACY_GONE_PATHS) {
  validateConfiguredPath("410 path", gonePath, errors);
}

for (const gonePrefix of LEGACY_GONE_PREFIXES) {
  validateConfiguredPath("410 prefijo", gonePrefix, errors, {
    keepTrailingSlash: true,
  });
}

for (const notFoundPath of LEGACY_NOT_FOUND_PATHS) {
  validateConfiguredPath("404 path", notFoundPath, errors);

  if (effectiveRedirects.has(notFoundPath)) {
    errors.push(`404 path ${notFoundPath}: también está configurado como redirect`);
  }

  if (isGonePath(notFoundPath)) {
    errors.push(`404 path ${notFoundPath}: también está configurado como 410`);
  }
}

const redirectChains = findRedirectChains(effectiveRedirects);
const redirectLoops = findRedirectLoops(effectiveRedirects);

for (const chain of redirectChains) {
  errors.push(`cadena de redirects: ${chain}`);
}

for (const loop of redirectLoops) {
  errors.push(`bucle de redirects: ${loop}`);
}

console.log("SEO redirects validation");
console.log(`Redirects validados: ${effectiveRedirects.size}`);
console.log(
  `URLs 410 validadas: ${LEGACY_GONE_PATHS.length + LEGACY_GONE_PREFIXES.length} (${LEGACY_GONE_PATHS.length} paths, ${LEGACY_GONE_PREFIXES.length} prefijos)`,
);
console.log(`URLs 404 explícitas validadas: ${LEGACY_NOT_FOUND_PATHS.length}`);

if (errors.length) {
  console.error(`\nErrores bloqueantes (${errors.length})`);
  console.error(formatList(errors));
} else {
  console.log("\nErrores bloqueantes: 0");
}

if (warnings.length) {
  console.warn(`\nWarnings (${warnings.length})`);
  console.warn(formatList(warnings));
} else {
  console.log("Warnings: 0");
}

if (errors.length) {
  process.exitCode = 1;
} else {
  console.log("\nSEO redirects OK");
}
