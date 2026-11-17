export const PUBLICATIONS_PATH = '/categorias/libros-revistas-catalogos';
export const EDITORIAL_LANDING_PATHS = {
  catalogos: '/productos/impresion-catalogos-barcelona',
  revistas: '/productos/impresion-revistas-barcelona',
} as const;

export type EditorialPublication = keyof typeof EDITORIAL_LANDING_PATHS;

export const EDITORIAL_SEO = {
  catalogos: {
    title: 'Impresión de catálogos en Barcelona | Repro Disseny',
    description: 'Imprimimos catálogos personalizados, comerciales y de producto en Barcelona. Diferentes formatos, papeles, encuadernaciones y acabados. Solicita presupuesto.',
  },
  revistas: {
    title: 'Imprimir revistas en Barcelona | Repro Disseny',
    description: 'Imprimimos revistas personalizadas, corporativas y editoriales en Barcelona. Revistas grapadas y fresadas, formatos A4, A5 y especiales. Solicita presupuesto.',
  },
} as const;

// Allowlisted contexts for the existing quote form. Never trust arbitrary query labels/slugs.
export const EDITORIAL_QUOTE_CONTEXTS = {
  editorial: {categorySlug: 'libros-revistas-catalogos', productName: 'Publicaciones editoriales', productSlug: 'publicaciones-editoriales'},
  catalogos: {categorySlug: 'libros-revistas-catalogos', productName: 'Impresión de catálogos', productSlug: 'impresion-catalogos-barcelona'},
  revistas: {categorySlug: 'libros-revistas-catalogos', productName: 'Impresión de revistas', productSlug: 'impresion-revistas-barcelona'},
} as const;

export function resolveEditorialQuoteContext(value: unknown) {
  return typeof value === 'string' && Object.hasOwn(EDITORIAL_QUOTE_CONTEXTS, value)
    ? EDITORIAL_QUOTE_CONTEXTS[value as keyof typeof EDITORIAL_QUOTE_CONTEXTS]
    : undefined;
}

// Contextual reading paths, separate from CMS product records and their technical content.
export const EDITORIAL_PRODUCT_LINKS: Record<string, {prefix: string; label: string; to: string}> = {
  'encuadernado-con-grapas': {prefix: 'Si estás preparando una publicación periódica, consulta nuestras opciones de ', label: 'impresión de revistas grapadas', to: EDITORIAL_LANDING_PATHS.revistas},
  'encuadernacion-encolada-tapa-blanda': {prefix: 'Para presentar tus productos o colecciones, descubre el servicio de ', label: 'impresión de catálogos', to: EDITORIAL_LANDING_PATHS.catalogos},
  'cosida-tapa-blanda': {prefix: 'Para definir la publicación antes de elegir su encuadernación, consulta nuestras ', label: 'soluciones de impresión editorial', to: PUBLICATIONS_PATH},
  'encuadernacion-wire-o': {prefix: 'Si necesitas una publicación de consulta frecuente, explora nuestras ', label: 'soluciones editoriales para empresas', to: PUBLICATIONS_PATH},
};
