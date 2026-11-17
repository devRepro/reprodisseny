// Select only existing catalog/registry media. No new uploads or client attribution.
export const EDITORIAL_MEDIA = {
  catalogos: {type: 'product', slug: 'cosida-tapa-blanda', alt: 'Publicación abierta con impresión interior a color y encuadernación cosida'},
  revistas: {type: 'product', slug: 'encuadernado-con-grapas'},
} as const;

export const EDITORIAL_FINISH_MEDIA = {role: 'detail', alt: 'Detalle de una cubierta impresa con acabado metalizado'} as const;
