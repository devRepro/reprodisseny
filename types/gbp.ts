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
  averageRating?: number
  totalReviewCount?: number
}

// ✅ UI-friendly
export interface UiReview {
  author: string
  avatar?: string
  rating: number
  text: string
  time?: string
  reply?: string
}

// ✅ Locations (BI v1)
export interface GbpLocation {
  name: string           // "accounts/.../locations/..."
  displayName?: string
  placeId?: string
}
export interface UiLocation {
  id: string             // = name
  title: string          // = displayName
  placeId?: string
}
