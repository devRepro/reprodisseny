import {
  normalizeLeadTracking,
  type LeadTrackingNormalizationInput,
} from "~/utils/tracking/leadAttribution"

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== "string") continue

    const cleaned = value.trim()
    if (cleaned) return cleaned
  }

  return null
}

function inferFormType(tracking: unknown, fallback: LeadTrackingNormalizationInput["formType"]) {
  if (!isRecord(tracking)) return fallback

  const rawTracking = isRecord(tracking.rawTracking) ? tracking.rawTracking : {}
  const rawContext = isRecord(rawTracking.context) ? rawTracking.context : {}
  const context = isRecord(tracking.context) ? tracking.context : {}

  return firstString(
    tracking.formType,
    rawTracking.formType,
    context.formName,
    rawContext.formName,
    fallback,
  )
}

export function normalizeServerLeadTracking(input: LeadTrackingNormalizationInput) {
  return normalizeLeadTracking({
    ...input,
    formType: inferFormType(input.tracking, input.formType),
  })
}
