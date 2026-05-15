import { createError, getQuery, getRequestURL, sendRedirect } from "h3";

// Redirige URLs antiguas indexadas como:
// /error/notfound?aspxerrorpath=/ruta-antigua
//
// Origen: URL antigues a destino.xlsx

const LEGACY_NOT_FOUND_REDIRECTS = {
  "/Orders/GetOrderItemProofFiles": "/",
  "/adevinta-estrena-nuevas-oficines": "/",
  "/adevinta-estrena-nuevas-oficinas": "/",
  "/ca/manual-para-hacer-un-buen-flyer": "/como-preparar-archivos",
  "/ca/producte/acreditacions": "/productos/acreditaciones-personalizadas",
  "/ca/producte/estovalles-individuals": "/productos/manteles-individuales-personalizados",
  "/ca/producte/penjador-dampolles": "/productos/colgador-de-botellas-personalizado",
  "/ca/producte/samarretes": "/categorias/eventos",
  "/categorias/adhesivos-personalizados": "/categorias/adhesivos-personalizados",
  "/estrenamos-una-mesa-de-corte-digital-esko": "/productos/flyers-con-forma-personalizados",
  "/expositores-publicitarios": "/categorias/expositores",
  "/productfileupload": "/",
  "/producto/agenda": "/productos/agendas-personalizadas",
  "/producto/backlights": "/productos/cajas-de-luz-personalizadas",
  "/producto/banderas": "/productos/banderolas-personalizadas",
  "/producto/bloc-autocopiativo": "/productos/talonarios-autocopiativos-personalizados",
  "/producto/bloc-de-notas": "/productos/blocs-notas",
  "/producto/calendarios": "/productos/calendarios-personalizados",
  "/producto/carpetas": "/productos/carpetas-de-presentacion-personalizadas",
  "/producto/carta-de-restaurante": "/productos/cartas-restaurante-personalizadas",
  "/producto/display-de-mesa-con-peana": "/productos/displays-de-mesa-personalizados",
  "/producto/etiquetas-adhesivas-de-papel": "/categorias/adhesivos-personalizados",
  "/producto/etiquetas-adhesivas-en-bobina": "/productos/etiquetas-adhesivas-en-bobina",
  "/producto/identificadores-maleta": "/productos/identificador-maleta",
  "/producto/imanes": "/productos/imanes-publicitarios",
  "/producto/imanes-para-vehiculos": "/productos/lamina-magnetica-impresa",
  "/producto/lanyard": "/productos/lanyards-eventos-barcelona",
  "/producto/libretas": "/productos/libretas-personalizadas",
  "/producto/libros-bajo-demanda": "/categorias/libros-revistas-catalogos",
  "/producto/manteles-individuales": "/productos/manteles-individuales-personalizados",
  "/producto/minutas": "/categorias/publicidad-oficina/material-oficina",
  "/producto/mostradores": "/categorias/expositores",
  "/producto/paneles-de-pvc": "/categorias/gran-formato/material-rigido",
  "/producto/photocalls": "/productos/photocall-personalizado",
  "/producto/poming": "/productos/colgador-puerta-personalizado",
  "/producto/posavasos": "/productos/posavasos",
  "/producto/puntos-de-libro": "/productos/puntos-de-libro-personalizados",
  "/producto/sobres-y-bolsas": "/productos/sobres-personalizados",
  "/producto/tesis-doctoral": "/categorias/libros-revistas-catalogos",
  "/producto/totem": "/productos/totems-publicitarios-personalizados",
  "/producto/vinilo-al-acido": "/productos/vinilo-para-cristal",
  "/producto/vinilos-adhesivos": "/categorias/adhesivos-personalizados",
  "/producto/vinilos-de-corte": "/productos/vinilo-de-corte",
  "/producto/vinilos-de-escaparate": "/productos/vinilo-para-cristal",
  "/productos/banderolas-lineal": "/productos/banderolas-lineal-personalizadas",
  "/productos/banderolas-lineal-personalizadas": "/productos/banderolas-lineal-personalizadas",
} as const satisfies Record<string, string>;

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeLegacyPath(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return "";
  }

  let path = String(rawValue).trim();

  if (!path) {
    return "";
  }

  path = safeDecodeURIComponent(path);

  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    // Seguimos normalizando como path.
  }

  path = path.split("#")[0] ?? "";
  path = path.split("?")[0] ?? "";

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  path = path.replace(/\/{2,}/g, "/");

  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }

  return path;
}

function isSafeInternalDestination(destination: string) {
  return destination.startsWith("/") && !destination.startsWith("//");
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  // Solo interceptamos esta URL antigua.
  // El resto de la web no se toca.
  if (url.pathname !== "/error/notfound") {
    return;
  }

  const query = getQuery(event);
  const legacyPath = normalizeLegacyPath(query.aspxerrorpath);

  if (!legacyPath) {
    throw createError({
      statusCode: 410,
      statusMessage: "Gone",
    });
  }

  const destination =
    LEGACY_NOT_FOUND_REDIRECTS[
      legacyPath as keyof typeof LEGACY_NOT_FOUND_REDIRECTS
    ];

  if (destination && isSafeInternalDestination(destination)) {
    return sendRedirect(event, destination, 301);
  }

  throw createError({
    statusCode: 410,
    statusMessage: "Gone",
  });
});