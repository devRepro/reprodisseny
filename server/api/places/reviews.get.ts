import { defineEventHandler, getQuery, setHeader, createError } from "h3";
import { useRuntimeConfig, useStorage } from "#imports";
import { fetchWithBackoff } from "~/server/utils/googleFetch.server";

interface PlaceReview {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  publishTime?: string;
  relativePublishTimeDescription?: string;
}

interface PlaceDetailsResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlaceReview[];
}

type ReviewDTO = {
  rating: number;
  text: string;
  author: string;
  authorUri: string | null;
  profilePhotoUri: string | null;
  publishTime?: string;
  relativeTime?: string;
};

type ReviewsResponseDTO = {
  rating?: number;
  userRatingCount?: number;
  mapsUrl?: string;
  reviews: ReadonlyArray<ReviewDTO>;
};

const SUCCESS_TTL_MS = 6 * 60 * 60 * 1000;
const EMPTY_TTL_MS = 10 * 60 * 1000;

const FIELD_MASK = [
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "reviews",
].join(",");

function clampInt(v: unknown, fallback: number, min: number, max: number) {
  const n = Number.parseInt(String(v ?? ""), 10);

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, n));
}

function normalizePlaceId(raw: string) {
  return String(raw || "")
    .trim()
    .replace(/^places\//, "");
}

function normalizeLang(raw: unknown) {
  const lang = String(raw || "es").trim().toLowerCase();

  if (!/^[a-z]{2}(-[a-z]{2})?$/.test(lang)) {
    return "es";
  }

  return lang;
}

function toHttpStatus(value: unknown) {
  const status = Number(value);

  if (!Number.isInteger(status) || status < 400 || status > 599) {
    return 502;
  }

  return status;
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as {
    placeId?: string;
    lang?: string;
    limit?: string;
    force?: string;
  };

  const placeId = normalizePlaceId(q.placeId || "");
  const lang = normalizeLang(q.lang);
  const limit = clampInt(q.limit, 5, 1, 5);
  const force = q.force === "1";

  if (!placeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing placeId",
    });
  }

  const { googleMaps } = useRuntimeConfig();
  const apiKey = googleMaps?.apiKey as string | undefined;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing GOOGLE_MAPS_API_KEY",
    });
  }

  setHeader(
    event,
    "Cache-Control",
    "public, s-maxage=21600, stale-while-revalidate=86400",
  );

  const storage = useStorage("cache");
  const cacheKey = `places:reviews:${placeId}:${lang}:limit=${limit}`;
  const now = Date.now();

  if (!force) {
    const cached = await storage.getItem<{
      ts: number;
      ttl: number;
      data: ReviewsResponseDTO;
    }>(cacheKey);

    if (cached && now - cached.ts < cached.ttl) {
      return cached.data;
    }
  }

  const params = new URLSearchParams({
    languageCode: lang,
    regionCode: "ES",
  });

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    placeId,
  )}?${params.toString()}`;

  try {
    const resp = await fetchWithBackoff<PlaceDetailsResponse>(
      url,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        timeout: 8000,
      },
      {
        retries: 3,
        baseDelay: 400,
        maxDelay: 6000,
      },
    );

    const payload: ReviewsResponseDTO = {
      rating: resp.rating,
      userRatingCount: resp.userRatingCount,
      mapsUrl: resp.googleMapsUri,
      reviews: (resp.reviews ?? [])
        .slice(0, limit)
        .map((r) => ({
          rating: r.rating ?? 0,
          text: r.text?.text || r.originalText?.text || "",
          author: r.authorAttribution?.displayName || "Usuario de Google",
          authorUri: r.authorAttribution?.uri || null,
          profilePhotoUri: r.authorAttribution?.photoUri || null,
          publishTime: r.publishTime,
          relativeTime: r.relativePublishTimeDescription,
        }))
        .filter((r) => r.rating > 0 || r.text.length > 0),
    };

    const ttl = payload.reviews.length > 0 ? SUCCESS_TTL_MS : EMPTY_TTL_MS;

    await storage.setItem(cacheKey, {
      ts: now,
      ttl,
      data: payload,
    });

    return payload;
  } catch (e: any) {
    const status = toHttpStatus(
      e?.response?.status || e?.status || e?.statusCode,
    );

    const body = e?.data || e?.response?._data;

    console.error("Places error", {
      status,
      placeId,
      lang,
      body,
    });

    const stale = await storage.getItem<{
      ts: number;
      ttl: number;
      data: ReviewsResponseDTO;
    }>(cacheKey);

    if (stale?.data) {
      return stale.data;
    }

    const statusMessage =
      status === 401 || status === 403
        ? "Google Places auth error (API key / billing / restrictions)"
        : status === 404
          ? "Google Places NOT_FOUND (placeId incorrecto/obsoleto)"
          : status === 400
            ? "Google Places bad request (placeId / FieldMask / params)"
            : "Places upstream error";

    throw createError({
      statusCode: status,
      statusMessage,
    });
  }
});