import assert from "node:assert/strict"
import test from "node:test"

import { normalizeServerLeadTracking } from "../server/services/priceRequests/leadTrackingNormalization"

const sourceUrl = "https://reprodisseny.com/productos/hojas-pegatinas-personalizadas"

test("price_request server normaliza con autoridad final frente a campos legacy incoherentes", () => {
  const result = normalizeServerLeadTracking({
    sourceUrl,
    categorySlug: "adhesius",
    productSlug: "hojas-pegatinas-personalizadas",
    formType: "price_request",
    tracking: {
      TrackingSource: "www.google.com",
      TrackingMedium: "referral",
      TrackingCampaign: null,
      normalized: {
        trackingSource: "www.google.com",
        trackingMedium: "referral",
        trackingCampaign: null,
      },
      attribution: {
        first: {
          source: "google",
          medium: "cpc",
          campaign: "22573931882",
          term: "stickers personalizadas",
          content: "182804005827|753099936187|b|c",
          gclid: "TEST_GCLID",
          gbraid: "TEST_GBRAID",
          landingPath: "/",
          referrer: "https://www.google.com/",
        },
        last: {
          source: "www.google.com",
          medium: "referral",
          campaign: null,
          landingPath: "/productos/hojas-pegatinas-personalizadas",
          referrer: "https://www.google.com/",
        },
      },
    },
  })

  assert.equal(result.selectedTouch?.source, "google")
  assert.equal(result.selectedTouch?.medium, "cpc")
  assert.equal(result.selectedTouch?.campaign, "22573931882")
  assert.equal(result.selectedTouch?.term, "stickers personalizadas")
  assert.equal(result.selectedTouch?.content, "182804005827|753099936187|b|c")
  assert.equal(result.selectedTouch?.gclid, "TEST_GCLID")
  assert.equal(result.selectedTouch?.gbraid, "TEST_GBRAID")
  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
  assert.equal(result.trackingCampaign, "22573931882")
})

test("contact y price_request comparten el mismo normalizador server", () => {
  const result = normalizeServerLeadTracking({
    sourceUrl: "https://reprodisseny.com/contacto",
    categorySlug: "contacte",
    productSlug: null,
    formType: "contact",
    tracking: {
      context: {
        formName: "contact_form",
      },
      attribution: {
        first: {
          source: "google",
          medium: "cpc",
          campaign: "22573931882",
          gclid: "TEST_GCLID",
        },
        last: {
          source: "direct",
          medium: "none",
        },
      },
    },
  })

  assert.equal(result.formType, "contact_form")
  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
  assert.equal(result.trackingCampaign, "22573931882")
})
