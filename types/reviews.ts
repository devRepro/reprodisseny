/** Una reseña tal como la expone nuestro endpoint (mock/real) */
export interface ReviewDTO {
  rating: number
  text: string
  author: string
  profilePhotoUri?: string | null
  publishTime?: string
  relativeTime?: string
}

/** Respuesta normalizada de /api/google/places/reviews */
export interface ReviewsResponseDTO {
  rating?: number              // media global (0..5)
  userRatingCount?: number     // nº total de valoraciones
  reviews: ReadonlyArray<ReviewDTO> // hasta 5 en Places API
}

/** Parámetros del endpoint */
export interface ReviewsQuery {
  placeId: string
  lang?: string                // es / ca / en ...
}

/** Estructura de tarjeta para el carrusel */
export interface ReviewCardItem {
  id: string
  author: string
  rating: number
  text: string
  time: string
  avatar?: string | null
  url?: string
}
