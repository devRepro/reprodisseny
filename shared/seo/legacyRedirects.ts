export const CANONICAL_ORIGIN = "https://reprodisseny.com";

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
  "/manual-para-hacer-un-buen-flyer",
  "/product/plantilla-tarjeta-3",
  "/product/plantilla-tarjeta-4",
  "/product/plantilla-tarjeta-13",
  "/product/plantilla-tarjeta-10",
  "/Collections/States",
  "/product/plantilla-tarjeta-7",
  "/product/diseno-tarjeta-8555-2c",
  "/product/diseno-tarjeta-8555-1c",
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
