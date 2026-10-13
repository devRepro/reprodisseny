import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createError,
  readMultipartFormData,
  setResponseHeader,
  setResponseStatus,
  type H3Event,
} from "h3";

import { priceRequestPayloadSchema } from "../../../shared/schemas/priceRequest";

const MAX_PAYLOAD_BYTES = 256 * 1024;

const FileKindSchema = z
  .enum(["design", "brief", "proof", "final", "other"])
  .optional()
  .default("design");

type RateLimitResult = {
  ok: boolean;
  retryAfterSec?: number;
};

type PriceRequestApiDependencies = {
  createPriceRequest: (event: H3Event, input: any) => Promise<any>;
  getClientIp: (event: H3Event) => string;
  ipHash: (ip: string) => string;
  normalizeTracking: (input: any) => any;
  rateLimit: (
    key: string,
    limit: number,
    windowSeconds: number,
  ) => Promise<RateLimitResult>;
  createRequestId?: () => string;
  logError?: (message: string, metadata: Record<string, unknown>) => void;
};

type SafePriceRequestError = {
  statusCode: number;
  errorCode: string;
  userMessage: string;
  upstreamStatus: number | null;
  upstreamCode: string | null;
  upstreamRequestId: string | null;
};

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function finiteStatus(value: unknown) {
  const status = Number(value);
  return Number.isInteger(status) && status >= 400 && status <= 599
    ? status
    : null;
}

function readResponseHeader(error: unknown, name: string) {
  if (!isRecord(error) || !isRecord(error.response)) return null;
  const headers = error.response.headers;
  if (!headers || typeof headers.get !== "function") return null;
  const value = headers.get(name);
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null;
}

function classifyPriceRequestError(error: unknown): SafePriceRequestError {
  const value = isRecord(error) ? error : {};
  const response = isRecord(value.response) ? value.response : {};
  const responseData = isRecord(response._data) ? response._data : {};
  const responseError = isRecord(responseData.error) ? responseData.error : {};
  const upstreamStatus = finiteStatus(response.status);
  const ownStatus = finiteStatus(value.statusCode ?? value.status);
  const upstreamCode =
    typeof responseError.code === "string"
      ? responseError.code.slice(0, 120)
      : null;
  const upstreamRequestId =
    readResponseHeader(error, "request-id") ||
    readResponseHeader(error, "client-request-id");

  if (upstreamStatus) {
    return {
      statusCode: upstreamStatus === 401 || upstreamStatus === 403 || upstreamStatus === 429
        ? 503
        : 502,
      errorCode:
        upstreamStatus === 401 || upstreamStatus === 403
          ? "PRICE_REQUEST_UPSTREAM_AUTH"
          : upstreamStatus === 429
            ? "PRICE_REQUEST_UPSTREAM_RATE_LIMITED"
            : "PRICE_REQUEST_UPSTREAM_REJECTED",
      userMessage:
        "No hemos podido registrar la solicitud. Inténtalo de nuevo en unos minutos.",
      upstreamStatus,
      upstreamCode,
      upstreamRequestId,
    };
  }

  if (ownStatus === 400 || ownStatus === 413 || ownStatus === 422) {
    return {
      statusCode: ownStatus,
      errorCode:
        ownStatus === 413
          ? "PRICE_REQUEST_PAYLOAD_TOO_LARGE"
          : "PRICE_REQUEST_INVALID",
      userMessage:
        ownStatus === 413
          ? "La solicitud es demasiado grande. Revisa los datos adjuntos."
          : "Revisa los campos de la solicitud antes de enviarla.",
      upstreamStatus,
      upstreamCode,
      upstreamRequestId,
    };
  }

  if (ownStatus === 429 && !upstreamStatus) {
    return {
      statusCode: 429,
      errorCode: "PRICE_REQUEST_RATE_LIMITED",
      userMessage:
        "Has realizado demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
      upstreamStatus,
      upstreamCode,
      upstreamRequestId,
    };
  }

  return {
    statusCode: 500,
    errorCode: "PRICE_REQUEST_INTERNAL",
    userMessage:
      "No hemos podido registrar la solicitud. Inténtalo de nuevo en unos minutos.",
    upstreamStatus,
    upstreamCode,
    upstreamRequestId,
  };
}

function throwSafePriceRequestError(
  error: unknown,
  requestId: string,
  logError: NonNullable<PriceRequestApiDependencies["logError"]>,
): never {
  const safe = classifyPriceRequestError(error);

  logError("[PRICE REQUEST][API ERROR]", {
    requestId,
    errorCode: safe.errorCode,
    statusCode: safe.statusCode,
    upstreamStatus: safe.upstreamStatus,
    upstreamCode: safe.upstreamCode,
    upstreamRequestId: safe.upstreamRequestId,
  });

  throw createError({
    statusCode: safe.statusCode,
    message: safe.userMessage,
    data: {
      errorCode: safe.errorCode,
      requestId,
    },
  });
}

