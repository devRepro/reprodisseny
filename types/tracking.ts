// ~/types/tracking.ts

export type TrackingPageType =
  | "home"
  | "landing"
  | "category"
  | "subcategory"
  | "product"
  | "contact"
  | "crm"

export type TrackingEventName =
  | "page_context"
  | "cta_click"
  | "form_start"
  | "form_validation_error"
  | "generate_lead"
  | "contact_click"
  | "file_download"

export type AttributionData = {
  source?: string | null
  medium?: string | null
  campaign?: string | null
  campaignId?: string | null
  gadCampaignId?: string | null
  term?: string | null
  content?: string | null

  gclid?: string | null
  gbraid?: string | null
  wbraid?: string | null
  fbclid?: string | null
  msclkid?: string | null

  landingPath?: string | null
  landingUrl?: string | null
  referrer?: string | null
  firstSeenAt?: string | null
  lastSeenAt?: string | null
}

export type TrackingContext = {
  pageType: TrackingPageType
  pageLanguage?: "ca" | "es" | "en"
  contentGroup?: string
  serviceName?: string
  campaignName?: string
  campaignId?: string
  productSlug?: string
  categorySlug?: string
  formId?: string
  formName?: string
}

export type TrackingPayload = Record<string, unknown>
