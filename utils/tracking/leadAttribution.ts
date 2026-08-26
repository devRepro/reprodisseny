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
  "gad_campaignid",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const

const GOOGLE_ADS_CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid"] as const
const PAID_CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid", "msclkid", "fbclid"] as const
const OWN_HOSTS = new Set(["reprodisseny.com", "www.reprodisseny.com"])
const PAID_MEDIUMS = new Set([
  "cpc",
  "ppc",
  "paid",
  "paid_search",
  "paid_social",
  "paid_display",
  "display",
  "retargeting",
  "remarketing",
])
const ORGANIC_MEDIUMS = new Set(["organic", "seo"])
const REFERRAL_MEDIUMS = new Set(["referral", "referrer"])

export type AttributionTouchClass =
  | "paid_click_id"
  | "paid"
  | "organic"
  | "referral"
  | "direct"
  | "unknown"

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function cleanString(value: unknown, max = 300) {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function firstString(...values: unknown[]) {
  return firstStringMax(300, ...values)
}

function firstStringMax(max: number, ...values: unknown[]) {
  for (const value of values) {
    const cleaned = cleanString(value, max)
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

function hasPaidClickId(touch: Record<string, any>) {
  return PAID_CLICK_ID_KEYS.some((key) => cleanString(touch[key]))
}

function hasCampaignFields(touch: Record<string, any>) {
  return Boolean(
    firstString(
      touch.source,
      touch.medium,
      touch.campaign,
      touch.campaignId,
      touch.gadCampaignId,
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
      firstString(touch.campaign, touch.campaignId, touch.gadCampaignId, touch.term, touch.content),
  )
}

function normalizeMedium(value: unknown) {
  return cleanString(value)?.toLowerCase().replace(/[\s-]+/g, "_") || null
}

function isPaidMedium(value: unknown) {
  const medium = normalizeMedium(value)
  return Boolean(medium && PAID_MEDIUMS.has(medium))
}

function isOrganicMedium(value: unknown) {
  const medium = normalizeMedium(value)
  return Boolean(medium && ORGANIC_MEDIUMS.has(medium))
}

function isReferralMedium(value: unknown) {
  const medium = normalizeMedium(value)
  return Boolean(medium && REFERRAL_MEDIUMS.has(medium))
}

function hostnameFromUrl(value: unknown) {
  const text = cleanString(value, 2000)
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

function classifySearchEngineHost(hostname: string | null) {
  if (!hostname) return null

  const host = hostname.toLowerCase().replace(/^www\./, "")

  if (/(^|\.)google\.[a-z.]{2,}$/.test(host)) return "google"
  if (host === "bing.com" || host.endsWith(".bing.com")) return "bing"
  if (host === "duckduckgo.com" || host.endsWith(".duckduckgo.com")) return "duckduckgo"
  if (host === "search.yahoo.com" || host.startsWith("search.yahoo.")) return "yahoo"

  return null
}

function classifySearchEngineReferrer(referrer: unknown) {
  return classifySearchEngineHost(hostnameFromUrl(referrer))
}

function normalizePaidClickIdTouch(touch: AttributionData) {
  const source = cleanString(touch.source)?.toLowerCase() || null
  const medium = normalizeMedium(touch.medium)
  const sourceLooksFallback =
    !source ||
    source === "direct" ||
    source === "referral" ||
    source === "referrer" ||
    source === "www.google.com" ||
    source === "google.com" ||
    source === "www.google.es" ||
    source === "google.es"
  const mediumLooksFallback =
    !medium ||
    medium === "none" ||
    medium === "direct" ||
    isOrganicMedium(medium) ||
    isReferralMedium(medium)

  if (hasGoogleAdsClickId(touch)) {
    if (sourceLooksFallback || classifySearchEngineHost(source) === "google") {
      touch.source = "google"
    }
    if (mediumLooksFallback) touch.medium = "cpc"
    return
  }

  if (firstStringMax(1000, touch.msclkid)) {
    if (sourceLooksFallback) touch.source = "bing"
    if (mediumLooksFallback) touch.medium = "cpc"
    return
  }

  if (firstStringMax(1000, touch.fbclid)) {
    if (sourceLooksFallback) touch.source = "facebook"
    if (mediumLooksFallback) touch.medium = "paid_social"
  }
}

function normalizeSearchEngineTouch(touch: AttributionData) {
  if (hasPaidClickId(touch) || hasExplicitCampaignEvidence(touch)) return
  if (!isReferralMedium(touch.medium) && firstString(touch.medium)) return

  const searchSource =
    classifySearchEngineHost(cleanString(touch.source)?.toLowerCase() || null) ||
    classifySearchEngineReferrer(touch.referrer)

  if (!searchSource) return

  touch.source = searchSource
  touch.medium = "organic"
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
    campaignId: firstString(value.campaignId, value.campaign_id, value.gad_campaignid, value.gadCampaignId),
    gadCampaignId: firstString(value.gadCampaignId, value.gad_campaignid),
    term: firstString(value.term),
    content: firstString(value.content),

    gclid: firstStringMax(1000, value.gclid),
    gbraid: firstStringMax(1000, value.gbraid),
    wbraid: firstStringMax(1000, value.wbraid),
    fbclid: firstStringMax(1000, value.fbclid),
    msclkid: firstStringMax(1000, value.msclkid),

    landingPath: firstStringMax(2000, value.landingPath, value.landing_page, value.landingPage),
    landingUrl: firstStringMax(2000, value.landingUrl, value.landing_url, value.landingPage),
    referrer: firstStringMax(2000, value.referrer),
    firstSeenAt: firstString(value.firstSeenAt, value.capturedAt),
    lastSeenAt: firstString(value.lastSeenAt, value.capturedAt),
  }

  normalizePaidClickIdTouch(normalized)
  normalizeSearchEngineTouch(normalized)

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
  const hasGoogleAdsEvidence = hasGoogleClickId || params.has("gad_campaignid")

  if (hasTrackingParams) {
    return normalizeAttributionTouch({
      source: getParamValue(params, "utm_source") || (hasGoogleAdsEvidence ? "google" : null),
      medium: getParamValue(params, "utm_medium") || (hasGoogleAdsEvidence ? "cpc" : null),
      campaign: getParamValue(params, "utm_campaign"),
      campaignId: getParamValue(params, "utm_id") || getParamValue(params, "gad_campaignid"),
      gadCampaignId: getParamValue(params, "gad_campaignid"),
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
    const searchSource = classifySearchEngineReferrer(input.referrer)

    return {
      source: searchSource || hostnameFromUrl(input.referrer) || "referral",
      medium: searchSource ? "organic" : "referral",
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

export function classifyAttributionTouch(touch: AttributionData | null | undefined): AttributionTouchClass {
  const normalized = normalizeAttributionTouch(touch)
  if (!normalized) return "unknown"
  if (isDirectAttributionTouch(normalized)) return "direct"
  if (hasPaidClickId(normalized)) return "paid_click_id"
  if (isPaidMedium(normalized.medium)) return "paid"
  if (isOrganicMedium(normalized.medium)) return "organic"
  if (isReferralMedium(normalized.medium) || firstString(normalized.referrer)) return "referral"
  return hasCampaignFields(normalized) ? "unknown" : "direct"
}

export function rankAttributionTouch(touch: AttributionData | null | undefined) {
  const classification = classifyAttributionTouch(touch)

  switch (classification) {
    case "paid_click_id":
      return 50
    case "paid":
      return 40
    case "organic":
      return 30
    case "referral":
      return 20
    case "unknown":
      return 10
    case "direct":
    default:
      return 0
  }
}

function isPaidAttributionClass(classification: AttributionTouchClass) {
  return classification === "paid_click_id" || classification === "paid"
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

  const first = normalized.first
  const last = normalized.last

  if (!first) return last
  if (!last) return first

  const firstClass = classifyAttributionTouch(first)
  const lastClass = classifyAttributionTouch(last)

  if (isPaidAttributionClass(firstClass) && isPaidAttributionClass(lastClass)) {
    return last
  }

  return rankAttributionTouch(last) > rankAttributionTouch(first) ? last : first
}

function createTouchFromTrackingParams(input: {
  params?: Record<string, any> | null
  sourceUrl: string
}) {
  const params = normalizeTrackingParams(input.params)
  if (!params) return null

  const searchParams = new URLSearchParams(params)
  const hasGoogleClickId = GOOGLE_ADS_CLICK_ID_KEYS.some((key) => searchParams.has(key))
  const hasGoogleAdsEvidence = hasGoogleClickId || searchParams.has("gad_campaignid")
  const now = new Date().toISOString()

  return normalizeAttributionTouch({
    source: firstString(params.utm_source) || (hasGoogleAdsEvidence ? "google" : null),
    medium: firstString(params.utm_medium) || (hasGoogleAdsEvidence ? "cpc" : null),
    campaign: firstString(params.utm_campaign),
    campaignId: firstString(params.utm_id, params.gad_campaignid, params.campaign_id),
    gadCampaignId: firstString(params.gad_campaignid),
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
      tracking.gad_campaignid,
      tracking.gadCampaignId,
    ),
    gadCampaignId: firstString(tracking.gadCampaignId, tracking.gad_campaignid),
    term: firstString(tracking.utm_term, tracking.term),
    content: firstString(tracking.utm_content, tracking.content),
    gclid: firstStringMax(1000, tracking.gclid),
    gbraid: firstStringMax(1000, tracking.gbraid),
    wbraid: firstStringMax(1000, tracking.wbraid),
    fbclid: firstStringMax(1000, tracking.fbclid),
    msclkid: firstStringMax(1000, tracking.msclkid),
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
    formType: input.formType ?? null,
    attribution,
    selectedTouch,
    routeUtm: routeParams,
    utmJson: JSON.stringify(raw),
  }
}
