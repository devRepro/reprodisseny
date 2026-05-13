// server/routes/error/notfound.get.ts
// Redirige URLs antiguas indexadas como /error/notfound?aspxerrorpath=/ruta-antigua
// Archivo generado desde: Copia de URL antigues a destino.xlsx

const legacyNotFoundRedirects: Record<string, string> = {
  "/Orders/GetOrderItemProofFiles": "/",
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
};

function normalizePath(value: unknown) {
  const path = String(value ?? "").trim();
  if (!path) return "";
  const decoded = decodeURIComponent(path);
  const withSlash = decoded.startsWith("/") ? decoded : `/${decoded}`;
  return withSlash !== "/" ? withSlash.replace(/\/+$/, "") : "/";
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const legacyPath = normalizePath(query.aspxerrorpath);
  const destination = legacyNotFoundRedirects[legacyPath];

  if (destination) {
    return sendRedirect(event, destination, 301);
  }

  return sendRedirect(event, "/", 301);
});
