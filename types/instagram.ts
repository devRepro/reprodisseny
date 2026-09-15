export type IgMediaItem = {
  id: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url?: string
  thumbnail_url?: string
  permalink: string
  caption?: string
  timestamp?: string
  username?: string
}

export type IgMediaResponse = {
  data: IgMediaItem[]
}
