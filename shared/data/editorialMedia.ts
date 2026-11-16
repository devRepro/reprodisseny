// Select only existing catalog/registry media. No new uploads or client attribution.
export const EDITORIAL_MEDIA = {
  catalogos: {type: 'category-detail', role: 'detail', alt: 'Detalle de una cubierta impresa con acabado metalizado'},
  revistas: {type: 'product', slug: 'encuadernado-con-grapas'},
} as const;
