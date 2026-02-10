export interface UiReview {
  author: string
  avatar?: string | null
  rating: number
  text: string
  time?: string
  source?: "google"
}

export interface UiReviewsPayload {
  rating?: number
  userRatingCount?: number
  mapsUrl?: string
  reviews: ReadonlyArray<UiReview>
}
