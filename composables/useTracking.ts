// ~/composables/useTracking.ts

import type {
  TrackingContext,
  TrackingEventName,
  TrackingPayload,
} from "~/types/tracking"
import { getAttribution } from "~/utils/tracking/attribution"

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

function toDataLayerContext(context?: TrackingContext) {
  if (!context) return {}

  return {
    page_type: context.pageType ?? null,
    page_language: context.pageLanguage ?? null,
    content_group: context.contentGroup ?? null,
    service_name: context.serviceName ?? null,
    campaign_name: context.campaignName ?? null,
    campaign_id: context.campaignId ?? null,
    product_slug: context.productSlug ?? null,
    category_slug: context.categorySlug ?? null,
    form_id: context.formId ?? null,
    form_name: context.formName ?? null,
  }
}

function resolveAttributionForLead(attribution: ReturnType<typeof getAttribution>) {
  const last = attribution.last
  const first = attribution.first

  return last || first || null
}

export function useTracking(defaultContext?: TrackingContext) {
  function pushEvent(
    event: TrackingEventName,
    payload: TrackingPayload = {},
    context?: TrackingContext,
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

  function getTrackingPayloadForLead(context?: TrackingContext) {
    if (!import.meta.client) {
      return {
        context: {
          ...defaultContext,
          ...context,
        },
        attribution: {
          first: null,
          last: null,
        },
      }
    }

    const attribution = getAttribution()

    const mergedContext = {
      ...defaultContext,
      ...context,
    }

    return {
      context: mergedContext,
      attribution,
    }
  }

  function getSharePointTrackingFields(context?: TrackingContext) {
    if (!import.meta.client) {
      return {
        TrackingSource: "unknown",
        TrackingMedium: "unknown",
        TrackingCampaign: null,
        TrackingCampaignId: null,
        SourceUrl: null,
        UtmJson: "{}",
      }
    }

    const attribution = getAttribution()

    const mergedContext = {
      ...defaultContext,
      ...context,
    }

    const selected = resolveAttributionForLead(attribution)

    const sourceUrl =
      selected?.landingUrl ||
      window.location.href

    const trackingSource =
      selected?.source ||
      "direct"

    const trackingMedium =
      selected?.medium ||
      "direct"

    const trackingCampaign =
      selected?.campaign ||
      mergedContext.campaignName ||
      null

    const trackingCampaignId =
      selected?.campaignId ||
      mergedContext.campaignId ||
      null

    return {
      TrackingSource: trackingSource,
      TrackingMedium: trackingMedium,
      TrackingCampaign: trackingCampaign,
      TrackingCampaignId: trackingCampaignId,
      SourceUrl: sourceUrl,

      UtmJson: JSON.stringify({
        context: mergedContext,
        attribution,
        selectedTouch: selected,
        currentUrl: window.location.href,
        currentPath: window.location.pathname,
        capturedFor: "price_request",
      }),
    }
  }

  function pushGenerateLeadEvent(params: {
    requestKey: string
    context?: TrackingContext
    value?: number | null
    currency?: string | null
  }) {
    pushEvent(
      "generate_lead",
      {
        request_key: params.requestKey,
        lead_id: params.requestKey,
        value: params.value ?? null,
        currency: params.currency ?? null,
      },
      params.context,
    )
  }

  return {
    pushEvent,
    pushGenerateLeadEvent,
    getTrackingPayloadForLead,
    getSharePointTrackingFields,
  }
}