import assert from "node:assert/strict"
import test from "node:test"

import { getAttribution } from "../utils/tracking/attribution"
import {
  createAttributionTouchFromUrl,
  normalizeLeadTracking,
  updateLeadAttribution,
} from "../utils/tracking/leadAttribution"

const productUrl = "https://reprodisseny.com/productos/panel-dibond-personalizado"

function normalize(input: Parameters<typeof normalizeLeadTracking>[0]) {
  return normalizeLeadTracking({
    categorySlug: "material-rigido",
    productSlug: "panel-dibond-personalizado",
    formType: "price_request",
    ...input,
  })
}

test("Google Ads con gclid directo a formulario normaliza google/cpc", () => {
  const result = normalize({
    sourceUrl: `${productUrl}?gclid=ABC123`,
  })

  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
  assert.notEqual(result.trackingSource, "direct")
})

for (const clickId of ["gbraid", "wbraid"] as const) {
  test(`Google Ads con ${clickId} normaliza google/cpc`, () => {
    const result = normalize({
      sourceUrl: `${productUrl}?${clickId}=ABC123`,
    })

    assert.equal(result.trackingSource, "google")
    assert.equal(result.trackingMedium, "cpc")
  })
}

test("Google Ads conserva atribucion despues de navegacion interna", () => {
  const first = createAttributionTouchFromUrl({
    url: `${productUrl}?gclid=ABC123`,
    now: "2026-08-26T10:00:00.000Z",
  })
  const internal = createAttributionTouchFromUrl({
    url: "https://reprodisseny.com/categorias/material-rigido",
    referrer: productUrl,
    now: "2026-08-26T10:05:00.000Z",
  })

  const attribution = updateLeadAttribution(
    updateLeadAttribution({ first: null, last: null }, first),
    internal,
  )
  const result = normalize({
    tracking: { attribution },
    sourceUrl: productUrl,
  })

  assert.equal(result.attribution.first?.source, "google")
  assert.equal(result.attribution.last?.source, "google")
  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
})

test("URL de conversion distinta conserva landing original de campana", () => {
  const landingA = "https://reprodisseny.com/productos/a?gclid=ABC123"
  const submitB = "https://reprodisseny.com/productos/b"
  const first = createAttributionTouchFromUrl({
    url: landingA,
    now: "2026-08-26T10:00:00.000Z",
  })
  const attribution = updateLeadAttribution({ first: null, last: null }, first)
  const result = normalize({
    tracking: { attribution },
    sourceUrl: submitB,
  })

  assert.equal(result.attribution.first?.landingUrl, landingA)
  assert.equal(result.sourceUrl, submitB)
  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
})

test("UTM conserva exactamente source, medium, campaign y campaignId", () => {
  const result = normalize({
    sourceUrl:
      `${productUrl}?utm_source=google&utm_medium=cpc` +
      "&utm_campaign=gran_formato&utm_id=CAMPAIGN_ID&utm_term=x%20banner&utm_content=ad1",
  })

  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
  assert.equal(result.trackingCampaign, "gran_formato")
  assert.equal(result.trackingCampaignId, "CAMPAIGN_ID")
  assert.equal(result.selectedTouch?.term, "x banner")
  assert.equal(result.selectedTouch?.content, "ad1")
})

test("UTM conserva campana despues de navegacion interna", () => {
  const first = createAttributionTouchFromUrl({
    url: `${productUrl}?utm_source=google&utm_medium=cpc&utm_campaign=gran_formato`,
  })
  const internal = createAttributionTouchFromUrl({
    url: "https://reprodisseny.com/categorias/material-rigido",
    referrer: productUrl,
  })
  const attribution = updateLeadAttribution(
    updateLeadAttribution({ first: null, last: null }, first),
    internal,
  )

  const result = normalize({
    tracking: { attribution },
    sourceUrl: productUrl,
  })

  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
  assert.equal(result.trackingCampaign, "gran_formato")
})

test("UTM explicita gana frente a referrer propio", () => {
  const touch = createAttributionTouchFromUrl({
    url: `${productUrl}?utm_source=google&utm_medium=cpc`,
    referrer: "https://reprodisseny.com/algo",
  })
  const attribution = updateLeadAttribution({ first: null, last: null }, touch)
  const result = normalize({
    tracking: { attribution },
    sourceUrl: `${productUrl}?utm_source=google&utm_medium=cpc`,
  })

  assert.equal(result.attribution.last?.source, "google")
  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
})

test("gclid gana frente a referrer propio", () => {
  const touch = createAttributionTouchFromUrl({
    url: `${productUrl}?gclid=ABC123`,
    referrer: "https://reprodisseny.com/algo",
  })
  const attribution = updateLeadAttribution({ first: null, last: null }, touch)
  const result = normalize({
    tracking: { attribution },
    sourceUrl: `${productUrl}?gclid=ABC123`,
  })

  assert.equal(result.attribution.last?.source, "google")
  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
})

test("trafico realmente directo produce direct/none", () => {
  const result = normalize({
    sourceUrl: "https://reprodisseny.com/pedir-presupuesto",
  })

  assert.equal(result.trackingSource, "direct")
  assert.equal(result.trackingMedium, "none")
  assert.equal(result.trackingCampaign, null)
})

