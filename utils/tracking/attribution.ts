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

type AttributionStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>

const emptyAttribution = (): LeadAttribution => ({ first: null, last: null })

let attributionStorageAllowed = false
let volatileAttribution = emptyAttribution()

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function readStoredAttribution(storage: AttributionStorage): LeadAttribution {
  return normalizeLeadAttribution({
    first: safeJsonParse<AttributionData>(
      storage.getItem(FIRST_ATTRIBUTION_KEY),
    ),
    last: safeJsonParse<AttributionData>(
      storage.getItem(LAST_ATTRIBUTION_KEY),
    ),
  })
}

function mergeAttribution(
  stored: LeadAttribution,
  current: LeadAttribution,
): LeadAttribution {
  return normalizeLeadAttribution({
    first: stored.first || current.first,
    last: current.last || stored.last,
  })
}

export function syncAttributionStorage(
  storage: AttributionStorage,
  attribution: LeadAttribution,
  allowed: boolean,
) {
  if (!allowed) {
    storage.removeItem(FIRST_ATTRIBUTION_KEY)
    storage.removeItem(LAST_ATTRIBUTION_KEY)
    return
  }

  if (attribution.first) {
    storage.setItem(FIRST_ATTRIBUTION_KEY, JSON.stringify(attribution.first))
  } else {
    storage.removeItem(FIRST_ATTRIBUTION_KEY)
  }

  if (attribution.last) {
    storage.setItem(LAST_ATTRIBUTION_KEY, JSON.stringify(attribution.last))
  } else {
    storage.removeItem(LAST_ATTRIBUTION_KEY)
  }
}

export function setAttributionStorageAllowed(allowed: boolean) {
  if (!import.meta.client) return

  attributionStorageAllowed = allowed

  if (!allowed) {
    volatileAttribution = emptyAttribution()
    syncAttributionStorage(window.localStorage, volatileAttribution, false)
    return
  }

  volatileAttribution = mergeAttribution(
    readStoredAttribution(window.localStorage),
    volatileAttribution,
  )
  syncAttributionStorage(window.localStorage, volatileAttribution, true)
}

export function captureAttribution() {
  if (!import.meta.client) return

  const stored = attributionStorageAllowed
    ? readStoredAttribution(window.localStorage)
    : emptyAttribution()
  const current = mergeAttribution(stored, volatileAttribution)
  const incoming = createAttributionTouchFromUrl({
    url: window.location.href,
    referrer: document.referrer || null,
  })
  const next = updateLeadAttribution(current, incoming)

  volatileAttribution = next
  syncAttributionStorage(
    window.localStorage,
    volatileAttribution,
    attributionStorageAllowed,
  )
}

export function getAttribution() {
  if (!import.meta.client) {
    return {
      first: null,
      last: null,
    }
  }

  const stored = attributionStorageAllowed
    ? readStoredAttribution(window.localStorage)
    : emptyAttribution()

  return mergeAttribution(stored, volatileAttribution)
}
