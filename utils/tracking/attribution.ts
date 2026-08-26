// ~/utils/tracking/attribution.ts

import type { AttributionData } from "~/types/tracking"
import {
  createAttributionTouchFromUrl,
  normalizeLeadAttribution,
  updateLeadAttribution,
  type LeadAttribution,
} from "./leadAttribution"

const FIRST_ATTRIBUTION_KEY = "rd_first_attribution"
const LAST_ATTRIBUTION_KEY = "rd_last_attribution"

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function readStoredAttribution(): LeadAttribution {
  return normalizeLeadAttribution({
    first: safeJsonParse<AttributionData>(
      window.localStorage.getItem(FIRST_ATTRIBUTION_KEY),
    ),
    last: safeJsonParse<AttributionData>(
      window.localStorage.getItem(LAST_ATTRIBUTION_KEY),
    ),
  })
}

export function captureAttribution() {
  if (!import.meta.client) return

  const current = readStoredAttribution()
  const incoming = createAttributionTouchFromUrl({
    url: window.location.href,
    referrer: document.referrer || null,
  })
  const next = updateLeadAttribution(current, incoming)

  if (next.first) {
    window.localStorage.setItem(FIRST_ATTRIBUTION_KEY, JSON.stringify(next.first))
  }

  if (next.last) {
    window.localStorage.setItem(LAST_ATTRIBUTION_KEY, JSON.stringify(next.last))
  } else {
    window.localStorage.removeItem(LAST_ATTRIBUTION_KEY)
  }
}

export function getAttribution() {
  if (!import.meta.client) {
    return {
      first: null,
      last: null,
    }
  }

  return readStoredAttribution()
}
