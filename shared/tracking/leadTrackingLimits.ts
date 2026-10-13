export const LEAD_TRACKING_PARAM_KEYS = [
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
] as const;

export type LeadTrackingParamKey = (typeof LEAD_TRACKING_PARAM_KEYS)[number];

export const LEAD_TRACKING_LIMITS = {
  technicalValueMax: 255,
  contextValueMax: 120,
  clickIdMax: 1_000,
  attributionUrlMax: 2_000,
  sourceUrlMax: 255,
  sharePointJsonMax: 12_000,
} as const;

const CLICK_ID_KEYS = new Set<LeadTrackingParamKey>([
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
]);

export function getLeadTrackingParamMax(key: LeadTrackingParamKey) {
  return CLICK_ID_KEYS.has(key)
    ? LEAD_TRACKING_LIMITS.clickIdMax
    : LEAD_TRACKING_LIMITS.technicalValueMax;
}
