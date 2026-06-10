// ~/utils/tracking/attribution.ts

import type { AttributionData } from "~/types/tracking"

const FIRST_ATTRIBUTION_KEY = "rd_first_attribution"
const LAST_ATTRIBUTION_KEY = "rd_last_attribution"

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
] as const

const CLICK_ID_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeAttributionFromUrl(): AttributionData | null {
  if (!import.meta.client) return null

  const url = new URL(window.location.href)
  const params = url.searchParams

  const hasUtm = UTM_KEYS.some((key) => params.has(key))
  const hasClickId = CLICK_ID_KEYS.some((key) => params.has(key))

  if (!hasUtm && !hasClickId) return null

  const now = new Date().toISOString()

  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
    campaignId: params.get("utm_id") || undefined,
    term: params.get("utm_term") || undefined,
    content: params.get("utm_content") || undefined,

    gclid: params.get("gclid") || undefined,
    gbraid: params.get("gbraid") || undefined,
    wbraid: params.get("wbraid") || undefined,
    fbclid: params.get("fbclid") || undefined,
    msclkid: params.get("msclkid") || undefined,

    landingPath: window.location.pathname,
    landingUrl: window.location.href,
    referrer: document.referrer || undefined,
    firstSeenAt: now,
    lastSeenAt: now,
  }
}

function inferOrganicOrDirectAttribution(): AttributionData {
  const now = new Date().toISOString()

  return {
    source: document.referrer ? "referral" : "direct",
    medium: document.referrer ? "referral" : "none",
    landingPath: window.location.pathname,
    landingUrl: window.location.href,
    referrer: document.referrer || undefined,
    firstSeenAt: now,
    lastSeenAt: now,
  }
}

export function captureAttribution() {
  if (!import.meta.client) return

  const explicitAttribution = normalizeAttributionFromUrl()
  const attribution = explicitAttribution || inferOrganicOrDirectAttribution()

  const existingFirst = safeJsonParse<AttributionData>(
    window.localStorage.getItem(FIRST_ATTRIBUTION_KEY),
  )

  if (!existingFirst) {
    window.localStorage.setItem(FIRST_ATTRIBUTION_KEY, JSON.stringify(attribution))
  }

  window.localStorage.setItem(
    LAST_ATTRIBUTION_KEY,
    JSON.stringify({
      ...attribution,
      lastSeenAt: new Date().toISOString(),
    }),
  )
}

export function getAttribution() {
  if (!import.meta.client) {
    return {
      first: null,
      last: null,
    }
  }

  return {
    first: safeJsonParse<AttributionData>(
      window.localStorage.getItem(FIRST_ATTRIBUTION_KEY),
    ),
    last: safeJsonParse<AttributionData>(
      window.localStorage.getItem(LAST_ATTRIBUTION_KEY),
    ),
  }
}