test("direct despues de campana no degrada first ni normalizado", () => {
  const first = createAttributionTouchFromUrl({
    url: `${productUrl}?utm_source=google&utm_medium=cpc&utm_campaign=gran_formato`,
  })
  const direct = createAttributionTouchFromUrl({
    url: "https://reprodisseny.com/pedir-presupuesto",
  })
  const attribution = updateLeadAttribution(
    updateLeadAttribution({ first: null, last: null }, first),
    direct,
  )
  const result = normalize({
    tracking: { attribution },
    sourceUrl: "https://reprodisseny.com/pedir-presupuesto",
  })

  assert.equal(result.attribution.first?.source, "google")
  assert.equal(result.attribution.last?.source, "google")
  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
})

test("navegacion interna sin UTM no actualiza last", () => {
  const first = createAttributionTouchFromUrl({
    url: `${productUrl}?utm_source=google&utm_medium=cpc`,
  })
  const internal = createAttributionTouchFromUrl({
    url: "https://reprodisseny.com/productos/b",
    referrer: productUrl,
  })
  const attribution = updateLeadAttribution(
    updateLeadAttribution({ first: null, last: null }, first),
    internal,
  )

  assert.equal(attribution.last?.landingUrl, first.landingUrl)
  assert.notEqual(attribution.last?.landingUrl, internal.landingUrl)
  assert.equal(attribution.last?.source, "google")
})

test("nueva campana externa posterior actualiza last sin cambiar first", () => {
  const first = createAttributionTouchFromUrl({
    url: `${productUrl}?utm_source=google&utm_medium=cpc&utm_campaign=gran_formato`,
  })
  const linkedin = createAttributionTouchFromUrl({
    url: `${productUrl}?utm_source=linkedin&utm_medium=paid_social&utm_campaign=brand`,
  })
  const attribution = updateLeadAttribution(
    updateLeadAttribution({ first: null, last: null }, first),
    linkedin,
  )
  const result = normalize({
    tracking: { attribution },
    sourceUrl: productUrl,
  })

  assert.equal(result.attribution.first?.source, "google")
  assert.equal(result.attribution.last?.source, "linkedin")
  assert.equal(result.trackingSource, "linkedin")
  assert.equal(result.trackingMedium, "paid_social")
  assert.equal(result.trackingCampaign, "brand")
})

test("referrer externo valido se clasifica como referral", () => {
  const first = createAttributionTouchFromUrl({
    url: productUrl,
    referrer: "https://example.com/articulo",
  })
  const result = normalize({
    tracking: { attribution: { first, last: first } },
    sourceUrl: productUrl,
  })

  assert.equal(result.trackingSource, "example.com")
  assert.equal(result.trackingMedium, "referral")
})

test("referrer externo sin UTM produce hostname/referral", () => {
  const touch = createAttributionTouchFromUrl({
    url: productUrl,
    referrer: "https://partner.example/caso",
  })
  const attribution = updateLeadAttribution({ first: null, last: null }, touch)
  const result = normalize({
    tracking: { attribution },
    sourceUrl: productUrl,
  })

  assert.equal(result.trackingSource, "partner.example")
  assert.equal(result.trackingMedium, "referral")
})

test("referrer propio no crea nueva atribucion ni degrada una campana previa", () => {
  const first = createAttributionTouchFromUrl({
    url: `${productUrl}?gclid=ABC123`,
  })
  const ownReferrer = createAttributionTouchFromUrl({
    url: "https://reprodisseny.com/productos/otro-producto",
    referrer: productUrl,
  })
  const attribution = updateLeadAttribution(
    updateLeadAttribution({ first: null, last: null }, first),
    ownReferrer,
  )
  const result = normalize({
    tracking: { attribution },
    sourceUrl: "https://reprodisseny.com/productos/otro-producto",
  })

  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
})

test("regresion: payload incoherente direct/none con first google/cpc se corrige", () => {
  const result = normalize({
    sourceUrl: productUrl,
    tracking: {
      normalized: {
        trackingSource: "direct",
        trackingMedium: "none",
        trackingCampaign: "22573931882",
      },
      attribution: {
        first: {
          source: "google",
          medium: "cpc",
          campaign: "22573931882",
          gclid: "TEST_GCLID",
        },
      },
    },
  })

  assert.equal(result.trackingSource, "google")
  assert.equal(result.trackingMedium, "cpc")
  assert.equal(result.trackingCampaign, "22573931882")
  assert.equal(result.trackingCampaignId, null)
})

test("invariante: campana sin source real no se clasifica como direct/none", () => {
  const result = normalize({
    sourceUrl: productUrl,
    tracking: {
      TrackingSource: "direct",
      TrackingMedium: "none",
      TrackingCampaign: "22573931882",
    },
  })

  assert.equal(result.trackingSource, "unknown")
  assert.equal(result.trackingMedium, "unknown")
  assert.equal(result.trackingCampaign, "22573931882")
})

test("sin tracking el lead sigue normalizando con fallback directo", () => {
  const result = normalize({
    tracking: null,
    utm: null,
    sourceUrl: productUrl,
  })

  assert.equal(result.trackingSource, "direct")
  assert.equal(result.trackingMedium, "none")
})

test("SSR: leer atribucion no accede a window/document/localStorage", () => {
  assert.doesNotThrow(() => {
    const attribution = getAttribution()
    assert.deepEqual(attribution, { first: null, last: null })
  })
})