export function createPriceRequestApiHandler(
  dependencies: PriceRequestApiDependencies,
) {
  const createRequestId = dependencies.createRequestId || randomUUID;
  const logError = dependencies.logError || console.error;

  return async (event: H3Event) => {
    const requestId = createRequestId();
    event.context.priceRequestRequestId = requestId;
    setResponseHeader(event, "x-request-id", requestId);

    try {
      const parts = await readMultipartFormData(event);
      if (!parts?.length) {
        throw createError({ statusCode: 400, message: "Empty form" });
      }

      const payloadPart = parts.find((part) => part.name === "payload");
      const filePart = parts.find((part) => part.name === "file");
      const fileKindPart = parts.find((part) => part.name === "fileKind");

      if (!payloadPart?.data) {
        throw createError({ statusCode: 400, message: "Missing payload" });
      }
      if (payloadPart.data.length > MAX_PAYLOAD_BYTES) {
        throw createError({ statusCode: 413, message: "Payload too large" });
      }

      let rawPayload: unknown;
      try {
        rawPayload = JSON.parse(Buffer.from(payloadPart.data).toString("utf8"));
      } catch {
        throw createError({ statusCode: 400, message: "Invalid JSON payload" });
      }

      if ((rawPayload as any)?.website) {
        setResponseStatus(event, 200);
        return { ok: true };
      }

      const ip = dependencies.getClientIp(event) || "unknown";
      const rateLimitResult = await dependencies.rateLimit(
        `price-req:${dependencies.ipHash(ip)}`,
        10,
        600,
      );
      if (!rateLimitResult.ok) {
        if (rateLimitResult.retryAfterSec) {
          setResponseHeader(event, "retry-after", rateLimitResult.retryAfterSec);
        }
        throw createError({ statusCode: 429, message: "Rate limited" });
      }

      const parsed = priceRequestPayloadSchema.safeParse(rawPayload);
      if (!parsed.success) {
        throw createError({ statusCode: 400, message: "Invalid form data" });
      }

      const fileKindRaw = fileKindPart?.data
        ? Buffer.from(fileKindPart.data).toString("utf8")
        : undefined;
      const parsedFileKind = FileKindSchema.safeParse(fileKindRaw);
      if (!parsedFileKind.success) {
        throw createError({ statusCode: 400, message: "Invalid file kind" });
      }

      const p = parsed.data;
      const attachment = filePart?.data?.length
        ? {
            filename: filePart.filename || "upload.bin",
            mimeType: filePart.type || "application/octet-stream",
            buffer: Buffer.from(filePart.data),
            size: filePart.data.length,
          }
        : null;
      const normalizedTracking = dependencies.normalizeTracking({
        tracking: p.tracking ?? null,
        utm: p.utm ?? null,
        sourceUrl: p.sourceUrl,
        categorySlug: p.categorySlug,
        productSlug: p.product.slug ?? null,
        formType: "price_request",
      });

      const created = await dependencies.createPriceRequest(event, {
        name: p.name,
        email: p.email,
        phone: p.phone,
        postalCode: p.postalCode ?? null,
        company: p.company ?? undefined,
        message: p.message ?? "",
        categorySlug: p.categorySlug,
        product: p.product,
        extras: p.extras,
        consent: p.consent,
        sourceUrl: normalizedTracking.sourceUrl,
        utm: p.utm ?? null,
        tracking: normalizedTracking,
        initialStatus: p.initialStatus || "Nova",
        attachment,
        fileKind: parsedFileKind.data,
      });

      if (
        created?.ok !== true ||
        typeof created?.duplicated !== "boolean" ||
        !String(created?.itemId ?? "").trim() ||
        !String(created?.requestKey ?? "").trim()
      ) {
        throw new Error("Incomplete price request response");
      }

      return {
        ok: true,
        duplicated: created.duplicated,
        itemId: created.itemId,
        requestKey: created.requestKey,
        file: created.file ?? null,
        message: created.duplicated
          ? "Ja teníem registrada aquesta sol·licitud. En breu ens posarem en contacte."
          : "Hem rebut la teva sol·licitud. Et respondrem en menys de 24h laborables.",
      };
    } catch (error) {
      throwSafePriceRequestError(error, requestId, logError);
    }
  };
}

export { classifyPriceRequestError };
