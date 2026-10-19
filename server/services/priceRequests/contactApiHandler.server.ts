import { randomUUID } from "node:crypto";
import {
  createError, getHeader, readBody, setResponseHeader, setResponseStatus,
  type H3Event,
} from "h3";
import {
  contactPayloadSchema, normalizeContactAliases, CONTACT_SUBMISSION_ERROR,
} from "../../../shared/schemas/contact";
import { isConfirmedPriceRequestResponse } from "../../../utils/priceRequestResponse";
import { classifyPriceRequestError } from "./priceRequestApiHandler.server";

type Dependencies = {
  createPriceRequest: (event: H3Event, input: any) => Promise<unknown>;
  getClientIp: (event: H3Event) => string;
  ipHash: (ip: string) => string;
  rateLimit: (key: string, limit: number, seconds: number) => Promise<{
    ok: boolean; retryAfterSec?: number;
  }>;
  normalizeTracking: (input: any) => any;
  createRequestId?: () => string;
  logError?: (message: string, metadata: Record<string, unknown>) => void;
};

function safeMetadata(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(value)
    ? value : null;
}

export function createContactApiHandler(dependencies: Dependencies) {
  return async (event: H3Event) => {
    const requestId = (dependencies.createRequestId || randomUUID)();
    // Reuse the shared service's correlation header and log context.
    event.context.priceRequestRequestId = requestId;
    setResponseHeader(event, "x-request-id", requestId);

    try {
      const body = await readBody(event);
      if (typeof body?.website === "string" && body.website.trim()) {
        return { ok: false, message: CONTACT_SUBMISSION_ERROR };
      }

      const parsed = contactPayloadSchema.safeParse(normalizeContactAliases(body));
      if (!parsed.success) {
        throw createError({ statusCode: 400, message: "Invalid contact data" });
      }
      const p = parsed.data;
      const limit = await dependencies.rateLimit(
        `contact:${dependencies.ipHash(dependencies.getClientIp(event) || "unknown")}`,
        10, 600,
      );
      if (!limit.ok) {
        if (limit.retryAfterSec) setResponseHeader(event, "retry-after", limit.retryAfterSec);
        throw createError({ statusCode: 429, message: "Rate limited" });
      }

      const sourceUrl = p.sourceUrl || getHeader(event, "referer")?.slice(0, 500) || "";
      const productName = p.producto || "Consulta web";
      const tracking = dependencies.normalizeTracking({
        tracking: p.tracking ?? null,
        utm: p.utm ?? null,
        sourceUrl,
        categorySlug: "contacte",
        productSlug: null,
        formType: "contact",
      });
      const created = await dependencies.createPriceRequest(event, {
        name: p.nombre,
        email: p.email,
        phone: p.telefono ?? "",
        company: p.empresa || undefined,
        message: p.consulta,
        categorySlug: "contacte",
        product: { name: productName, slug: null, sku: null, url: sourceUrl || null },
        extras: {
          formType: "contact",
          origin: p.origen || "contact_form",
          sourceUrl: tracking.sourceUrl || sourceUrl || null,
          productName,
          postalCode: p.codigoPostal || null,
        },
        consent: p.consent,
        sourceUrl: tracking.sourceUrl || sourceUrl,
        utm: p.utm ?? null,
        tracking,
        initialStatus: "Nova",
        attachment: null,
        fileKind: "other",
      });

      if (!isConfirmedPriceRequestResponse(created)) {
        throw new Error("Incomplete contact creation response");
      }
      setResponseStatus(event, created.duplicated ? 200 : 201);
      return {
        ok: true,
        duplicated: created.duplicated,
        item: { id: created.itemId, requestKey: created.requestKey },
        message: created.duplicated
          ? "Ja teníem registrada aquesta consulta. En breu ens posarem en contacte."
          : "Hem rebut la teva consulta. Et respondrem en menys de 24h laborables.",
      };
    } catch (error) {
      const safe = classifyPriceRequestError(error);
      const errorCode = safe.errorCode.replace(/^PRICE_REQUEST_/, "CONTACT_");
      (dependencies.logError || console.error)("[CONTACT][API ERROR]", {
        requestId,
        errorCode,
        statusCode: safe.statusCode,
        upstreamStatus: safe.upstreamStatus,
        upstreamCode: safeMetadata(safe.upstreamCode),
        upstreamRequestId: safeMetadata(safe.upstreamRequestId),
      });
      throw createError({
        statusCode: safe.statusCode,
        message: safe.userMessage,
        data: { errorCode, requestId },
      });
    }
  };
}
