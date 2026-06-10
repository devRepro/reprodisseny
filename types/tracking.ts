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
  source?: string
  medium?: string
  campaign?: string
  campaignId?: string
  term?: string
  content?: string

  gclid?: string
  gbraid?: string
  wbraid?: string
  fbclid?: string
  msclkid?: string

  landingPath?: string
  landingUrl?: string
  referrer?: string
  firstSeenAt?: string
  lastSeenAt?: string
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