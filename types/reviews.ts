// types/reviews.ts

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
    rating?: number               // media global del lugar (0..5)
    userRatingCount?: number      // nº total de valoraciones del lugar
    reviews: ReviewDTO[]          // hasta 5 en Places API
  }
  
  /** Parámetros del endpoint (útil si generas clientes tipados) */
  export interface ReviewsQuery {
    placeId: string
    lang?: string   // es / ca / en...
  }
  