// utils/path.ts
export const joinPath = (...parts: (string|undefined|null)[]) => {
    const p = parts.filter(Boolean).join('/').replace(/\/{2,}/g, '/')
    return p.startsWith('/') ? p.replace(/\/$/, '') || '/' : `/${p.replace(/\/$/, '')}`
  }
  export const buildCategoryPath = (slug?: string) => joinPath('/categorias', slug)
  