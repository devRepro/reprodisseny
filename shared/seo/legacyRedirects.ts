export const CANONICAL_ORIGIN = "https://reprodisseny.com";

export const LEGACY_HOSTS = [
  "www.reprodisseny.com",
  "demo.reprodisseny.com",
  "blog.reprodisseny.com",
  "calendarios.reprodisseny.com",
] as const;

export const MANUAL_LEGACY_REDIRECTS = {
  "/product/imprimir-fotos-en-lienzos-presupuesto": "/productos/carteles-personalizados-gran-formato",
  "/product/imprimir-fotos-en-lienzos-presupuesto/printestimate": "/productos/carteles-personalizados-gran-formato",

  "/producto/lienzos": "/productos/carteles-personalizados-gran-formato",
  "/producte/lienzos": "/productos/carteles-personalizados-gran-formato",

  "/ca/producte/samarretes": "/productos/dorsales-carrera",
  "/ca/p/ca/producte/samarretes": "/productos/dorsales-carrera",
  "/producte/samarretes": "/productos/dorsales-carrera",

  "/producto/delantal": "/categorias/hosteleria-restauracion",
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
