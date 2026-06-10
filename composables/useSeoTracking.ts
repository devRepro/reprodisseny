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
    page_type: context.pageType,
    page_language: context.pageLanguage,
    content_group: context.contentGroup,
    service_name: context.serviceName,
    campaign_name: context.campaignName,
    campaign_id: context.campaignId,
    product_slug: context.productSlug,
    category_slug: context.categorySlug,
    form_id: context.formId,
    form_name: context.formName,
  }
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

      attribution_source_first: attribution.first?.source,
      attribution_medium_first: attribution.first?.medium,
      attribution_campaign_first: attribution.first?.campaign,
      attribution_campaign_id_first: attribution.first?.campaignId,

      attribution_source_last: attribution.last?.source,
      attribution_medium_last: attribution.last?.medium,
      attribution_campaign_last: attribution.last?.campaign,
      attribution_campaign_id_last: attribution.last?.campaignId,

      gclid: attribution.last?.gclid,
      gbraid: attribution.last?.gbraid,
      wbraid: attribution.last?.wbraid,

      landing_path_first: attribution.first?.landingPath,
      landing_url_first: attribution.first?.landingUrl,
      landing_path_last: attribution.last?.landingPath,
      referrer_last: attribution.last?.referrer,

      ...payload,
    })
  }

  function getTrackingPayloadForLead(context?: TrackingContext) {
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

  return {
    pushEvent,
    getTrackingPayloadForLead,
  }
}