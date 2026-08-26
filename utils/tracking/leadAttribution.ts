import type { AttributionData, TrackingContext } from "../../types/tracking"

export type LeadAttribution = {
  first: AttributionData | null
  last: AttributionData | null
}

export type LeadTrackingNormalizationInput = {
  tracking?: Record<string, any> | null
  utm?: Record<string, any> | null
  sourceUrl: string
  categorySlug?: string | null
  productSlug?: string | null
  formType?: string | null
}

export const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const

const GOOGLE_ADS_CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid"] as const
const OWN_HOSTS = new Set(["reprodisseny.com", "www.reprodisseny.com"])

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function cleanString(value: unknown, max = 300) {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const cleaned = cleanString(value)
    if (cleaned) return cleaned
  }

  return null
}

function getParamValue(params: URLSearchParams, key: string) {
  return cleanString(params.get(key))
}

function hasGoogleAdsClickId(touch: Record<string, any>) {
  return GOOGLE_ADS_CLICK_ID_KEYS.some((key) => cleanString(touch[key]))
}

function hasCampaignFields(touch: Record<string, any>) {
  return Boolean(
    firstString(
      touch.source,
      touch.medium,
      touch.campaign,
      touch.campaignId,
      touch.term,
      touch.content,
      touch.gclid,
      touch.gbraid,
      touch.wbraid,
      touch.fbclid,
      touch.msclkid,
    ),
  )
}

function hasExplicitCampaignEvidence(touch: Record<string, any>) {
  return Boolean(
    hasGoogleAdsClickId(touch) ||
      getTrackingParamsFromUrl(firstString(touch.landingUrl) || "") ||
      firstString(touch.campaign, touch.campaignId, touch.term, touch.content),
  )
}

function hostnameFromUrl(value: unknown) {
  const text = cleanString(value, 1000)
  if (!text) return null

  try {
    return new URL(text, "https://reprodisseny.com").hostname.toLowerCase()
  } catch {
    return null
  }
}

function isOwnHost(hostname: string | null, currentHostname?: string | null) {
  if (!hostname) return false
  if (currentHostname && hostname === currentHostname.toLowerCase()) return true
  return OWN_HOSTS.has(hostname)
}

function isOwnReferrer(referrer: unknown, landingUrl: unknown) {
  const referrerHost = hostnameFromUrl(referrer)
  if (!referrerHost) return false

  return isOwnHost(referrerHost, hostnameFromUrl(landingUrl))
}

export function normalizeTrackingParams(query: Record<string, unknown> | null | undefined) {
  const out: Record<string, string> = {}

  for (const [rawKey, value] of Object.entries(query || {})) {
    const normalizedKey = rawKey.toLowerCase()
    if (!TRACKING_PARAM_KEYS.includes(normalizedKey as (typeof TRACKING_PARAM_KEYS)[number])) {
      continue
    }

    out[normalizedKey] = Array.isArray(value)
      ? String(value[0] ?? "")
      : String(value ?? "")
  }

  return Object.keys(out).length ? out : null
}

export function getTrackingParamsFromUrl(url: string) {
  try {
    const parsed = new URL(url, "https://reprodisseny.com")
    return normalizeTrackingParams(Object.fromEntries(parsed.searchParams.entries()))
  } catch {
    return null
  }
}

export function normalizeAttributionTouch(value: unknown): AttributionData | null {
  if (!isRecord(value)) return null

  const normalized: AttributionData = {
    source: firstString(value.source),
    medium: firstString(value.medium),
    campaign: firstString(value.campaign),
    campaignId: firstString(value.campaignId, value.campaign_id),
    term: firstString(value.term),
    content: firstString(value.content),

    gclid: firstString(value.gclid),
    gbraid: firstString(value.gbraid),
    wbraid: firstString(value.wbraid),
    fbclid: firstString(value.fbclid),
    msclkid: firstString(value.msclkid),

    landingPath: firstString(value.landingPath, value.landing_page, value.landingPage),
    landingUrl: firstString(value.landingUrl, value.landing_url, value.landingPage),
    referrer: firstString(value.referrer),
    firstSeenAt: firstString(value.firstSeenAt, value.capturedAt),
    lastSeenAt: firstString(value.lastSeenAt, value.capturedAt),
  }

  if (hasGoogleAdsClickId(normalized)) {
    normalized.source = normalized.source || "google"
    normalized.medium = normalized.medium || "cpc"
  }

  if (!hasCampaignFields(normalized) && !firstString(normalized.referrer, normalized.landingUrl)) {
    return null
  }

  return normalized
}

