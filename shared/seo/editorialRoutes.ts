export const PUBLICATIONS_PATH = '/categorias/libros-revistas-catalogos';
export const EDITORIAL_LANDING_PATHS = {
  catalogos: '/productos/impresion-catalogos-barcelona',
  revistas: '/productos/impresion-revistas-barcelona',
} as const;

export type EditorialPublication = keyof typeof EDITORIAL_LANDING_PATHS;

export const EDITORIAL_SEO = {
  catalogos: {
    title: 'Impresión de catálogos en Barcelona | Repro Disseny',
    description: 'Imprimimos catálogos comerciales y de producto en Barcelona. Diferentes formatos, papeles, encuadernaciones y acabados personalizados. Solicita presupuesto.',
  },
  revistas: {
    title: 'Imprimir revistas en Barcelona | Repro Disseny',
    description: 'Imprimimos revistas corporativas, editoriales y publicaciones periódicas en Barcelona. Diferentes formatos, papeles y encuadernaciones. Solicita presupuesto.',
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
