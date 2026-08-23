export { CANONICAL_ORIGIN } from "./canonicalHostRedirect";

export const LEGACY_HOSTS = [
  "www.reprodisseny.com",
  "demo.reprodisseny.com",
  "blog.reprodisseny.com",
  "calendarios.reprodisseny.com",
] as const;

/**
 * Redirecciones manuales decididas en la revisión de Google Search Console.
 * No duplicar estos orígenes en redirect-rules.generated.ts.
 */
export const MANUAL_LEGACY_REDIRECTS = {
  "/product/banderas-personalizadas-presupuesto": "/productos/banderolas-personalizadas",
  "/manual-para-hacer-un-buen-flyer": "/como-preparar-archivos",
} as const;

/**
 * Excepciones temporales aprobadas para pares base/printestimate cuyo destino
 * semántico sigue pendiente de revisión. El validador exige que cualquier
 * divergencia esté enumerada aquí con un motivo explícito.
 */
export const PRINT_ESTIMATE_DESTINATION_EXCEPTIONS = {
  "/product/vinilo-alta-adherencia-presupuesto":
    "Equivalencia semántica pendiente: no modificar base ni printestimate en esta fase.",
  "/product/vinilo-removible-presupuesto":
    "Equivalencia semántica pendiente: no modificar base ni printestimate en esta fase.",
  "/product/vinilo-transparente-presupuesto":
    "Equivalencia semántica pendiente: no modificar base ni printestimate en esta fase.",
} as const;

/**
 * Rutas internas que deben seguir accesibles con 200, pero no indexarse ni
 * formar parte del sitemap.
 */
export const MANUAL_NOINDEX_PATHS = {
  "/buscar": "noindex, follow",
  "/gracias": "noindex, nofollow",
  "/novedades": "noindex, follow",
} as const;

export const LEGACY_GONE_PREFIXES = [
  "/assets/Download/",
  "/DefaultCaptcha/",
  "/Cart/",
  "/cart/",
  "/author/",
  "/tag/",
  "/blog/",
  "/wp-content/",
  "/wp-includes/",
  "/wp-json/",
] as const;

export const LEGACY_GONE_PATHS = [
  "/Content/404.html",
  "/Orders/GetOrderItemProofFiles",
  "/feed",
  "/productfileupload",
  "/savedforlater",
  "/settings",
  "/blog",
  "/page/escoles",
  "/adevinta-estrena-nuevas-oficinas",
  "/adevinta-estrena-nuevas-oficines",
  "/web2print-corporativa-adevinta",
  "/product/plantilla-tarjeta-3",
  "/product/plantilla-tarjeta-4",
  "/product/plantilla-tarjeta-13",
  "/product/plantilla-tarjeta-10",
  "/Collections/States",
  "/product/plantilla-tarjeta-7",
  "/product/diseno-tarjeta-8555-2c",
  "/product/diseno-tarjeta-8555-1c",
  "/promo-test",
  "/xmlrpc.php",
] as const;

/**
 * Clasificaciones del Excel corregidas tras comprobar que no existe un
 * sustituto equivalente. Estas rutas deben conservar una respuesta 404 real.
 */
export const LEGACY_NOT_FOUND_PATHS = [
  "/page/aviso-legal",
  // Producto futuro: revisar cuando exista una URL canónica publicada.
  "/page/rosa-sant-jordi",
  "/page/darse-de-baja",
] as const;
