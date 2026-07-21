export interface ReviewsQuery {
  placeId?: string;
  lang?: string;
  limit?: number;
}

export interface ReviewDTO {
  rating: number;
  text: string;
  author: string;
  authorUri: string | null;
  profilePhotoUri: string | null;
  publishTime?: string;
  relativeTime?: string;
}

export interface ReviewsResponseDTO {
  rating?: number;
  userRatingCount?: number;
  mapsUrl?: string;
  reviews: ReadonlyArray<ReviewDTO>;
}

export interface ReviewCardItem {
  id: string;
  author: string;
  avatar?: string | null;
  rating: number;
  text: string;
  time?: string;
  url?: string;
}

export interface UiReview {
  author: string;
  avatar?: string | null;
  rating: number;
  text: string;
  time?: string;
  source?: "google";
}

export interface UiReviewsPayload {
  rating?: number;
  userRatingCount?: number;
  mapsUrl?: string;
  reviews: ReadonlyArray<UiReview>;
}
