// utils/images.ts
export const PLACEHOLDERS = {
  product: '/img/placeholders/productos.webp',
  category: '/img/placeholders/categoria.webp',
}

// Puede llegar string u objeto { src }, o nada.
// Devuelve SIEMPRE un string listo para <NuxtImg>.
type RawImage = string | { src?: string; width?: number; height?: number } | null | undefined;

export function toSrc(raw: RawImage, type: 'product' | 'category', base?: string) {
  let src = '';
  if (typeof raw === 'string') src = raw;
  else if (raw && typeof raw === 'object' && raw.src) src = raw.src;

  // si viene vacía → placeholder según tipo
  if (!src) src = PLACEHOLDERS[type];

  // si es relativo y hay base, prefija base
  if (base && !src.startsWith('/') && !src.startsWith('http')) {
    src = `${base.replace(/\/+$/, '')}/${src.replace(/^\/+/, '')}`;
  }
  return src;
}

// Preset típico para <NuxtImg sizes>
export const SIZES_PRESET =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
