// ~/composables/useTracking.ts

import type {
  TrackingContext,
  TrackingEventName,
  TrackingPayload,
} from "~/types/tracking"
import { captureAttribution, getAttribution } from "~/utils/tracking/attribution"
import {
  getTrackingParamsFromUrl,
  normalizeLeadTracking,
} from "~/utils/tracking/leadAttribution"

type TrackingContextInput = Partial<TrackingContext>

const PII_EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/
const PII_PHONE_PATTERN = /(?:\+?\d[\s().-]*){7,}/

function safeTechnicalValue(value: unknown, maxLength = 120) {
  if (typeof value !== "string") return null

  const normalized = value.trim().slice(0, maxLength)
  if (!normalized) return null
  if (PII_EMAIL_PATTERN.test(normalized) || PII_PHONE_PATTERN.test(normalized)) {
    return null
  }

  return normalized
}

function toPrivacySafeLeadPayload(
  event: "form_start" | "form_validation_error" | "generate_lead",
  payload: TrackingPayload,
) {
  if (event === "generate_lead") return { lead_type: "quote_request" }
  if (event === "form_start") return {}

  const invalidFields = Array.isArray(payload.invalid_fields)
    ? payload.invalid_fields
        .filter((field): field is string =>
          typeof field === "string" && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(field),
        )
        .slice(0, 30)
    : []

  return {
    error_type: "client_validation",
    invalid_field_count: invalidFields.length,
    invalid_fields: invalidFields,
  }
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

function toDataLayerContext(context?: TrackingContextInput) {
  if (!context) return {}

  return {
    page_type: safeTechnicalValue(context.pageType),
    page_language: safeTechnicalValue(context.pageLanguage),
    content_group: safeTechnicalValue(context.contentGroup),
    service_name: safeTechnicalValue(context.serviceName),
    campaign_name: safeTechnicalValue(context.campaignName),
    campaign_id: safeTechnicalValue(context.campaignId),
    product_slug: safeTechnicalValue(context.productSlug),
    category_slug: safeTechnicalValue(context.categorySlug),
    form_id: safeTechnicalValue(context.formId),
    form_name: safeTechnicalValue(context.formName),
  }
}

export function useTracking(defaultContext?: TrackingContextInput) {
  function getCurrentSourceUrl() {
    if (!import.meta.client) return null

    return window.location.href
  }

  function getLeadTrackingSnapshot(context?: TrackingContextInput) {
    const mergedContext = {
      ...defaultContext,
      ...context,
    }

    if (!import.meta.client) {
      return {
        context: mergedContext,
        attribution: {
          first: null,
          last: null,
        },
        routeUtm: null,
        sourceUrl: null,
        normalized: {
          trackingSource: "direct",
          trackingMedium: "none",
          trackingCampaign: null,
          trackingCampaignId: null,
          sourceUrl: null,
          categorySlug: mergedContext.categorySlug ?? null,
          productSlug: mergedContext.productSlug ?? null,
        },
        TrackingSource: "direct",
        TrackingMedium: "none",
        TrackingCampaign: null,
        TrackingCampaignId: null,
        SourceUrl: null,
        UtmJson: "{}",
      }
    }

    captureAttribution()

    const sourceUrl = getCurrentSourceUrl() || ""
    const attribution = getAttribution()
    const routeUtm = getTrackingParamsFromUrl(sourceUrl)
    const normalized = normalizeLeadTracking({
      tracking: {
        context: mergedContext,
        attribution,
        routeUtm,
        sourceUrl,
      },
      utm: routeUtm,
      sourceUrl,
      categorySlug: mergedContext.categorySlug ?? null,
      productSlug: mergedContext.productSlug ?? null,
      formType: mergedContext.formName ?? null,
    })

    return {
      context: mergedContext,
      attribution: normalized.attribution,
      routeUtm: normalized.routeUtm,
      sourceUrl,
      normalized: {
        trackingSource: normalized.trackingSource,
        trackingMedium: normalized.trackingMedium,
        trackingCampaign: normalized.trackingCampaign,
        trackingCampaignId: normalized.trackingCampaignId,
        sourceUrl: normalized.sourceUrl,
        categorySlug: mergedContext.categorySlug ?? null,
        productSlug: mergedContext.productSlug ?? null,
      },
      TrackingSource: normalized.trackingSource,
      TrackingMedium: normalized.trackingMedium,
      TrackingCampaign: normalized.trackingCampaign,
      TrackingCampaignId: normalized.trackingCampaignId,
      SourceUrl: normalized.sourceUrl,
      UtmJson: normalized.utmJson,
    }
  }

  function pushPrivacySafeEvent(
    event: "form_start" | "form_validation_error" | "generate_lead",
    payload: TrackingPayload = {},
    context?: TrackingContextInput,
  ) {
    if (!import.meta.client) return

    window.dataLayer = window.dataLayer || []
    const mergedContext = { ...defaultContext, ...context }

    // Estos eventos usan una lista cerrada de metadatos técnicos. No se añaden
    // URLs, referrers, IDs de solicitud ni valores introducidos por el usuario.
    window.dataLayer.push({
      event,
      ...toDataLayerContext(mergedContext),
      ...toPrivacySafeLeadPayload(event, payload),
    })
  }

  function pushEvent(
    event: TrackingEventName,
    payload: TrackingPayload = {},
    context?: TrackingContextInput,
  ) {
    if (!import.meta.client) return

    window.dataLayer = window.dataLayer || []

    const attribution = getAttribution()

    const mergedContext = {
      ...defaultContext,
      ...context,
    }

    window.dataLayer.push({
      event,

      ...toDataLayerContext(mergedContext),

      attribution_source_first: attribution.first?.source ?? null,
      attribution_medium_first: attribution.first?.medium ?? null,
      attribution_campaign_first: attribution.first?.campaign ?? null,
      attribution_campaign_id_first: attribution.first?.campaignId ?? null,

      attribution_source_last: attribution.last?.source ?? null,
      attribution_medium_last: attribution.last?.medium ?? null,
      attribution_campaign_last: attribution.last?.campaign ?? null,
      attribution_campaign_id_last: attribution.last?.campaignId ?? null,

      landing_path_first: attribution.first?.landingPath ?? null,
      landing_url_first: attribution.first?.landingUrl ?? null,
      landing_path_last: attribution.last?.landingPath ?? null,
      landing_url_last: attribution.last?.landingUrl ?? null,
      referrer_last: attribution.last?.referrer ?? null,

      product_slug: mergedContext.productSlug ?? null,
      category_slug: mergedContext.categorySlug ?? null,
      form_name: mergedContext.formName ?? null,

      ...payload,
    })
  }

  function getTrackingPayloadForLead(context?: TrackingContextInput) {
    return getLeadTrackingSnapshot(context)
  }

  function getSharePointTrackingFields(context?: TrackingContextInput) {
    const snapshot = getLeadTrackingSnapshot(context)
    return {
      TrackingSource: snapshot.TrackingSource,
      TrackingMedium: snapshot.TrackingMedium,
      TrackingCampaign: snapshot.TrackingCampaign,
      TrackingCampaignId: snapshot.TrackingCampaignId,
      SourceUrl: snapshot.SourceUrl,
      UtmJson: snapshot.UtmJson,
    }
  }

  return {
    pushEvent,
    pushPrivacySafeEvent,
    getTrackingPayloadForLead,
    getSharePointTrackingFields,
  }
}
