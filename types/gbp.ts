// types/gbp.ts
export type StarRating = 'ONE'|'TWO'|'THREE'|'FOUR'|'FIVE'

export interface GbpReviewer {
  displayName?: string
  profilePhotoUrl?: string
  isAnonymous?: boolean
}

export interface GbpReviewReply {
  comment?: string
  updateTime?: string
}

export interface GbpReview {
  name?: string          // e.g. "accounts/123/locations/456/reviews/abc"
  reviewId?: string
  reviewer?: GbpReviewer
  starRating?: StarRating
  comment?: string
  createTime?: string
  updateTime?: string
  reviewReply?: GbpReviewReply
}

export interface GbpReviewsResponse {
  reviews?: GbpReview[]
  nextPageToken?: string
}

export interface UiReview {
  author: string
  avatar?: string
  rating: number
  text: string
  time?: string
}