export function createAttributionTouchFromUrl(input: {
  url: string
  referrer?: string | null
  now?: string
}): AttributionData {
  const now = input.now || new Date().toISOString()
  const url = new URL(input.url, "https://reprodisseny.com")
  const params = url.searchParams
  const hasTrackingParams = TRACKING_PARAM_KEYS.some((key) => params.has(key))
  const hasGoogleClickId = GOOGLE_ADS_CLICK_ID_KEYS.some((key) => params.has(key))

  if (hasTrackingParams) {
    return normalizeAttributionTouch({
      source: getParamValue(params, "utm_source") || (hasGoogleClickId ? "google" : null),
      medium: getParamValue(params, "utm_medium") || (hasGoogleClickId ? "cpc" : null),
      campaign: getParamValue(params, "utm_campaign"),
      campaignId: getParamValue(params, "utm_id"),
      term: getParamValue(params, "utm_term"),
      content: getParamValue(params, "utm_content"),
      gclid: getParamValue(params, "gclid"),
      gbraid: getParamValue(params, "gbraid"),
      wbraid: getParamValue(params, "wbraid"),
      fbclid: getParamValue(params, "fbclid"),
      msclkid: getParamValue(params, "msclkid"),
      landingPath: url.pathname,
      landingUrl: url.href,
      referrer: cleanString(input.referrer || undefined),
      firstSeenAt: now,
      lastSeenAt: now,
    }) as AttributionData
  }

  if (input.referrer && !isOwnReferrer(input.referrer, url.href)) {
    return {
      source: hostnameFromUrl(input.referrer) || "referral",
      medium: "referral",
      landingPath: url.pathname,
      landingUrl: url.href,
      referrer: input.referrer,
      firstSeenAt: now,
      lastSeenAt: now,
    }
  }

  return {
    source: "direct",
    medium: "none",
    landingPath: url.pathname,
    landingUrl: url.href,
    referrer: cleanString(input.referrer || undefined) || undefined,
    firstSeenAt: now,
    lastSeenAt: now,
  }
}

export function isDirectAttributionTouch(touch: AttributionData | null | undefined) {
  const source = cleanString(touch?.source)?.toLowerCase()
  const medium = cleanString(touch?.medium)?.toLowerCase()

  return source === "direct" && (!medium || medium === "none" || medium === "direct")
}

export function isExternalAttributionTouch(touch: AttributionData | null | undefined) {
  const normalized = normalizeAttributionTouch(touch)
  if (!normalized || isDirectAttributionTouch(normalized)) return false
  if (hasExplicitCampaignEvidence(normalized)) return true
  if (isOwnReferrer(normalized.referrer, normalized.landingUrl)) return false

  return Boolean(
    hasGoogleAdsClickId(normalized) ||
      firstString(normalized.source) ||
      firstString(normalized.medium) ||
      firstString(normalized.referrer),
  )
}

export function normalizeLeadAttribution(value: unknown): LeadAttribution {
  const attribution = isRecord(value) ? value : {}
  const first = normalizeAttributionTouch(attribution.first)
  const last = normalizeAttributionTouch(attribution.last)

  return {
    first,
    last: isExternalAttributionTouch(last) ? last : null,
  }
}

export function updateLeadAttribution(
  current: LeadAttribution,
  incomingTouch: AttributionData | null,
): LeadAttribution {
  const currentFirst = normalizeAttributionTouch(current.first)
  const currentLast = normalizeAttributionTouch(current.last)
  const incoming = normalizeAttributionTouch(incomingTouch)

  const first = currentFirst || incoming || null
  const last = isExternalAttributionTouch(incoming)
    ? incoming
    : isExternalAttributionTouch(currentLast)
      ? currentLast
      : null

  return { first, last }
}

export function selectLeadAttributionTouch(attribution: LeadAttribution) {
  const normalized = normalizeLeadAttribution(attribution)

  if (isExternalAttributionTouch(normalized.last)) return normalized.last
  return normalized.first
}

