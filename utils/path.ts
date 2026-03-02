// utils/path.ts
export const joinPath = (...parts: (string|undefined|null)[]) => {
    const p = parts.filter(Boolean).join('/').replace(/\/{2,}/g, '/')
    return p.startsWith('/') ? p.replace(/\/$/, '') || '/' : `/${p.replace(/\/$/, '')}`
  }
  export const buildCategoryPath = (slug?: string) => joinPath('/categorias', slug)
  export const slug = (input: string) =>
  input
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')