function createTouchFromTrackingParams(input: {
  params?: Record<string, any> | null
  sourceUrl: string
}) {
  const params = normalizeTrackingParams(input.params)
  if (!params) return null

  const searchParams = new URLSearchParams(params)
  const hasGoogleClickId = GOOGLE_ADS_CLICK_ID_KEYS.some((key) => searchParams.has(key))
  const now = new Date().toISOString()

  return normalizeAttributionTouch({
    source: firstString(params.utm_source) || (hasGoogleClickId ? "google" : null),
    medium: firstString(params.utm_medium) || (hasGoogleClickId ? "cpc" : null),
    campaign: firstString(params.utm_campaign),
    campaignId: firstString(params.utm_id, params.campaign_id),
    term: firstString(params.utm_term),
    content: firstString(params.utm_content),
    gclid: firstString(params.gclid),
    gbraid: firstString(params.gbraid),
    wbraid: firstString(params.wbraid),
    fbclid: firstString(params.fbclid),
    msclkid: firstString(params.msclkid),
    landingUrl: input.sourceUrl,
    landingPath: (() => {
      try {
        return new URL(input.sourceUrl, "https://reprodisseny.com").pathname
      } catch {
        return null
      }
    })(),
    firstSeenAt: now,
    lastSeenAt: now,
  })
}

function createLegacyTouch(tracking: Record<string, any>, sourceUrl: string) {
  const normalized = isRecord(tracking.normalized) ? tracking.normalized : {}

  return normalizeAttributionTouch({
    source: firstString(
      tracking.TrackingSource,
      tracking.trackingSource,
      normalized.trackingSource,
    ),
    medium: firstString(
      tracking.TrackingMedium,
      tracking.trackingMedium,
      normalized.trackingMedium,
    ),
    campaign: firstString(
      tracking.TrackingCampaign,
      tracking.trackingCampaign,
      normalized.trackingCampaign,
    ),
    campaignId: firstString(
      tracking.TrackingCampaignId,
      tracking.trackingCampaignId,
      normalized.trackingCampaignId,
    ),
    landingUrl: firstString(tracking.SourceUrl, tracking.sourceUrl, normalized.sourceUrl, sourceUrl),
  })
}

function resolveNormalizedTouch(input: LeadTrackingNormalizationInput) {
  const tracking = isRecord(input.tracking) ? input.tracking : {}
  const receivedAttribution = normalizeLeadAttribution(tracking.attribution)
  const routeParams = normalizeTrackingParams(
    input.utm || tracking.routeUtm || getTrackingParamsFromUrl(input.sourceUrl),
  )
  const routeTouch = createTouchFromTrackingParams({
    params: routeParams,
    sourceUrl: input.sourceUrl,
  })
  const attribution = updateLeadAttribution(receivedAttribution, routeTouch)
  const selectedTouch = selectLeadAttributionTouch(attribution)

  if (selectedTouch) {
    return {
      attribution,
      selectedTouch,
      routeParams,
    }
  }

  const legacyTouch = createLegacyTouch(tracking, input.sourceUrl)
  const legacyAttribution = updateLeadAttribution(attribution, legacyTouch)

  return {
    attribution: legacyAttribution,
    selectedTouch: selectLeadAttributionTouch(legacyAttribution),
    routeParams,
  }
}

export function normalizeLeadTracking(input: LeadTrackingNormalizationInput) {
  const tracking = isRecord(input.tracking) ? input.tracking : {}
  const context = isRecord(tracking.context) ? tracking.context as Partial<TrackingContext> : {}
  const { attribution, selectedTouch, routeParams } = resolveNormalizedTouch(input)

  let source =
    firstString(selectedTouch?.source) ||
    (selectedTouch && hasCampaignFields(selectedTouch) ? "unknown" : "direct")
  let medium =
    firstString(selectedTouch?.medium) ||
    (selectedTouch && hasCampaignFields(selectedTouch) ? "unknown" : "none")
  const campaign = firstString(selectedTouch?.campaign)
  const campaignId = firstString(selectedTouch?.campaignId)
  if (isDirectAttributionTouch({ source, medium }) && firstString(campaign, campaignId)) {
    source = "unknown"
    medium = "unknown"
  }
  const sourceUrl =
    firstString(
      input.sourceUrl,
      tracking.SourceUrl,
      tracking.sourceUrl,
    ) || input.sourceUrl

  const normalized = {
    trackingSource: source,
    trackingMedium: isDirectAttributionTouch({ source, medium }) ? "none" : medium,
    trackingCampaign: campaign,
    trackingCampaignId: campaignId,
    sourceUrl,
    categorySlug: input.categorySlug ?? null,
    productSlug: input.productSlug ?? null,
  }

  const raw = {
    schemaVersion: 2,
    receivedAt: new Date().toISOString(),
    formType: input.formType ?? null,
    normalized,
    context,
    attribution,
    selectedTouch,
    utm: routeParams,
    rawTracking: tracking,
  }

  return {
    ...normalized,
    attribution,
    selectedTouch,
    routeUtm: routeParams,
    utmJson: JSON.stringify(raw),
  }
}
